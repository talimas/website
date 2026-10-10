// This stays relative to the Quartz checkout so the locally linked plugin uses
// Quartz's single Preact instance without needing its own node_modules tree.
import { h } from "../../node_modules/preact/dist/preact.mjs"

// The top of every page: a low arch holding a dithered sky, the town's name and
// a main street of pixel buildings (one per section), with nameplates beneath.
//
// Options (quartz.config.yaml):
//   lots: [{ building, name, label, slug }, …]   building is one of
//         hall | press | square | workshop | greenhouse | house
// A lot whose slug has no page yet is drawn but not linked.

const DEFAULT_LOTS = [
  { building: "hall", name: "Town Hall", label: "home", slug: "index" },
  { building: "press", name: "The Press", label: "journal", slug: "journal" },
  { building: "square", name: "The Square", label: "thoughts", slug: "thoughts" },
  { building: "workshop", name: "The Workshop", label: "projects", slug: "workshop" },
  { building: "greenhouse", name: "The Greenhouse", label: "garden", slug: "garden" },
  { building: "house", name: "Visitor Centre", label: "about", slug: "about" },
]

const CSS = `
.town-masthead{min-width:0}
.town-masthead canvas{display:block;width:100%;image-rendering:pixelated}
.town-banner{position:relative;overflow:hidden;aspect-ratio:1040/270;border:1px solid var(--dark);border-bottom:0;border-radius:50% 50% 0 0/100% 100% 0 0}
.town-sky{position:absolute;inset:0;height:100%}
.town-street-scroll{position:absolute;left:0;right:0;bottom:0;overflow-x:auto;overflow-y:hidden;scrollbar-width:none}
.town-street-scroll::-webkit-scrollbar{display:none}
.town-street-inner{position:relative;box-sizing:border-box;width:max(100%,900px)}
.town-street-inner canvas{height:180px}
.town-lots{position:absolute;inset:0;display:grid;grid-template-columns:repeat(6,1fr)}
.town-lots>*{display:block;background:none!important;padding:0!important;border-radius:0!important}
.town-plates{display:grid;grid-template-columns:repeat(6,1fr);border-top:1px solid var(--dark);border-bottom:var(--rule)}
.town-plates>*{padding:4px 2px 5px;text-align:center;line-height:1.2;text-decoration:none;background:none!important;border-radius:0!important}
.town-plates>*+*{border-left:var(--rule)}
.town-plates b{display:block;color:var(--dark);font:400 21px/1 var(--town-display,var(--headerFont))}
.town-plates i{font:9px/1.3 var(--pixel);font-style:normal;text-transform:uppercase;letter-spacing:.04em;color:var(--gray)}
.town-plates a:hover{background:var(--highlight)!important}
.town-plates .on,.town-plates a.on:hover{background:var(--town-warm)!important}
.town-plates .on b,.town-plates .on i{color:var(--town-ink)}
.town-plates .soon{opacity:.55}
@media (max-width:800px){
.town-banner{aspect-ratio:auto;height:152px;border-radius:50% 50% 0 0/44px 44px 0 0}
.town-street-inner{width:max(100%,540px);padding:0 10px}
.town-street-inner canvas{height:90px}
.town-lots{inset:0 10px}
.town-plates{display:flex;justify-content:space-between}
.town-plates>*{flex:1 1 auto;padding:9px 3px 8px}
.town-plates>*+*{border-left:0}
.town-plates b{display:none}
.town-plates i{color:var(--dark);font:600 13.5px/1.3 var(--bodyFont);letter-spacing:0;text-transform:capitalize}
}
`

