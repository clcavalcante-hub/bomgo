// Endereço público do site, num lugar só.
//
// O site nasceu em bomgo.vercel.app e vai passar a atender em
// bomgobrasil.com.br. Enquanto o domínio não vira, o padrão continua sendo o
// da Vercel; na troca basta definir NEXT_PUBLIC_SITE_URL no painel da Vercel e
// republicar — sitemap, robots e as URLs canônicas acompanham sozinhos, sem
// precisar caçar endereço fixo espalhado pelo código.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://bomgo.vercel.app").replace(/\/+$/, "")

// Domínio sem protocolo, para exibir em texto (termos de uso, rodapé).
export const SITE_DOMAIN = SITE_URL.replace(/^https?:\/\//, "")
