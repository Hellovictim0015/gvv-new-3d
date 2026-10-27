"""Import blog posts and SEO landing pages from the old WordPress site.

Pulls everything from the old site's public WP REST API, keeps only safe content
HTML, downloads the images it uses into public/wp-content/uploads/ (same paths as
the old site, so old image URLs keep working) and writes:

  src/data/blogs.json         - all published blog posts
  src/data/seoLandingPages.json - the footer "Best School in ..." pages + policy pages

Re-run any time before launch to pick up new posts:
  python scripts/import-old-site.py
"""

import html
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from html.parser import HTMLParser

OLD_SITE = "https://www.garimaschool.com"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "src", "data")
PUBLIC_DIR = os.path.join(ROOT, "public")

# Footer keyword pages, kept at their old URLs.
SEO_LANDING_SLUGS = [
    "best-school-in-indore",
    "garima-vidya-vihar-senior-secondary-school-best-cbse-school-in-indore",
    "best-senior-secondary-school-in-indore-3",
    "best-primary-school-in-indore",
    "best-school-near-airport",
    "best-school-in-mp",
    # Other old pages with no new-site equivalent, also kept at their old URLs.
    "student-strength",
    "privacy-policy",
    "terms-and-conditions",
    "refund-cancellation-policy",
    "shipping-and-delivery-policy",
]

UA = {"User-Agent": "Mozilla/5.0 (GVV site migration)"}


def fetch(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return r.read()


def fetch_json(url):
    return json.loads(fetch(url).decode("utf-8"))


def fetch_all(kind):
    items, page = [], 1
    while True:
        batch = fetch_json(f"{OLD_SITE}/wp-json/wp/v2/{kind}?per_page=100&page={page}&status=publish")
        items += batch
        if len(batch) < 100:
            return items
        page += 1


def is_old_site(url):
    host = urllib.parse.urlsplit(url).netloc.lower()
    return host in ("garimaschool.com", "www.garimaschool.com")


downloaded = {}


def localize_upload(url):
    """Download an old-site upload into public/ and return its site-relative path."""
    path = urllib.parse.urlsplit(url).path
    if url in downloaded:
        return downloaded[url]
    dest = os.path.join(PUBLIC_DIR, *urllib.parse.unquote(path).lstrip("/").split("/"))
    if not os.path.exists(dest):
        try:
            data = fetch(url)
        except Exception as e:  # keep going; a missing image shouldn't stop the import
            print(f"  ! could not download {url}: {e}", file=sys.stderr)
            downloaded[url] = None
            return None
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "wb") as f:
            f.write(data)
    downloaded[url] = path
    return path


def localize_link(href):
    if not href or not is_old_site(href):
        return href
    parts = urllib.parse.urlsplit(href)
    if parts.path.startswith("/wp-content/uploads/") and not parts.path.lower().endswith(".pdf"):
        return localize_upload(href) or href
    # Old pages/posts: relative link; next.config redirects map legacy pages.
    path = parts.path.rstrip("/") or "/"
    return path + (f"#{parts.fragment}" if parts.fragment else "")


ALLOWED = {
    "h2", "h3", "h4", "h5", "p", "ul", "ol", "li", "strong", "b", "em", "i", "a", "img",
    "table", "thead", "tbody", "tr", "th", "td", "br", "blockquote", "figure", "figcaption", "iframe",
}
VOID = {"img", "br"}
DROP_WITH_CONTENT = {"script", "style", "noscript", "svg", "form", "button"}


