import {
  Bath,
  Car,
  Flame,
  Sailboat,
  Snowflake,
  UtensilsCrossed,
  WashingMachine,
  Waves,
  Wifi,
  type LucideIcon,
} from "lucide-react"

const ICONS: Record<string, LucideIcon> = {
  wifi: Wifi,
  ac: Snowflake,
  pool: Waves,
  sea: Sailboat,
  kitchen: UtensilsCrossed,
  parking: Car,
  laundry: WashingMachine,
  bbq: Flame,
  jacuzzi: Bath,
}

export function AmenityIcon({ amenityKey, className }: { amenityKey: string; className?: string }) {
  const Icon = ICONS[amenityKey] ?? Wifi
  return <Icon className={className} />
}
