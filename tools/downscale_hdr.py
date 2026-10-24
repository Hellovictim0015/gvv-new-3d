# Downscales an RGBE .hdr 2x (used for public/hdri/venice_sunset_512.hdr).
# Usage: python tools/downscale_hdr.py in.hdr out.hdr  (needs numpy)
# Downscale a Radiance .hdr (RGBE) 2x by averaging in linear float; writes RLE RGBE.
import sys, re, numpy as np
src, dst = sys.argv[1], sys.argv[2]
data = open(src, 'rb').read()
head_end = data.index(b'\n\n') + 2
res_end = data.index(b'\n', head_end)
m = re.match(rb'-Y (\d+) \+X (\d+)', data[head_end:res_end]); H, W = int(m[1]), int(m[2])
buf = memoryview(data)[res_end + 1:]; pos = 0
img = np.zeros((H, W, 4), np.uint8)
for y in range(H):
    assert buf[pos] == 2 and buf[pos + 1] == 2, 'expects new-style RLE'
    pos += 4
    for c in range(4):
        x = 0
        while x < W:
            n = buf[pos]; pos += 1
            if n > 128:
                n -= 128; img[y, x:x + n, c] = buf[pos]; pos += 1
            else:
                img[y, x:x + n, c] = np.frombuffer(buf[pos:pos + n], np.uint8); pos += n
            x += n
e = img[..., 3].astype(np.int32)
f = np.where(e[..., None] > 0, img[..., :3] * np.ldexp(1.0, e - 136)[..., None], 0.0)
f = f.reshape(H // 2, 2, W // 2, 2, 3).mean(axis=(1, 3))
H, W = f.shape[:2]
mx = f.max(axis=2)
mant, ex = np.frexp(mx)
scale = np.where(mx > 1e-32, mant * 256.0 / np.where(mx > 1e-32, mx, 1), 0)
rgbe = np.zeros((H, W, 4), np.uint8)
rgbe[..., :3] = np.clip(f * scale[..., None], 0, 255).astype(np.uint8)
rgbe[..., 3] = np.where(mx > 1e-32, ex + 128, 0)
out = bytearray(data[:head_end] + f'-Y {H} +X {W}\n'.encode())
for y in range(H):
    out += bytes([2, 2, W >> 8, W & 255])
    for c in range(4):
        row = rgbe[y, :, c]; x = 0
        while x < W:  # simple RLE: runs >=4 encoded, else literals (max 128)
            run = 1
            while x + run < W and run < 127 and row[x + run] == row[x]: run += 1
            if run >= 4:
                out += bytes([128 + run, row[x]]); x += run
            else:
                start = x; x += run
                while x < W and x - start < 128:
                    r2 = 1
                    while x + r2 < W and r2 < 4 and row[x + r2] == row[x]: r2 += 1
                    if r2 >= 4: break
                    x += 1
                out += bytes([x - start]) + row[start:x].tobytes()
open(dst, 'wb').write(out)
print(W, H, len(out), 'bytes')
