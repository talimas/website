// This stays relative to the Quartz checkout so the locally linked plugin uses
// Quartz's single Preact instance without needing its own node_modules tree.
import { h } from "../../node_modules/preact/dist/preact.mjs"

// Who's in town: a register of everyone visiting the site right now. Each visitor is
// given a short traveller's name ("sleepy hermit") worked out from their playhtml
// identity, so everybody sees the same name for the same person, and it sticks between
// visits. Their cursors show on the page too. The live part is playhtml (https://playhtml.fun),
// loaded from a CDN in the visitor's browser; it talks to playhtml's hosted server.
// If that can't be reached the register simply lists you on your own.
//
// Options (quartz.config.yaml): title, version (playhtml release)

const CSS = `
:root{--visitor-0:#a82672;--visitor-1:#0e6a60;--visitor-2:#d9742f;--visitor-3:#6f9a12;--visitor-4:#3a3da8}
:root[saved-theme=dark]{--visitor-0:#f5a3d0;--visitor-1:#86e3ce;--visitor-2:#f2b28c;--visitor-3:#c8f169;--visitor-4:#b2b9f9}
.town-gate .board{background:color-mix(in srgb,var(--dark) 9%,transparent);color:var(--dark);padding:10px 12px 11px;font:10px/1.6 var(--pixel);letter-spacing:.05em;text-transform:uppercase;
clip-path:polygon(0 4px,2px 4px,2px 2px,4px 2px,4px 0,calc(100% - 4px) 0,calc(100% - 4px) 2px,calc(100% - 2px) 2px,calc(100% - 2px) 4px,100% 4px,100% calc(100% - 4px),calc(100% - 2px) calc(100% - 4px),calc(100% - 2px) calc(100% - 2px),calc(100% - 4px) calc(100% - 2px),calc(100% - 4px) 100%,4px 100%,4px calc(100% - 2px),2px calc(100% - 2px),2px calc(100% - 4px),0 calc(100% - 4px))}
.town-gate .board *{color:inherit}
.town-gate .sign{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:7px;border-bottom:1px dotted currentColor}
.town-gate .sign b{font:400 22px/1 var(--pixel);letter-spacing:0}
.town-gate ul{margin:6px 0 0;padding:0;list-style:none}
.town-gate li{display:flex;align-items:center;gap:8px;padding:3px 0}
.town-gate .sq{flex:none;width:8px;height:8px;background:var(--c,currentColor)}
.town-gate .you{margin-left:6px;opacity:.65;white-space:nowrap}
.town-gate .sub{margin:9px 0 0;padding-top:8px;border-top:1px dotted currentColor;opacity:.7}
.town-gate .left li{opacity:.7}
.town-gate .left .sq{background:none;outline:1px solid currentColor;outline-offset:-1px}
.town-gate .left time{margin-left:auto;padding-left:8px}
.town-gate .quiet{opacity:.55}
`