// Runs in the browser. Kept as a real function so it stays readable; it is
// serialised into the page below.
function runtime() {
  const B4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
  const parse = (v) => {
    v = String(v).trim()
    if (v[0] === "#") {
      if (v.length === 4) v = "#" + [...v.slice(1)].map((c) => c + c).join("")
      return [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16))
    }
    return (v.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map(Number)
  }
  const css = (k) => `rgb(${k[0]},${k[1]},${k[2]})`
  const lum = (k) => 0.3 * k[0] + 0.59 * k[1] + 0.11 * k[2]
  const grey = (v) => { v = Math.round(Math.max(0, Math.min(1, v)) * 255); return `rgb(${v},${v},${v})` }
  const rng = (seed) => () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }

  function dither(c, ink, paper) {
    const x = c.getContext("2d"), w = c.width, h = c.height, d = x.getImageData(0, 0, w, h), p = d.data
    for (let y = 0; y < h; y++) for (let X = 0; X < w; X++) {
      const i = (y * w + X) * 4, v = (p[i] * 0.3 + p[i + 1] * 0.59 + p[i + 2] * 0.11) / 255
      const k = v > (B4[(y & 3) * 4 + (X & 3)] + 0.5) / 16 ? paper : ink
      p[i] = k[0]; p[i + 1] = k[1]; p[i + 2] = k[2]; p[i + 3] = 255
    }
    x.putImageData(d, 0, 0)
  }
  function stamp(c, text, font, cx, cy, ink, paper) { // hard-edged lettering with a paper halo
    const o = document.createElement("canvas"); o.width = c.width; o.height = c.height
    const ox = o.getContext("2d"); ox.font = font; ox.textAlign = "center"; ox.textBaseline = "middle"; ox.lineJoin = "round"
    ox.lineWidth = 6; ox.strokeStyle = "#f00"; ox.strokeText(text, cx, cy); ox.fillStyle = "#00f"; ox.fillText(text, cx, cy)
    const s = ox.getImageData(0, 0, o.width, o.height).data, x = c.getContext("2d"), d = x.getImageData(0, 0, c.width, c.height), p = d.data
    for (let i = 0; i < s.length; i += 4) if (s[i + 3] > 110) { const k = s[i + 2] > s[i] ? ink : paper; p[i] = k[0]; p[i + 1] = k[1]; p[i + 2] = k[2] }
    x.putImageData(d, 0, 0)
  }
  function hills(x, w, h, base, amp, tone, f) {
    x.fillStyle = grey(tone); x.beginPath(); x.moveTo(0, h)
    for (let i = 0; i <= w; i += 2) x.lineTo(i, base - Math.sin(i / f) * amp - Math.sin(i / (f * 0.37) + 1) * amp * 0.4)
    x.lineTo(w, h); x.fill()
  }
  // Pixel pen: whole canvas pixels only. x is relative to the building's centre line, y is height above the ground.
  function pen(x, cx, ground, ink, paper, lit) {
    const I = css(ink)
    const d = {
      P: css(paper), W: lit,
      box(a, b, w, h, col = I) { x.fillStyle = col; x.fillRect(cx + a, ground - b - h, w, h) },
      gable(l, r, base, h, col = I) { for (let i = 0; i < h; i++) { const half = Math.round(((r - l) / 2) * (1 - i / h)); d.box(Math.round((l + r) / 2) - half, base + i, half * 2, 1, col) } },
      saw(l, w, base, h, col = I) { for (let i = 0; i < h; i++) d.box(l, base + i, Math.max(1, Math.round(w * (1 - i / h))), 1, col) },
      disc(a, b, r, col = I) { for (let i = -r; i <= r; i++) { const half = Math.round(Math.sqrt(r * r - i * i)); d.box(a - half, b + i, half * 2 + 1, 1, col) } },
      arch(l, base, w, h, col = I) { const r = w / 2; d.box(l, base, w, h - r, col); for (let i = 0; i < r; i++) { const half = Math.round(Math.sqrt(r * r - i * i)); d.box(l + r - half, base + h - r + i, half * 2, 1, col) } },
    }
    return d
  }
  const BUILDINGS = {
    hall(d) { // town hall: clock tower over a wide hall
      d.box(-28, 0, 56, 34); d.box(-8, 34, 16, 26); d.gable(-11, 11, 60, 12); d.box(-1, 72, 2, 5)
      d.disc(0, 48, 4, d.W); d.box(0, 48, 1, 3); d.box(0, 48, 3, 1)
      d.arch(-5, 0, 10, 12, d.P)
      d.box(-22, 18, 7, 9, d.W); d.box(15, 18, 7, 9, d.W); d.box(-22, 5, 7, 8, d.W); d.box(15, 5, 7, 8, d.W)
    },
    press(d) { // the press: pediment over tall windows
      d.box(-36, 0, 72, 3); d.box(-31, 3, 62, 30); d.gable(-36, 36, 33, 20); d.disc(0, 40, 3, d.W)
      d.box(-25, 7, 8, 22, d.W); d.box(-14, 7, 8, 22, d.W); d.box(6, 7, 8, 22, d.W); d.box(17, 7, 8, 22, d.W)
      d.box(-3, 3, 6, 17, d.P)
    },
    square(d) { // the square: a bandstand with a lantern
      d.box(-27, 0, 54, 10); for (const x of [-21, -8, 5, 18]) d.box(x, 10, 3, 26)
      d.box(-21, 20, 42, 3); d.gable(-26, 26, 36, 18); d.box(-1, 54, 2, 8); d.box(-3, 27, 6, 6, d.W)
    },
    workshop(d) { // the workshop: sawtooth roof, chimney, drifting smoke
      d.box(-31, 0, 62, 28); for (const x of [-31, -15, 1]) d.saw(x, 16, 28, 14)
      d.box(20, 28, 7, 26)
      d.box(27, 56, 5, 3); d.box(28, 59, 3, 1); d.box(26, 57, 1, 1)
      d.box(32, 60, 7, 4); d.box(33, 64, 5, 1); d.box(31, 61, 1, 2); d.box(39, 61, 1, 2)
      d.box(40, 64, 9, 4); d.box(42, 68, 6, 2); d.box(39, 65, 1, 2); d.box(49, 65, 2, 2); d.box(43, 63, 4, 1)
      d.box(-24, 0, 16, 17, d.P); d.box(0, 10, 24, 10, d.W)
    },
    greenhouse(d) { // the greenhouse: an arched glasshouse
      d.arch(-28, 0, 56, 56); d.arch(-26, 0, 52, 54, d.W)
      // each glazing bar runs from the ground right up into the frame, following the same stepped arch
      const reach = (x0) => { const m = Math.max(x0 + 2, -x0); let i = 27; while (i > 0 && Math.round(Math.sqrt(784 - i * i)) < m) i--; return 29 + i }
      for (const x0 of [-14, -1, 12]) d.box(x0, 0, 2, reach(x0))
      d.box(-26, 14, 52, 2); d.box(-26, 28, 52, 2); d.box(-5, 0, 10, 14)
    },
    house(d) { // visitor centre: a gabled house with a signpost
      d.box(9, 38, 6, 12); d.box(-19, 0, 38, 29); d.gable(-24, 24, 29, 21)
      d.box(-4, 0, 8, 16, d.P); d.box(-15, 14, 7, 9, d.W); d.box(8, 14, 7, 9, d.W)
      d.box(-34, 0, 2, 36); d.box(-41, 36, 16, 13); d.box(-39, 38, 12, 9, d.W); d.box(-34, 44, 2, 2); d.box(-34, 39, 2, 4)
    },
  }

  let cleanup
  function setup() {
    cleanup && cleanup()
    cleanup = undefined
    const root = document.querySelector(".town-masthead")
    if (!root) return
    const sky = root.querySelector(".town-sky"), street = root.querySelector(".town-street")
    const scroller = root.querySelector(".town-street-scroll"), lots = [...root.querySelectorAll(".town-lots > *")]
    let hover = -1

    function colours() {
      const cs = getComputedStyle(document.documentElement), v = (n) => cs.getPropertyValue(n)
      const a = parse(v("--dark")), b = parse(v("--light"))
      const [ink, paper] = lum(a) < lum(b) ? [a, b] : [b, a]
      const font = (v("--town-display") || v("--headerFont") || "serif").split(",")[0].trim().replace(/^["']|["']$/g, "")
      return { ink, paper, lit: v("--town-light").trim() || css(paper), font }
    }
    function paintSky() { // evening sky inside the arch, dithered to the two page tones, with one lit moon
      const { ink, paper, lit, font } = colours(), box = sky.getBoundingClientRect()
      sky.width = Math.max(120, Math.round(box.width / 2)); sky.height = Math.max(40, Math.round(box.height / 2))
      const x = sky.getContext("2d"), w = sky.width, h = sky.height, r = rng(4)
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, grey(0.42)); g.addColorStop(0.8, grey(0.97)); x.fillStyle = g; x.fillRect(0, 0, w, h)
      x.fillStyle = grey(1); for (let i = 0; i < 40; i++) x.fillRect(Math.floor(r() * w), Math.floor(r() * h * 0.5), 1, 1)
      hills(x, w, h, h * 0.8, 6, 0.82, 47)
      dither(sky, ink, paper)
      pen(x, Math.round(w * 0.2), Math.round(h * 0.58), ink, paper, lit).disc(0, 0, Math.round(h * 0.085), lit)
      const size = Math.min(36, Math.floor(w / 7.4))
      stamp(sky, sky.dataset.title || "", `${size}px "${font}", serif`, w / 2, h < 100 ? 19 : h * 0.27, ink, paper)
      x.fillStyle = css(ink); x.fillRect(0, h - 2, w, 2)
    }
    function paintStreet() { // the buildings, on their own strip so the street can be swiped along on a phone
      const { ink, paper, lit } = colours(), box = street.getBoundingClientRect()
      street.width = Math.max(240, Math.round(box.width / (box.height < 120 ? 1 : 2))); street.height = 90 // on a phone, one canvas pixel per screen pixel
      const x = street.getContext("2d"), w = street.width, h = street.height
      x.clearRect(0, 0, w, h)
      lots.forEach((lot, i) => {
        const draw = BUILDINGS[lot.dataset.building] || BUILDINGS.house
        const on = lot.classList.contains("on") || i === hover
        draw(pen(x, Math.round(((i + 0.5) * w) / lots.length), h - 2, ink, paper, on ? lit : css(paper)))
      })
      x.fillStyle = css(ink); x.fillRect(0, h - 2, w, 2)
    }
    const paint = () => { paintSky(); paintStreet() }
    function centre() { // bring the current building into the middle of the arch
      const lot = root.querySelector(".town-lots .on")
      if (!lot || scroller.scrollWidth <= scroller.clientWidth) return
      const a = lot.getBoundingClientRect(), b = scroller.getBoundingClientRect()
      scroller.scrollLeft += a.left + a.width / 2 - (b.left + b.width / 2)
    }

    lots.forEach((lot, i) => {
      lot.onmouseenter = () => { hover = i; paintStreet() }
      lot.onmouseleave = () => { hover = -1; paintStreet() }
    })
    // On a phone, the smaller side blocks fold down to their heading; tap to open.
    document.querySelectorAll(".sidebar .explorer > button.desktop-explorer, .sidebar .town-plot > h4").forEach((head) => {
      head.onclick = () => head.parentElement.classList.toggle("town-open")
    })

    const onResize = () => { paint(); centre() }
    const onTheme = () => requestAnimationFrame(paint) // light/dark toggle: redraw in the new colours
    window.addEventListener("resize", onResize)
    document.addEventListener("themechange", onTheme)
    paint(); centre()
    if (document.fonts && document.fonts.load) document.fonts.load(`36px "${colours().font}"`).then(paintSky).catch(() => {})
    cleanup = () => { window.removeEventListener("resize", onResize); document.removeEventListener("themechange", onTheme) }
  }
  document.addEventListener("nav", setup)
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup, { once: true })
  else setup()
}

