import { NextResponse } from "next/server"
import { checkinSheetConfig, isCheckinSheetConfigured } from "@/lib/integrations/config"

// Temporary — remove once the Google Sheets check-in integration is
// confirmed working end-to-end. Never returns the API key itself.
export async function GET() {
  const { apiKey, spreadsheetId, range } = checkinSheetConfig
  const diagnostics: Record<string, unknown> = {
    configured: isCheckinSheetConfigured(),
    hasApiKey: Boolean(apiKey),
    apiKeyLength: apiKey.length,
    spreadsheetId,
    range,
  }

  if (!apiKey) {
    diagnostics.error = "GOOGLE_SHEETS_API_KEY not set in this environment"
    return NextResponse.json(diagnostics, { status: 200 })
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`
    const res = await fetch(url, { cache: "no-store" })
    diagnostics.httpStatus = res.status
    const body = await res.text()
    if (!res.ok) {
      diagnostics.errorBody = body.slice(0, 800)
    } else {
      const parsed = JSON.parse(body) as { values?: string[][] }
      diagnostics.rowCount = parsed.values?.length ?? 0
      diagnostics.headerRow = parsed.values?.[0] ?? null
      diagnostics.firstDataRow = parsed.values?.[1] ?? null
    }
  } catch (err) {
    diagnostics.thrown = err instanceof Error ? err.message : String(err)
  }

  return NextResponse.json(diagnostics, { status: 200 })
}

export const dynamic = "force-dynamic"