// Runs in the browser; serialised into the page below.
function runtime(VERSION) {
  const G = (window.__townGate ||= { here: new Map(), gone: [], since: Date.now(), live: false, started: false, tick: null })
  const hhmm = (t) => new Date(t).toTimeString().slice(0, 5)
  const safeColour = (c) => (/^(#[0-9a-f]{3,8}|(rgb|hsl)a?\([\d\s.,%/a-z-]+\))$/i.test(String(c)) ? c : "")

  // Travellers' names: two short words. The same identity always gets the same name, here and for everyone else.
  const KIND = "tiny sleepy cozy lost shy merry lucky jolly misty sunny brave quiet dreamy gentle curious little starry cheery kind wee dusty peppy humble nosy".split(" ")
  // Each traveller wears one of the site's own colours (the ones on the map), not a random one.
  // TINT is what the list shows (it follows light/dark); CURSOR is the same family as a fixed colour for their pointer.
  // CURSOR[i] is what travels with the visitor (their pointer colour); the list shows the
  // matching --visitor-i, which has a light and a dark value.
  // magenta, teal, orange, green, indigo
  const CURSOR = ["#c9478f", "#1f9c8c", "#e0915a", "#8fbf2f", "#4b4fc4"]
  const shade = (key) => hash(String(key || "someone"), 97) % CURSOR.length
  const indexOf = (colour) => CURSOR.indexOf(String(colour || "").toLowerCase())
  // Nobody shares a colour while there are colours to spare. Each visitor picks their own:
  // their usual one if it is free, otherwise the next free one. If two people land on the
  // same colour at the same moment, the one whose key sorts later moves along.
  function settleColour(others) {
    const taken = new Set(), mine = G.myIdx
    let clash = false
    for (const o of others) { const i = indexOf(o.colour); if (i < 0) continue; taken.add(i); if (i === mine && String(o.key) < String(G.myKey)) clash = true }
    if (mine !== undefined && !clash) return
    const start = shade(G.myKey)
    let pick = start
    for (let n = 0; n < CURSOR.length; n++) { const i = (start + n) % CURSOR.length; if (!taken.has(i)) { pick = i; break } }
    G.myIdx = pick
    try { if (window.cursors && indexOf(window.cursors.color) !== pick) window.cursors.color = CURSOR[pick] } catch {}
  }
  const WHO = "visitor traveller hermit tourist wayfarer explorer hiker rambler wanderer nomad drifter roamer guest voyager vagabond scout passer-by".split(" ")
  const hash = (str, seed) => { let v = seed >>> 0; for (let i = 0; i < str.length; i++) { v ^= str.charCodeAt(i); v = Math.imul(v, 16777619) >>> 0 } return v }
  const townName = (key) => {
    const k = String(key || "someone")
    return `${KIND[hash(k, 2166136261) % KIND.length]} ${WHO[hash(k, 40503) % WHO.length]}`
  }

  function draw() {
    const root = document.querySelector(".town-gate")
    if (!root) return
    const others = [...G.here.values()].sort((a, b) => a.at - b.at)
    const tint = (o) => { const i = indexOf(o.colour); return `var(--visitor-${i < 0 ? shade(o.key) : i})` }
    const row = (key, colour, extra, tag) => `<li><span class="sq" style="--c:${colour}"></span><span>${townName(key)}${tag || ""}</span>${extra || ""}</li>`
    root.querySelector(".sign b").textContent = String(others.length + 1)
    root.querySelector(".in-town").innerHTML =
      row(G.myKey, `var(--visitor-${G.myIdx ?? shade(G.myKey)})`, "", `<span class="you">(you)</span>`) + others.map((o) => row(o.key, tint(o))).join("")
    root.querySelector(".left").innerHTML = G.gone.length
      ? G.gone.slice(-3).reverse().map((o) => row(o.key, tint(o), `<time>${hhmm(o.left)}</time>`)).join("")
      : `<li class="quiet">${G.live ? "no one has left yet" : "the gate is quiet"}</li>`
  }

  function sync(presences) { // presences: everyone playhtml can see, keyed by connection
    const list = presences instanceof Map ? [...presences.entries()] : Object.entries(presences || {})
    const seen = new Set()
    for (const [id, p] of list) {
      const who = p.playerIdentity || {}
      const colour = (who.playerStyle && who.playerStyle.colorPalette && who.playerStyle.colorPalette[0]) || ""
      if (p.isMe) { G.myColour = colour; G.myKey = who.publicKey || G.myKey; continue }
      seen.add(id)
      const was = G.here.get(id)
      G.here.set(id, { at: was ? was.at : Date.now(), colour, key: who.publicKey || id })
    }
    for (const [id, o] of G.here) if (!seen.has(id)) { G.here.delete(id); G.gone.push({ ...o, left: Date.now() }) }
    if (G.gone.length > 12) G.gone = G.gone.slice(-12)
    if (G.myKey) settleColour([...G.here.values()])
    draw()
  }

  async function start() {
    if (G.started) return
    G.started = true
    try {
      const { playhtml } = await import(`https://unpkg.com/playhtml@${VERSION}/dist/playhtml.es.js`)
      await playhtml.init({
        cursors: {
          enabled: true,
          room: "domain", // one gate for the whole town…
          shouldRenderCursor: (p) => p.page === window.location.pathname, // …but only show cursors on your own page
        },
      })
      G.live = true
      try { // wear the name on your cursor too
        const me = playhtml.presence.getMyIdentity()
        G.myKey = me.publicKey
        if (window.cursors) window.cursors.name = townName(G.myKey)
      } catch {}
      const read = () => sync(playhtml.presence.getPresences())
      playhtml.presence.onPresenceChange("cursor", read)
      read()
      setInterval(read, 5000) // catches quiet departures
    } catch (err) {
      G.live = false
      console.warn("[town gate] live presence unavailable:", err)
    }
    draw()
  }

  function setup() {
    if (!document.querySelector(".town-gate")) return
    draw(); start()
  }
  document.addEventListener("nav", setup)
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup, { once: true })
  else setup()
}

export function TownGate(opts = {}) {
  const version = /^[\w.-]+$/.test(String(opts.version ?? "")) ? String(opts.version) : "2.15.0"
  function Component({ displayClass }) {
    return h(
      "div",
      { class: [displayClass, "town-plot", "town-gate"].filter(Boolean).join(" ") },
      h("h4", null, opts.title ?? "Visitors"),
      h(
        "div",
        { class: "in" },
        h(
          "div",
          { class: "board" },
          h("div", { class: "sign", "aria-live": "polite" }, h("span", null, "in town"), h("b", null, "1")),
          h("ul", { class: "in-town" }),
          h("div", { class: "sub" }, "gone home"),
          h("ul", { class: "left" }),
        ),
      ),
    )
  }
  Component.displayName = "TownGate"
  Component.css = CSS
  Component.afterDOMLoaded = `(${runtime.toString()})(${JSON.stringify(version)})`
  return Component
}
