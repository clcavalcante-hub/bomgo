"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export function ExpandableText({ text, lines = 6 }: { text: string; lines?: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <p
        className={cn("mt-3 leading-relaxed text-muted-foreground", !expanded && "overflow-hidden")}
        style={!expanded ? { display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical" } : undefined}
      >
        {text}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 text-sm font-semibold text-primary underline-offset-2 hover:underline"
      >
        {expanded ? "Ver menos" : "Ver mais"}
      </button>
    </div>
  )
}
