import {
  Armchair,
  Bath,
  Car,
  CircleCheck,
  Dumbbell,
  Droplets,
  Flame,
  Home,
  MoveVertical,
  PawPrint,
  Phone,
  Refrigerator,
  Sailboat,
  Shirt,
  ShieldCheck,
  Snowflake,
  SprayCan,
  Trash2,
  Tv,
  Utensils,
  UtensilsCrossed,
  WashingMachine,
  Waves,
  Wifi,
  Wind,
  type LucideIcon,
} from "lucide-react"

/**
 * Keyword-based icon matcher.
 *
 * Amenity keys are `slugify(label)` of whatever Portuguese label Stays
 * returns (e.g. "Ar Condicionado" → "ar-condicionado") — there is no fixed,
 * small vocabulary to map 1:1. Matching by keyword fragment against both the
 * key and the raw label covers the real, varied wording Stays uses instead
 * of silently collapsing every unrecognized amenity onto the Wifi icon.
 * Order matters: more specific phrases are checked before generic ones.
 */
const RULES: { icon: LucideIcon; keywords: string[] }[] = [
  { icon: Wifi, keywords: ["wifi", "wi-fi", "internet"] },
  { icon: Snowflake, keywords: ["ar-condicionado", "ar condicionado"] },
  { icon: Wind, keywords: ["ventilador"] },
  { icon: Waves, keywords: ["piscina"] },
  { icon: Sailboat, keywords: ["mar", "vista-mar", "praia"] },
  { icon: Bath, keywords: ["banheiro", "chuveiro", "jacuzzi", "banheira"] },
  { icon: Droplets, keywords: ["toalha", "produtos-de-limpeza", "limpeza"] },
  { icon: UtensilsCrossed, keywords: ["cozinha-completa", "churrasqueira", "bbq"] },
  { icon: Utensils, keywords: ["cozinha"] },
  { icon: Flame, keywords: ["fogao", "fogão"] },
  { icon: Refrigerator, keywords: ["geladeira", "frigobar"] },
  { icon: Tv, keywords: ["tv", "televisao", "televisão"] },
  { icon: Dumbbell, keywords: ["academia", "ginasio", "ginásio"] },
  { icon: Car, keywords: ["estacionamento", "vaga", "garagem"] },
  { icon: WashingMachine, keywords: ["lavanderia", "maquina-de-lavar", "lavadora"] },
  { icon: Shirt, keywords: ["cabide", "guarda-roupa", "armario", "armário", "ferro-de-passar"] },
  { icon: Armchair, keywords: ["sofa", "sofá", "sala"] },
  { icon: MoveVertical, keywords: ["elevador"] },
  { icon: Home, keywords: ["terrea", "térrea", "terreo", "térreo"] },
  { icon: Phone, keywords: ["interfone", "telefone"] },
  { icon: ShieldCheck, keywords: ["porteiro", "seguranca", "segurança", "condominio", "condomínio"] },
  { icon: PawPrint, keywords: ["pet"] },
  { icon: Trash2, keywords: ["lixeira", "lixo"] },
  { icon: SprayCan, keywords: ["higienico", "higiênico"] },
]

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function resolveIcon(amenityKey: string, label?: string): LucideIcon {
  const haystack = normalize(`${amenityKey} ${label ?? ""}`)
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => haystack.includes(normalize(kw)))) return rule.icon
  }
  // Neutral fallback — never silently mislabels an unrecognized amenity as Wifi.
  return CircleCheck
}

export function AmenityIcon({
  amenityKey,
  label,
  className,
}: {
  amenityKey: string
  label?: string
  className?: string
}) {
  const Icon = resolveIcon(amenityKey, label)
  return <Icon className={className} />
}
