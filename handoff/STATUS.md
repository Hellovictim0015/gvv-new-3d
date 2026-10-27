# Garima Vidya Vihar – Website migration status (27 Oct 2026)

Purani site: https://www.garimaschool.com/  →  Nayi site: https://m.techbytex.in/

## ✅ Ho gaya (admin/API se add kiya, public page par check kiya)

| Page | Kya add hua |
|---|---|
| /fees | 2026-27 fee structure – 6 class groups (installments, annual allocation, total) |
| /academic/books | 15 book list PDFs (Nursery se XII) |
| /mandatory-disclosures | 17 entries: General info, 8 documents (affiliation, society, NOC, RTE, building, fire, self-cert, water), fee/calendar/SMC/PTA/board result, staff summary, infrastructure, SARAS 7.0 PDF – kul 11 PDFs |
| /about/educators | 124 staff (naam, designation, qualification, experience) – purani staff list jaisi |
| /about/gallery-media | Purani gallery ki 50 photos |

## 📦 Developer ke liye taiyar files (is folder mein)

- `blogs_export.json` – purani site ke **123 blog posts** (title, date, full HTML content, SEO title, meta description, featured image, old URL)
- `footer_seo_pages.json` – 7 SEO pages ka content + SEO title/meta (Best School in Indore, Best CBSE School, Best Senior Secondary, Best Primary, Best School near Airport, Best School in MP, Affordable Fees)
- `redirects_301.csv` / `next_redirects.js` – 161 purane URLs → naye URLs (48 pages + 123 blogs)
- `robots.txt` – nayi site ke liye

## ❌ Abhi possible nahi hua (code/deploy chahiye – admin mein option nahi hai)

1. **Blogs (123)** – admin mein Articles/Blog section hi nahi hai; /articles par "coming soon" hard-coded hai. Blog listing + `/articles/[slug]` page banana padega, phir `blogs_export.json` se import.
2. **Footer SEO pages (7)** – inke liye alag page/route nahi hai; footer links general pages par jaate hain. Inhe **purane URL par hi** (jaise `/best-school-in-indore`) banana chahiye, content `footer_seo_pages.json` mein hai.
3. **301 redirects** – `next.config.js` mein `next_redirects.js` lagana hoga. Blogs ka redirect tabhi kaam karega jab `/articles/[slug]` ban jaayega.
4. **sitemap.xml aur robots.txt** – dono abhi 404 de rahe hain. Next.js mein `app/sitemap.ts` + `app/robots.ts` banane honge.
5. **Syllabus, Pedagogy, Courses, Evaluation, Date Sheet, Board Results** – purani site par in naamon ke pages hi nahi the, isliye copy karne ko content nahi mila. School se content/PDF chahiye.
6. **Purane pages jinka naya page nahi hai**: Privacy Policy, Terms & Conditions, Refund/Cancellation Policy, Shipping & Delivery Policy, Fee Payment, Student Strength. (Payment gateway ke liye policy pages zaroori hote hain.)
7. **TC Download** – purani site par Student PEN number se TC search hota tha; nayi site par ye feature nahi hai.
8. **Fees page heading** "2027-28" likha hai jabki data 2026-27 ka hai – code mein hard-coded hai. Purane fee page ke "Note" points bhi nayi page par nahi dikhte.
9. **Staff list ke kuch designation adhure** hain (jaise "VICE", "PGT(Co-") – purani site par bhi aise hi kate hue the; school se sahi list le kar admin mein edit kar sakte hain.
10. **Gallery photos ke title/category** – purani gallery mein caption nahi the, isliye sab "Campus" category mein "Campus Life" title ke saath hain.
11. **Client ka "attached document"** (point-wise changes) humein nahi mila – woh bhejein to baaki points bhi karenge.

## ⚠️ Zaroori – Security issue (live karne se pehle fix karein)

- **Admin API bina login ke chal raha hai.** `/api/books`, `/api/fees`, `/api/page-entries`, `/api/gallery` par koi bhi bina password ke data add/edit/delete kar sakta hai (humne isi tarah upload kiya).
- **`/api/admission-enquiry` public hai** – parents/students ka naam, phone, message koi bhi padh sakta hai.
- `/admin` page bhi bina login ke 200 deta hai. Server-side auth (session/JWT check) har admin API par lagana zaroori hai.
