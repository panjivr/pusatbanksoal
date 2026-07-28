# PusatBankSoal.id — Brand & Design Contract

The single source of truth for every page. All styling lives in `assets/style.css`.
Do not hardcode brand colors — use the tokens below. Do not rename any existing CSS
class or custom property; values are managed centrally.

---

## Positioning (approved line)

> **Platform Tryout & Bank Soal berbasis AI #1 untuk seleksi CPNS, PPPK, SNBT/UTBK, Kedinasan, BUMN, dan TNI/POLRI.**

Personality: kredibel, modern, tajam, premium. Premium fintech/EdTech — never a crypto clone.

---

## Palette

| Token | Hex | Usage |
|---|---|---|
| `--primary` | `#fcd535` | Signature gold. Primary CTAs, accents, key numbers. |
| `--primary-active` | `#f0b90b` | Gold pressed/hover, gradient base. |
| `--accent2` | `#5b8cff` | Secondary indigo accent — variety, links, secondary CTAs. |
| `--accent2-active` | `#3f6fe6` | Indigo pressed/hover. |
| `--canvas` | `#0a0e17` | Page background (deep navy). Also `theme_color`. |
| `--card` | `#141a26` | Card / panel base surface. |
| `--elevated` | `#1e2636` | Raised surface, inputs, hover fills. |
| `--hair-dark` | `#26304a` | Primary 1px borders / dividers. |
| `--hair-soft` | `#1c2438` | Subtle inner borders. |
| `--body` | `#e7eaf0` | Body text (AA on canvas). |
| `--on-dark` | `#f5f7fb` | Headings / high-emphasis text. |
| `--muted` | `#8892a6` | Secondary text (AA on canvas). |
| `--muted-strong` | `#aeb6c6` | Lead paragraphs / stronger secondary. |
| `--on-primary` | `#0a0e17` | Text on gold surfaces. |
| `--up` | `#22c55e` | Positive / correct / live. |
| `--down` | `#f6465d` | Negative / wrong. |
| `--info` | `#5b8cff` | Focus outline / info. |

Gradient tokens: `--grad-brand` (gold→indigo, logo/marks), `--grad-gold` (gold sheen, text),
`--grad-surface` (card interior). Elevation: `--sh-sm`, `--sh-md`, `--sh-lg`, `--sh-glow`, `--sh-glow2`.

---

## Typography

- **Display / headings (h1–h4):** `Plus Jakarta Sans` via `--display`.
- **Body / UI:** `Inter` via `--font`.
- **Numbers:** `IBM Plex Mono` via `--num` (add `.num` class).

**Exact Google Fonts `<link>` — put this in every page `<head>`:**

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&family=IBM+Plex+Mono:wght@500;600;700&display=swap" rel="stylesheet">
```

---

## Site-wide `<head>` asset tags

Paths are root-relative (site is served from `/`). Include on every page:

```html
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0a0e17">
<!-- Social -->
<meta property="og:image" content="https://pusatbanksoal.id/assets/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
```

---

## Reusable premium components (new classes)

All defined in `assets/style.css`. Existing classes (`.card`, `.btn-primary`, `.badge`, `.chip`,
`.glass`, `.grad`, `.rule-glow`, …) keep working and were upgraded in place.

| Class | Use | Snippet |
|---|---|---|
| `.gradient-text` | Gold→indigo headline word. | `<h2>Belajar <span class="gradient-text">lebih tajam</span></h2>` |
| `.section-eyebrow` | Uppercase kicker w/ gold rule above a heading. | `<span class="section-eyebrow">Fitur AI</span>` |
| `.trust-bar` | Row of proof points / partner labels on a band. | `<div class="trust-bar"><span>1.495+ soal</span><span>9 kategori</span></div>` |
| `.stat-chip` | Compact KPI pill. | `<div class="stat-chip"><b>1.495+</b><span>soal kurasi</span></div>` |
| `.testimonial` | Quote card with author row. | `<div class="testimonial"><p>"..."</p><div class="who"><div class="avatar">A</div><div><b>Andi</b><span>Lulus CPNS 2025</span></div></div></div>` |
| `.badge-new` | Gold "NEW"/highlight badge. | `<span class="badge-new">Baru</span>` |
| `.glass-card` | Frosted premium feature tile. | `<div class="glass-card">…</div>` |
| `.divider-glow` | Section separator with indigo+gold glow. | `<hr class="divider-glow">` |

Supporting additions you may use: `.btn-accent2` (indigo CTA), `.badge-b` (indigo badge), `.accent2` (indigo text).

---

## Brand voice

- **Bahasa Indonesia**, percaya diri, konkret. Fokus manfaat nyata bagi peserta seleksi.
- Hindari hype dan superlatif kosong. Jangan mengklaim angka yang tidak benar.
- Gunakan istilah yang familiar: tryout, bank soal, pembahasan, analisis nilai, passing grade.

### Honest numbers only

The real bank has **1.495 soal terkurasi across 9 kategori**. Do **NOT** invent figures like
"500.000+ soal". Approved framing:

- "**1.495+ soal kurasi**, terus bertambah"
- "9 kategori: CPNS, PPPK, SNBT/UTBK, Kedinasan, BUMN, TNI/POLRI, …"

Ratings, user counts, and "lulus" testimonials must be real or clearly illustrative — never fabricated as fact.
