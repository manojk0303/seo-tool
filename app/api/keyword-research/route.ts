// app/api/keyword-research/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { dataForSEORequest } from "@/lib/dataforseo"

interface KeywordSuggestionResult {
  tasks?: Array<{
    result?: Array<{
      se_type?: string
      seed_keyword?: string
      seed_keyword_data?: {
        keyword?: string
        location_code?: number | null
        language_code?: string | null
        keyword_info?: {
          last_updated_time?: string
          search_volume?: number
          cpc?: number
          competition?: number
          competition_level?: string
          low_top_of_page_bid?: number
          high_top_of_page_bid?: number
          categories?: number[]
          monthly_searches?: Array<{
            year: number
            month: number
            search_volume: number
          }>
          search_volume_trend?: {
            monthly?: number
            quarterly?: number
            yearly?: number
          }
        }
        keyword_properties?: {
          keyword_difficulty?: number
          detected_language?: string
        }
        serp_info?: any
      }
      items?: Array<{
        keyword?: string
        location_code?: number | null
        language_code?: string | null
        keyword_info?: {
          search_volume?: number
          cpc?: number
          competition?: number
          competition_level?: string
          monthly_searches?: Array<{
            year: number
            month: number
            search_volume: number
          }>
        }
        keyword_properties?: {
          keyword_difficulty?: number
        }
      }>
    }>
  }>
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { keyword, locationCode = 2840, languageCode = "en", limit = 50 } = body

    if (!keyword) {
      return NextResponse.json({ error: "Keyword is required" }, { status: 400 })
    }

    console.log("🔍 Keyword research for:", keyword)

    const requestData = [
      {
        keyword: keyword.trim(),
        location_code: locationCode,
        language_code: languageCode,
        include_seed_keyword: true,
        include_serp_info: true,
        limit: limit,
      },
    ]

    const response = await dataForSEORequest<KeywordSuggestionResult>(
      "dataforseo_labs/google/keyword_suggestions/live",
      requestData,
    )

    const resultData = response.tasks?.[0]?.result?.[0]
    const items = resultData?.items || []
    const seedKeywordData = resultData?.seed_keyword_data

    console.log("✅ Found", items.length, "keyword suggestions")

    // Include seed keyword if available
    const allKeywords = []
    
    if (seedKeywordData) {
      allKeywords.push({
        keyword: seedKeywordData.keyword || keyword,
        searchVolume: seedKeywordData.keyword_info?.search_volume || 0,
        keywordDifficulty: seedKeywordData.keyword_properties?.keyword_difficulty || 0,
        cpc: seedKeywordData.keyword_info?.cpc || 0,
        competition: seedKeywordData.keyword_info?.competition_level || "Unknown",
        competitionValue: seedKeywordData.keyword_info?.competition || 0,
        monthlySearches: (seedKeywordData.keyword_info?.monthly_searches || []).slice(-12).map((ms) => ({
          month: `${MONTHS[ms.month - 1]} ${ms.year}`,
          volume: ms.search_volume || 0,
        })),
        isSeed: true,
      })
    }

    // Add related keywords
    items.forEach((item) => {
      const monthlySearches = (item.keyword_info?.monthly_searches || []).slice(-12).map((ms) => ({
        month: `${MONTHS[ms.month - 1]} ${ms.year}`,
        volume: ms.search_volume || 0,
      }))

      allKeywords.push({
        keyword: item.keyword || "",
        searchVolume: item.keyword_info?.search_volume || 0,
        keywordDifficulty: item.keyword_properties?.keyword_difficulty || 0,
        cpc: item.keyword_info?.cpc || 0,
        competition: item.keyword_info?.competition_level || "Unknown",
        competitionValue: item.keyword_info?.competition || 0,
        monthlySearches,
        isSeed: false,
      })
    })

    console.log("📤 Returning", allKeywords.length, "total keywords")

    return NextResponse.json({ 
      keywords: allKeywords,
      seedKeyword: resultData?.seed_keyword || keyword,
      totalResults: allKeywords.length,
    })
  } catch (error) {
    console.error("❌ Keyword research error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch keyword data" },
      { status: 500 },
    )
  }
}