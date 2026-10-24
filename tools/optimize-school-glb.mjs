// Re-creates public/models/school-v2.glb / school-mobile-v2.glb from the previous
// exports. Needs (outside this repo, e.g. a temp folder): npm i @gltf-transform/core@4
// @gltf-transform/extensions@4 @gltf-transform/functions@4 draco3dgltf meshoptimizer
// After re-exporting, bump the -vN filename (files are cached as immutable).
// node opt.mjs <in.glb> <out.glb> <desktop|mobile>
// Simplifies only the few over-dense meshes, drops the robot the site hides
// anyway, then re-encodes with Draco. Everything else is left untouched.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, prune, draco, simplifyPrimitive } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import draco3d from 'draco3dgltf';

const [input, output, profile] = process.argv.slice(2);
const RATIOS = {
  desktop: { 'flower.001': 0.4, Box007: 0.25, 'Light_Upper_Light-Upper_1.001': 0.35, polySurface1: 0.5 },
  mobile: { 'flower.001': 0.35, Box007: 0.2, 'Light_Upper_Light-Upper_1.001': 0.3, polySurface1: 0.4 },
}[profile];

const ERRORS = { Box007: Number(process.env.BOX_ERR || 0.004), 'Light_Upper_Light-Upper_1.001': Number(process.env.BOX_ERR || 0.004) };
await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(),
  'draco3d.encoder': await draco3d.createEncoderModule(),
});
const doc = await io.read(input);
const root = doc.getRoot();

const count = () => root.listMeshes().reduce((s, m) => s + m.listPrimitives().reduce((t, p) => t + p.getAttribute('POSITION').getCount(), 0), 0);
console.log('vertices before', count());

for (const node of root.listNodes()) {
  if (node.getName() === 'Robot.025') { node.dispose(); console.log('removed Robot.025'); }
}
await doc.transform(weld());
for (const node of root.listNodes()) {
  const ratio = RATIOS[node.getName()];
  const mesh = node.getMesh();
  if (!ratio || !mesh) continue;
  for (const prim of mesh.listPrimitives()) {
    const before = prim.getAttribute('POSITION').getCount();
    simplifyPrimitive(prim, { simplifier: MeshoptSimplifier, ratio, error: ERRORS[node.getName()] ?? 0.004, lockBorder: false });
    console.log(node.getName(), before, '->', prim.getAttribute('POSITION').getCount());
  }
}
await doc.transform(prune(), draco({ method: 'edgebreaker', quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }));
console.log('vertices after', count());
await io.write(output, doc);
