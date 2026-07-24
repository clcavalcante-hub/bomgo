// Endereço público do site, num lugar só.
//
// O site nasceu em bomgo.vercel.app e hoje atende em www.bomgobrasil.com.br —
// a troca já aconteceu, então o padrão é o domínio da marca. Isso importa mais
// do que parece: sitemap, robots e as URLs canônicas saem daqui, e enquanto o
// padrão apontava para a Vercel o site entregava ao Google um mapa mandando
// indexar bomgo.vercel.app — conteúdo duplicado com o domínio descartável
// levando a autoridade. NEXT_PUBLIC_SITE_URL ainda sobrescreve, para preview.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.bomgobrasil.com.br").replace(/\/+$/, "")

// Domínio sem protocolo, para exibir em texto (termos de uso, rodapé).
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "")
