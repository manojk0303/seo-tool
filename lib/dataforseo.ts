const API_BASE_URL = "https://api.dataforseo.com/v3"

function getAuthHeader(): string {
  const login = process.env.DATAFORSEO_LOGIN || ""
  const password = process.env.DATAFORSEO_PASSWORD || ""
  return Buffer.from(`${login}:${password}`).toString("base64")
}

// lib/dataforseo.ts

export async function dataForSEORequest<T>(
  endpoint: string,
  data: any
): Promise<T> {
  // Get credentials from environment variables
  const login = process.env.DATAFORSEO_LOGIN
  const password = process.env.DATAFORSEO_PASSWORD

  if (!login || !password) {
    throw new Error(
      "DataForSEO credentials not found. Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in your .env.local file"
    )
  }

  // Encode credentials in Base64 for Basic Auth
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

  // Check DataForSEO specific status codes
  if (result.status_code !== 20000) {
    throw new Error(
      result.status_message || "DataForSEO API request failed"
    )
  }

  return result as T
}

export const LOCATIONS = [
  { code: 2840, name: "United States" },
  { code: 2826, name: "United Kingdom" },
  { code: 2124, name: "Canada" },
  { code: 2036, name: "Australia" },
  { code: 2276, name: "Germany" },
] as const

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
] as const

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