class Sanitizer(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.out = []
        self.skip = 0
        self.stack = []

    def handle_starttag(self, tag, attrs):
        if tag in DROP_WITH_CONTENT:
            self.skip += 1
            return
        if self.skip:
            return
        if tag == "h1":
            tag = "h2"
        if tag == "h6":
            tag = "h5"
        if tag not in ALLOWED:
            return
        a = dict(attrs)
        keep = []
        if tag == "a":
            href = localize_link(a.get("href") or "")
            if not href or href.startswith("#elementor") or href == "#":
                self.stack.append(None)
                return
            keep.append(("href", href))
            if href.startswith("http"):
                keep += [("target", "_blank"), ("rel", "noopener noreferrer")]
        elif tag == "img":
            src = a.get("data-src") or a.get("src") or ""
            if src.startswith("data:"):
                return
            src = localize_link(src)
            if not src:
                return
            keep += [("src", src), ("alt", a.get("alt") or ""), ("loading", "lazy")]
        elif tag == "iframe":
            src = a.get("src") or ""
            if not re.match(r"https://(www\.)?(youtube\.com|youtube-nocookie\.com|player\.vimeo\.com)/", src):
                self.skip += 1
                self.stack.append("iframe-skip")
                return
            keep += [("src", src), ("allowfullscreen", ""), ("loading", "lazy")]
        elif tag in ("td", "th"):
            for k in ("colspan", "rowspan"):
                if a.get(k):
                    keep.append((k, a[k]))
        attr_s = "".join(f' {k}="{html.escape(v, quote=True)}"' if v else f" {k}" for k, v in keep)
        self.out.append(f"<{tag}{attr_s}>")
        if tag not in VOID:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in DROP_WITH_CONTENT:
            self.skip = max(0, self.skip - 1)
            return
        if tag == "iframe" and self.stack and self.stack[-1] == "iframe-skip":
            self.stack.pop()
            self.skip = max(0, self.skip - 1)
            return
        if self.skip:
            return
        tag = {"h1": "h2", "h6": "h5"}.get(tag, tag)
        if tag not in ALLOWED or tag in VOID:
            return
        # Close back to the matching open tag (WordPress markup isn't always balanced).
        if tag in self.stack or (tag == "a" and None in self.stack):
            while self.stack:
                t = self.stack.pop()
                if t is None:
                    if tag == "a":
                        return
                    continue
                self.out.append(f"</{t}>")
                if t == tag:
                    return

    def handle_data(self, data):
        if not self.skip:
            self.out.append(html.escape(data, quote=False))

    def result(self):
        while self.stack:
            t = self.stack.pop()
            if t and t != "iframe-skip":
                self.out.append(f"</{t}>")
        s = "".join(self.out)
        s = re.sub(r"<(p|h[2-5]|li|strong|em|figure)>\s*</\1>", "", s)
        s = re.sub(r">\s+<", ">\n<", s)
        s = re.sub(r"<a [^>]*>\s*(<i>\s*</i>)?\s*</a>", "", s)
        s = re.sub(r"[ \t]*\n\s*", "\n", s)
        return s.strip()


def clean_html(raw):
    p = Sanitizer()
    p.feed(raw)
    p.close()
    return p.result()


def text(raw):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", raw))).strip()


def seo_of(item):
    y = item.get("yoast_head_json") or {}
    title = (y.get("title") or "").replace(" - Garima Vidya Vihar Sr. Sec. School", " | Garima Vidya Vihar")
    image = ((y.get("og_image") or [{}])[0] or {}).get("url")
    return title, y.get("description") or "", image


def main():
    os.makedirs(DATA_DIR, exist_ok=True)

    print("Fetching posts ...")
    posts = fetch_all("posts")
    blogs = []
    for p in posts:
        seo_title, meta, image = seo_of(p)
        title = text(p["title"]["rendered"])
        blogs.append({
            "slug": p["slug"],
            "title": title,
            "date": p["date"][:10],
            "modified": p["modified"][:10],
            "excerpt": text(p["excerpt"]["rendered"]).replace(" […]", "…"),
            "seoTitle": seo_title or f"{title} | Garima Vidya Vihar",
            "metaDescription": meta or text(p["excerpt"]["rendered"])[:160],
            "image": (localize_upload(image) if image and is_old_site(image) else image) or None,
            "html": clean_html(p["content"]["rendered"]),
        })
    blogs.sort(key=lambda b: b["date"], reverse=True)
    with open(os.path.join(DATA_DIR, "blogs.json"), "w", encoding="utf-8") as f:
        json.dump(blogs, f, ensure_ascii=False, indent=1)
    print(f"  {len(blogs)} posts")

    print("Fetching SEO landing pages ...")
    pages = {p["slug"]: p for p in fetch_all("pages")}
    landing = []
    for slug in SEO_LANDING_SLUGS:
        p = pages[slug]
        seo_title, meta, image = seo_of(p)
        body = clean_html(p["content"]["rendered"])
        title = text(p["title"]["rendered"])
        landing.append({
            "slug": slug,
            "title": title,
            "seoTitle": seo_title or f"{title} | Garima Vidya Vihar",
            "metaDescription": meta or text(p["content"]["rendered"])[:160],
            "image": (localize_upload(image) if image and is_old_site(image) else image) or None,
            "html": body,
        })
    with open(os.path.join(DATA_DIR, "seoLandingPages.json"), "w", encoding="utf-8") as f:
        json.dump(landing, f, ensure_ascii=False, indent=1)
    print(f"  {len(landing)} pages")
    print(f"Images downloaded: {sum(1 for v in downloaded.values() if v)}, failed: {sum(1 for v in downloaded.values() if not v)}")


if __name__ == "__main__":
    main()
