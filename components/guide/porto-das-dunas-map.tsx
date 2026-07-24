/**
 * Esquema de Porto das Dunas.
 *
 * Desenho original da Bomgo — não é reprodução de material de terceiro. Existe
 * porque a pergunta que mais aparece ("onde ficar?") é, no fundo, uma pergunta
 * de posição: quem está colado no parque, quem está de frente para o mar, quem
 * fica a alguns minutos. Uma lista de nomes não responde isso; um esquema sim.
 *
 * E responde melhor que o mapa oficial do complexo, porque inclui a camada que
 * o material do parque não tem motivo para mostrar: os apartamentos da região,
 * que para boa parte das famílias é a escolha mais inteligente.
 *
 * É esquemático de propósito — proporções e distâncias são ilustrativas, não
 * cartográficas, e o texto diz isso. Fingir precisão de mapa seria o mesmo erro
 * de fingir preço.
 */
export function PortoDasDunasMap() {
  return (
    <figure className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-border bg-[#F7FAFB] dark:bg-[#0E1A1D]">
        <svg
          viewBox="0 0 640 420"
          role="img"
          aria-labelledby="mapa-titulo mapa-desc"
          className="h-auto w-full"
        >
          <title id="mapa-titulo">
            Esquema de Porto das Dunas: mar, praia, parque aquático e onde fica cada hospedagem
          </title>
          <desc id="mapa-desc">
            Do mar para o interior: a faixa de praia; à beira-mar, os resorts Acqua e Suites com o
            parque aquático entre eles; atravessando a via, o Wellness; a cerca de 500 metros ao
            longo da praia, o Oceani; e espalhados pela região, os condomínios de apartamentos como
            Terra Maris e PortaMaris.
          </desc>

          {/* Mar */}
          <rect x="0" y="0" width="640" height="86" fill="#1F7A8C" />
          <path
            d="M0 74 Q40 66 80 74 T160 74 T240 74 T320 74 T400 74 T480 74 T560 74 T640 74 V86 H0 Z"
            fill="#2E93A6"
          />
          <text x="20" y="30" fill="#EAF6F8" fontSize="13" fontWeight="600" letterSpacing="1.5">
            OCEANO ATLÂNTICO
          </text>

          {/* Praia */}
          <rect x="0" y="86" width="640" height="42" fill="#E8D9B8" />
          <text x="20" y="112" fill="#8A7346" fontSize="11.5" letterSpacing="1.2">
            PRAIA DE PORTO DAS DUNAS
          </text>

          {/* Faixa beira-mar */}
          <rect x="0" y="128" width="640" height="120" fill="#F2EFE7" />

          {/* Acqua */}
          <rect x="28" y="146" width="132" height="84" rx="8" fill="#fff" stroke="#C9D6DA" />
          <rect x="28" y="146" width="132" height="5" rx="2.5" fill="#2E93A6" />
          <text x="94" y="180" textAnchor="middle" fontSize="13" fontWeight="700" fill="#123">
            Acqua
          </text>
          <text x="94" y="199" textAnchor="middle" fontSize="10.5" fill="#5A6A70">
            beira-mar
          </text>
          <text x="94" y="215" textAnchor="middle" fontSize="10.5" fill="#5A6A70">
            colado ao parque
          </text>

          {/* Parque */}
          <rect x="182" y="146" width="176" height="84" rx="8" fill="#1F7A8C" />
          <text x="270" y="181" textAnchor="middle" fontSize="14" fontWeight="700" fill="#fff">
            Aqua Park
          </text>
          <text x="270" y="202" textAnchor="middle" fontSize="10.5" fill="#CFE9EE">
            parque aquático
          </text>

          {/* Suites */}
          <rect x="380" y="146" width="132" height="84" rx="8" fill="#fff" stroke="#C9D6DA" />
          <rect x="380" y="146" width="132" height="5" rx="2.5" fill="#2E93A6" />
          <text x="446" y="180" textAnchor="middle" fontSize="13" fontWeight="700" fill="#123">
            Suites
          </text>
          <text x="446" y="199" textAnchor="middle" fontSize="10.5" fill="#5A6A70">
            ao lado do parque
          </text>
          <text x="446" y="215" textAnchor="middle" fontSize="10.5" fill="#5A6A70">
            e da Vila Azul
          </text>

          {/* Oceani */}
          <rect x="530" y="146" width="88" height="84" rx="8" fill="#fff" stroke="#C9D6DA" />
          <rect x="530" y="146" width="88" height="5" rx="2.5" fill="#B4763A" />
          <text x="574" y="178" textAnchor="middle" fontSize="12.5" fontWeight="700" fill="#123">
            Oceani
          </text>
          <text x="574" y="196" textAnchor="middle" fontSize="10" fill="#5A6A70">
            ~500 m
          </text>
          <text x="574" y="210" textAnchor="middle" fontSize="10" fill="#5A6A70">
            do parque
          </text>

          {/* Via */}
          <rect x="0" y="248" width="640" height="26" fill="#D8D3C8" />
          <line
            x1="0"
            y1="261"
            x2="640"
            y2="261"
            stroke="#fff"
            strokeWidth="2"
            strokeDasharray="14 12"
          />
          <text x="20" y="266" fontSize="10.5" fill="#6B6558" letterSpacing="1">
            VIA DE ACESSO
          </text>

          {/* Interior */}
          <rect x="0" y="274" width="640" height="146" fill="#EDF2EC" />

          {/* Wellness */}
          <rect x="28" y="294" width="150" height="80" rx="8" fill="#fff" stroke="#C9D6DA" />
          <rect x="28" y="294" width="150" height="5" rx="2.5" fill="#2E93A6" />
          <text x="103" y="327" textAnchor="middle" fontSize="13" fontWeight="700" fill="#123">
            Wellness
          </text>
          <text x="103" y="345" textAnchor="middle" fontSize="10.5" fill="#5A6A70">
            em frente à Vila Azul
          </text>
          <text x="103" y="360" textAnchor="middle" fontSize="10.5" fill="#5A6A70">
            transfer até o parque
          </text>

          {/* Apartamentos */}
          <rect x="200" y="294" width="418" height="80" rx="8" fill="#fff" stroke="#B4763A" strokeDasharray="6 5" />
          <rect x="200" y="294" width="418" height="5" rx="2.5" fill="#B4763A" />
          <text x="409" y="325" textAnchor="middle" fontSize="13" fontWeight="700" fill="#123">
            Apartamentos e condomínios da região
          </text>
          <text x="409" y="345" textAnchor="middle" fontSize="10.5" fill="#5A6A70">
            Terra Maris · PortaMaris · outros — a poucos minutos do parque
          </text>
          <text x="409" y="361" textAnchor="middle" fontSize="10.5" fill="#5A6A70">
            mais espaço e cozinha; costumam render mais para grupos e estadias longas
          </text>
        </svg>
      </div>
      <figcaption className="text-sm text-muted-foreground">
        Esquema ilustrativo da Bomgo Brasil — as proporções e distâncias servem para entender a
        posição relativa de cada hospedagem, não como medida exata.
      </figcaption>
    </figure>
  )
}
