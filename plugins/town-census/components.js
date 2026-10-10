// This stays relative to the Quartz checkout so the locally linked plugin uses
// Quartz's single Preact instance without needing its own node_modules tree.
import { h } from "../../node_modules/preact/dist/preact.mjs"

const rootOf = (slug) => {
  const up = String(slug || "index").split("/").filter(Boolean).slice(0, -1)
  return up.length ? up.map(() => "..").join("/") : "."
}
const tagPath = (tag) => String(tag).split("/").map((s) => s.trim().replace(/\s+/g, "-")).join("/")

// Options (quartz.config.yaml): title, limit (how many tags to list)
export function TownCensus(opts = {}) {
  function Component({ fileData, allFiles, displayClass }) {
    const counts = new Map()
    for (const f of allFiles ?? []) for (const t of f.frontmatter?.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1)
    if (counts.size === 0) return null
    const root = rootOf(fileData?.slug)
    const rows = [...counts].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]))).slice(0, opts.limit ?? 12)
    return h(
      "div",
      { class: [displayClass, "town-plot", "town-census"].filter(Boolean).join(" ") },
      h("h4", null, opts.title ?? "Census"),
      h("div", { class: "in" }, rows.map(([tag, n]) => h("span", { key: tag }, h("a", { href: `${root}/tags/${tagPath(tag)}` }, String(tag)), h("i", null, String(n))))),
    )
  }
  Component.displayName = "TownCensus"
  return Component
}
