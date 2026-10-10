// This stays relative to the Quartz checkout so the locally linked plugin uses
// Quartz's single Preact instance without needing its own node_modules tree.
import { h } from "../../node_modules/preact/dist/preact.mjs"

// Options (quartz.config.yaml):
//   status: one short line shown on the warm bar
//   items:  [{ label: "reading", text: "…" }, …]
export function TownCrier(opts = {}) {
  const items = Array.isArray(opts.items) ? opts.items : []
  function Component({ displayClass }) {
    if (!opts.status && items.length === 0) return null
    return h(
      "div",
      { class: [displayClass, "town-plot", "town-crier"].filter(Boolean).join(" ") },
      h("h4", null, opts.title ?? "Town crier"),
      h(
        "div",
        { class: "in" },
        opts.status ? h("p", { class: "status" }, String(opts.status)) : null,
        items.length
          ? h("dl", null, items.map((it) => [h("dt", null, String(it.label)), h("dd", null, String(it.text))]))
          : null,
      ),
    )
  }
  Component.displayName = "TownCrier"
  return Component
}
