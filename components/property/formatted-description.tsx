"use client"

import { useState } from "react"

interface Block {
  type: "heading" | "paragraph"
  text: string
}

function parseBlocks(text: string): Block[] {
  return text
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      if (chunk.startsWith("## ")) {
        return { type: "heading" as const, text: chunk.replace(/^##\s*/, "") }
      }
      return { type: "paragraph" as const, text: chunk }
    })
}

export function FormattedDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  const blocks = parseBlocks(text)

  // Collapsed view: first heading + its first paragraph (or just the first
  // paragraph, if the text has no headings) — enough to preview without a
  // wall of text, expanding to everything on "Ver mais".
  const firstHeadingIndex = blocks.findIndex((b) => b.type === "heading")
  const previewEnd = firstHeadingIndex === -1 ? Math.min(1, blocks.length) : firstHeadingIndex + 2
  const visible = expanded ? blocks : blocks.slice(0, previewEnd)
  const hasMore = blocks.length > previewEnd

  return (
    <div>
      <div className="mt-3 space-y-3">
        {visible.map((block, i) =>
          block.type === "heading" ? (
            <h3 key={i} className="pt-1 font-serif text-lg font-semibold text-foreground first:pt-0">
              {block.text}
            </h3>
          ) : (
            <p key={i} className="leading-relaxed text-muted-foreground">
              {block.text}
            </p>
          ),
        )}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-sm font-semibold text-primary underline-offset-2 hover:underline"
        >
          {expanded ? "Ver menos" : "Ver mais"}
        </button>
      )}
    </div>
  )
}
