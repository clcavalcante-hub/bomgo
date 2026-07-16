"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { Send, Sparkles, X } from "lucide-react"
import { useApp } from "@/components/providers/app-providers"
import { askSofia } from "@/lib/services/sofia-service"
import type { SofiaMessage } from "@/lib/types"
import { cn } from "@/lib/utils"

const SUGGESTIONS = [
  "Quero praia com a família em janeiro",
  "Apartamento pet friendly em Fortaleza",
  "Onde ver o pôr do sol em Jericoacoara?",
]

export function SofiaConcierge() {
  const { isSofiaOpen, openSofia, closeSofia } = useApp()
  const [messages, setMessages] = useState<SofiaMessage[]>([
    {
      id: "welcome",
      role: "sofia",
      content:
        "Oi, eu sou a Sofia, sua concierge de viagens. Me conte o que você procura e eu encontro o lugar perfeito para a sua próxima estadia.",
    },
  ])
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, typing])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || typing) return
    const userMessage: SofiaMessage = { id: crypto.randomUUID(), role: "user", content: trimmed }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setTyping(true)
    const reply = await askSofia(trimmed)
    setTyping(false)
    const sofiaMessage: SofiaMessage = { id: crypto.randomUUID(), role: "sofia", content: reply }
    setMessages((prev) => [...prev, sofiaMessage])
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={openSofia}
        className={cn(
          "fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-primary py-3 pl-3 pr-5 text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-105",
          isSofiaOpen && "pointer-events-none opacity-0",
        )}
        aria-label="Abrir concierge Sofia"
      >
        <span className="relative flex size-8 items-center justify-center overflow-hidden rounded-full bg-primary-foreground/15">
          <Image src="/images/sofia-avatar.png" alt="" width={32} height={32} className="size-8 object-cover" />
        </span>
        <span className="text-sm font-medium">Falar com a Sofia</span>
      </button>

      {/* Panel */}
      <div
        className={cn(
          "fixed inset-0 z-50 flex justify-end transition",
          isSofiaOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!isSofiaOpen}
      >
        <button
          type="button"
          aria-label="Fechar concierge"
          onClick={closeSofia}
          className={cn(
            "absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity",
            isSofiaOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "relative flex h-full w-full max-w-md flex-col bg-card shadow-2xl transition-transform duration-300 ease-out",
            isSofiaOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <header className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="relative flex size-10 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                <Image src="/images/sofia-avatar.png" alt="" width={40} height={40} className="size-10 object-cover" />
              </span>
              <div>
                <p className="flex items-center gap-1.5 font-serif text-lg leading-none text-foreground">
                  Sofia
                  <Sparkles className="size-4 text-accent" />
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Concierge inteligente Bomgo</p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeSofia}
              className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted"
              aria-label="Fechar"
            >
              <X className="size-5" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-md px-4 py-2.5 text-sm leading-relaxed",
                    message.role === "user"
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-muted text-foreground",
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-md rounded-bl-md bg-muted px-4 py-3">
                  <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 px-5 pb-3">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-center gap-2 border-t border-border px-4 py-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                  e.preventDefault()
                  send(input)
                }
              }}
              placeholder="Escreva para a Sofia..."
              className="flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-base outline-none transition focus:border-primary"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40"
              aria-label="Enviar mensagem"
            >
              <Send className="size-4" />
            </button>
          </form>
        </aside>
      </div>
    </>
  )
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return (
    <span
      className="size-2 animate-bounce rounded-full bg-muted-foreground/60"
      style={{ animationDelay: delay }}
    />
  )
}
