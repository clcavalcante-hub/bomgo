"use client"

import Image from "next/image"
import { useState } from "react"
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

  return (
    <>
      {/* Grid preview */}
      <div className="relative grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-md md:h-[460px]">
        <button
          type="button"
          onClick={() => openAt(0)}
          className="relative col-span-4 row-span-2 aspect-[4/3] md:col-span-2 md:aspect-auto"
        >
          <Image
            src={safe[0].src || "/placeholder.svg"}
            alt={safe[0].alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        </button>
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
          onClick={() => openAt(0)}
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
          <div className="relative flex flex-1 items-center justify-center px-4 pb-8">
            <button
              type="button"
              onClick={prev}
              aria-label="Foto anterior"
              className="absolute left-4 flex size-11 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <ChevronLeft className="size-6" />
            </button>
            <div className="relative h-full max-h-[75vh] w-full max-w-4xl">
              <Image
                src={safe[index].src || "/placeholder.svg"}
                alt={safe[index].alt}
                fill
                sizes="100vw"
                className="rounded-md object-contain"
              />
            </div>
            <button
              type="button"
              onClick={next}
              aria-label="Próxima foto"
              className="absolute right-4 flex size-11 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
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
