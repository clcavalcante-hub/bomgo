"use client"

import Image from "next/image"
import { useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Grid2x2, X } from "lucide-react"
import type { PropertyImage } from "@/lib/types"
import { cn } from "@/lib/utils"

export function PropertyGallery({ images, name }: { images: PropertyImage[]; name: string }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const safe = images.length ? images : [{ src: "/placeholder.svg", alt: name }]

  function openAt(i: number) {
    setIndex(i)
    setOpen(true)
  }

  const prev = () => setIndex((i) => (i - 1 + safe.length) % safe.length)
  const next = () => setIndex((i) => (i + 1) % safe.length)

  // Lightbox swipe-to-browse — touch AND mouse drag via pointer events.
  const dragStartX = useRef<number | null>(null)
  const SWIPE_THRESHOLD = 50

  function onPointerDown(e: React.PointerEvent) {
    dragStartX.current = e.clientX
  }
  function onPointerUp(e: React.PointerEvent) {
    if (dragStartX.current == null) return
    const delta = e.clientX - dragStartX.current
    dragStartX.current = null
    if (delta > SWIPE_THRESHOLD) prev()
    else if (delta < -SWIPE_THRESHOLD) next()
  }

  // Main preview photo (the big one before "Ver todas as fotos") also
  // swipes IN PLACE — a drag changes which photo shows right there,
  // without opening the lightbox. A plain tap still opens it.
  const [previewIndex, setPreviewIndex] = useState(0)
  const previewDragStartX = useRef<number | null>(null)
  const previewDraggedRef = useRef(false)

  function onPreviewPointerDown(e: React.PointerEvent) {
    previewDragStartX.current = e.clientX
    previewDraggedRef.current = false
  }
  function onPreviewPointerMove(e: React.PointerEvent) {
    if (previewDragStartX.current == null) return
    if (Math.abs(e.clientX - previewDragStartX.current) > 8) previewDraggedRef.current = true
  }
  function onPreviewPointerUp(e: React.PointerEvent) {
    if (previewDragStartX.current == null) return
    const delta = e.clientX - previewDragStartX.current
    previewDragStartX.current = null

    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      if (delta > 0) setPreviewIndex((i) => (i - 1 + safe.length) % safe.length)
      else setPreviewIndex((i) => (i + 1) % safe.length)
      return
    }
    if (!previewDraggedRef.current) openAt(previewIndex)
  }

  return (
    <>
      {/* Grid preview */}
      <div className="relative grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-md md:h-[460px]">
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && openAt(previewIndex)}
          onPointerDown={onPreviewPointerDown}
          onPointerMove={onPreviewPointerMove}
          onPointerUp={onPreviewPointerUp}
          className="relative col-span-4 row-span-2 aspect-[4/3] touch-pan-y select-none md:col-span-2 md:aspect-auto"
        >
          <Image
            src={safe[previewIndex].src || "/placeholder.svg"}
            alt={safe[previewIndex].alt}
            fill
            priority
            draggable={false}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
          {safe.length > 1 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1 md:hidden">
              {safe.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "size-1.5 rounded-full transition-colors",
                    i === previewIndex ? "bg-white" : "bg-white/50",
                  )}
                />
              ))}
            </div>
          )}
        </div>
        {safe.slice(1, 5).map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => openAt(i + 1)}
            className="relative hidden md:block"
          >
            <Image
              src={img.src || "/placeholder.svg"}
              alt={img.alt}
              fill
              sizes="25vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </button>
        ))}

        <button
          type="button"
          onClick={() => openAt(previewIndex)}
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-background/95 px-4 py-2.5 text-sm font-medium text-foreground shadow-md backdrop-blur transition hover:scale-105"
        >
          <Grid2x2 className="size-4" /> Ver todas as fotos
        </button>
      </div>

      {/* Lightbox */}
      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-primary/95 backdrop-blur">
          <div className="flex items-center justify-between px-5 py-4 text-primary-foreground">
            <span className="text-sm">
              {index + 1} / {safe.length}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar galeria"
              className="flex size-10 items-center justify-center rounded-full hover:bg-primary-foreground/10"
            >
              <X className="size-5" />
            </button>
          </div>
          <div
            className="relative flex flex-1 touch-pan-y select-none items-center justify-center px-4 pb-8"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            <button
              type="button"
              onClick={prev}
              aria-label="Foto anterior"
              className="absolute left-4 hidden size-11 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 sm:flex"
            >
              <ChevronLeft className="size-6" />
            </button>
            <div className="relative h-full max-h-[75vh] w-full max-w-4xl">
              <Image
                src={safe[index].src || "/placeholder.svg"}
                alt={safe[index].alt}
                fill
                sizes="100vw"
                draggable={false}
                className="rounded-md object-contain"
              />
            </div>
            <button
              type="button"
              onClick={next}
              aria-label="Próxima foto"
              className="absolute right-4 hidden size-11 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 sm:flex"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>
          <div className="hidden justify-center gap-2 px-4 pb-6 md:flex">
            {safe.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "relative size-16 shrink-0 overflow-hidden rounded-lg ring-2 transition",
                  i === index ? "ring-cta" : "ring-transparent opacity-60 hover:opacity-100",
                )}
              >
                <Image src={img.src || "/placeholder.svg"} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
