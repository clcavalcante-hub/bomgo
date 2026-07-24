import Script from "next/script"

/**
 * Google Tag Manager.
 *
 * O contêiner é carregado com `afterInteractive`: medição não pode competir com
 * o conteúdo pelo primeiro segundo da página — o LCP é sinal de ranking, e um
 * portal de viagem que abre devagar perde a visita antes de medir qualquer coisa.
 *
 * Sem `NEXT_PUBLIC_GTM_ID` definido, o componente não renderiza nada. Isso é
 * proposital: em desenvolvimento e em preview não se polui o relatório de
 * produção com tráfego que não é de viajante.
 *
 * Por que GTM e não gtag direto: os eventos de conversão deste portal
 * (clique em parceiro, Sofia, leitura de guia) serão ajustados com frequência
 * por marketing. Pelo contêiner isso se muda sem deploy.
 */
export function GoogleTagManager() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID
  if (!gtmId) return null

  return (
    <Script id="gtm-init" strategy="afterInteractive">
      {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
    </Script>
  )
}

/**
 * Fallback para navegador sem JavaScript. Vai logo após a abertura do <body>,
 * onde o GTM espera encontrá-lo.
 */
export function GoogleTagManagerNoScript() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID
  if (!gtmId) return null

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  )
}
