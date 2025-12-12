// lib/dataforseo.ts
const API_BASE_URL = "https://api.dataforseo.com/v3"

export async function dataForSEORequest<T>(
  endpoint: string,
  data: any
): Promise<T> {
  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD

  if (!login || !password) {
    throw new Error(
      "DataForSEO credentials not found. Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in your .env.local file"
    )
  }

  const credentials = Buffer.from(`${login}:${password}`).toString("base64")

  const response = await fetch(
    `https://api.dataforseo.com/v3/${endpoint}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `API Error: ${response.status} ${response.statusText} - ${errorText}`
    )
  }

  const result = await response.json()

  if (result.status_code !== 20000) {
    throw new Error(
      result.status_message || "DataForSEO API request failed"
    )
  }

  return result as T
}

// Import from the new locations file
export { ALL_GOOGLE_LOCATIONS as LOCATIONS, ALL_LANGUAGES as LANGUAGES } from './locations'

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "N/A"
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toLocaleString()
}

export function formatCurrency(num: number | null | undefined): string {
  if (num === null || num === undefined) return "N/A"
  return `$${num.toFixed(2)}`
}

export function formatPercent(num: number | null | undefined): string {
  if (num === null || num === undefined) return "N/A"
  return `${(num * 100).toFixed(1)}%`
}