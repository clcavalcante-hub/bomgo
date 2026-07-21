/**
 * Airport/transport info for the welcome guide's "Transportes" section,
 * keyed by region. Matched against the reservation's propertyLocation /
 * propertyFullAddress string. Values are estimates and vary with traffic,
 * time of day and dynamic pricing — always phrased as approximate in the
 * copy itself, per Chris's source material (2026-07-21).
 */

export const PORTO_DAS_DUNAS_TRANSPORT = `Aeroporto de referência: Aeroporto Internacional de Fortaleza – Pinto Martins (FOR), Av. Senador Carlos Jereissati, 3000, Serrinha, Fortaleza.

Distância até aqui: aproximadamente 24 a 27 km, 30 a 40 min de carro (pode passar de 1h com trânsito).

Uber ou app similar: R$ 55 a R$ 90 (pode passar de R$ 100 em horário de pico ou tarifa dinâmica).
Táxi: R$ 95 a R$ 120.

Não existe ônibus ou metrô direto e prático até aqui — recomendamos Uber, táxi ou transfer combinado com antecedência, principalmente para chegadas de madrugada.

Ao pedir o transporte, informe: Porto das Dunas, Aquiraz, região do Beach Park. Não diga apenas "Fortaleza" — Porto das Dunas fica no município de Aquiraz.

Valores e tempos são estimativas e variam com trânsito, horário e tarifa dinâmica — confirme sempre no aplicativo antes de embarcar.`

export const MEIRELES_TRANSPORT = `Aeroporto de referência: Aeroporto Internacional de Fortaleza – Pinto Martins (FOR), Av. Senador Carlos Jereissati, 3000, Serrinha, Fortaleza.

Distância até aqui: aproximadamente 12 a 15 km, 20 a 30 min de carro (pode passar de 35–50 min com trânsito).

Uber ou app similar: R$ 25 a R$ 45 (pode chegar a R$ 45–70 em tarifa dinâmica).
Táxi: R$ 50 a R$ 65.

Ônibus: linha 917 (Aeroporto/Beira-Mar), com paradas ao longo da Av. Beira-Mar — confirme horário no app Meu Ônibus Fortaleza.
VLT: o Ramal Aeroporto do Metrofor liga o aeroporto até estações da Linha Nordeste (Papicu, Mucuripe, Iate), mas não deixa direto na Beira-Mar — normalmente é preciso completar o trajeto a pé, de ônibus ou app.

Ao pedir o transporte, informe o endereço completo e o nome do edifício — "Beira-Mar" sozinho não é suficiente, a avenida é extensa.

Valores e tempos são estimativas e variam com trânsito, horário e tarifa dinâmica — confirme sempre no aplicativo antes de embarcar.`

export function resolveTransportBody(location: string | null, fullAddress: string | null): string | null {
  const haystack = `${location ?? ""} ${fullAddress ?? ""}`.toLowerCase()
  if (haystack.includes("porto das dunas") || haystack.includes("aquiraz")) {
    return PORTO_DAS_DUNAS_TRANSPORT
  }
  if (haystack.includes("meireles") || haystack.includes("beira-mar") || haystack.includes("beira mar")) {
    return MEIRELES_TRANSPORT
  }
  return null
}