const rootOf = (slug) => {
  const up = String(slug || "index").split("/").filter(Boolean).slice(0, -1)
  return up.length ? up.map(() => "..").join("/") : "."
}

export function TownMasthead(opts = {}) {
  const lots = Array.isArray(opts.lots) && opts.lots.length ? opts.lots : DEFAULT_LOTS
  function Component({ fileData, allFiles, cfg, displayClass }) {
    const here = String(fileData?.slug ?? "index").toLowerCase()
    const slugs = (allFiles ?? []).map((f) => String(f.slug ?? "").toLowerCase())
    const root = rootOf(fileData?.slug)
    const resolved = lots.map((lot) => {
      const s = String(lot.slug).toLowerCase()
      const home = s === "index"
      const exists = home || slugs.some((x) => x === s || x === `${s}/index` || x.startsWith(`${s}/`))
      const on = home ? here === "index" : here === s || here.startsWith(`${s}/`)
      return { ...lot, exists, on, href: home ? `${root}/` : `${root}/${s}` }
    })
    const cls = (l, extra) => [extra, l.on ? "on" : "", l.exists ? "" : "soon"].filter(Boolean).join(" ") || undefined
    return h(
      "div",
      { class: [displayClass, "town-masthead"].filter(Boolean).join(" ") },
      h(
        "div",
        { class: "town-banner" },
        h("canvas", { class: "town-sky", "data-title": opts.title ?? cfg?.pageTitle ?? "" }),
        h(
          "div",
          { class: "town-street-scroll" },
          h(
            "div",
            { class: "town-street-inner" },
            h("canvas", { class: "town-street" }),
            h(
              "div",
              { class: "town-lots" },
              resolved.map((l) =>
                l.exists
                  ? h("a", { href: l.href, class: cls(l), "data-building": l.building, "aria-label": l.name, "data-no-popover": "true" })
                  : h("span", { class: cls(l), "data-building": l.building, title: `${l.name}: not built yet` }),
              ),
            ),
          ),
        ),
      ),
      h(
        "nav",
        { class: "town-plates", "aria-label": "Sections" },
        resolved.map((l) =>
          l.exists
            ? h("a", { href: l.href, class: cls(l), "data-no-popover": "true" }, h("b", null, l.name), h("i", null, l.label))
            : h("span", { class: cls(l), title: "Not built yet" }, h("b", null, l.name), h("i", null, l.label)),
        ),
      ),
    )
  }
  Component.displayName = "TownMasthead"
  Component.css = CSS
  Component.afterDOMLoaded = `(${runtime.toString()})()`
  return Component
}
