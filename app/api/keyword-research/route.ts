// app/api/paid-ads/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { dataForSEORequest } from "@/lib/dataforseo"

interface AdsSearchResult {
  tasks?: Array<{
    result?: Array<{
      keyword?: string
      type?: string
      se_domain?: string
      location_code?: number
      language_code?: string
      datetime?: string
      items_count?: number
      items?: Array<{
        type?: string
        rank_group?: number
        rank_absolute?: number
        advertiser_id?: string
        creative_id?: string
        title?: string
        url?: string
        verified?: boolean
        format?: string
        preview_image?: {
          url?: string
          height?: number
          width?: number
        }
        preview_url?: string | null
        first_shown?: string
        last_shown?: string
      }>
    }>
  }>
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, searchType, locationCode = 2840 } = body

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    console.log("📢 Paid ads request:", { query, searchType, locationCode })

    let response: AdsSearchResult

    if (searchType === "keyword") {
      // For keywords, explain limitation and suggest domain search
      console.log("⚠️ Keyword search has limitations")
      
      return NextResponse.json({ 
        ads: [],
        totalAds: 0,
        uniqueAdvertisers: 0,
        message: "Keyword search is not supported by the Google Ads Transparency API. Please use domain search instead. Try searching for domains like 'nike.com', 'amazon.com', or 'shopify.com' to see their advertising campaigns.",
      })
    } else {
      // Search by domain/target
      const cleanDomain = query.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]
      
      console.log("🔍 Searching ads for domain:", cleanDomain)
      
      response = await dataForSEORequest<AdsSearchResult>(
        "serp/google/ads_search/live/advanced",
        [
          {
            target: cleanDomain,
            location_code: locationCode,
            platform: "google_search",
            depth: 40,
          },
        ]
      )
    }

    const resultData = response.tasks?.[0]?.result?.[0]
    const items = resultData?.items || []

    console.log("✅ Ads found:", items.length)
    console.log("📊 Sample ad:", items[0] ? JSON.stringify(items[0], null, 2) : "No ads")

    // Group ads by advertiser_id
    const adsByAdvertiser = new Map<string, {
      advertiser: string
      advertiserId: string
      domain: string
      title: string
      description: string
      displayUrl: string
      isVerified: boolean
      adCount: number
      format: string
      firstShown: string
      lastShown: string
      previewImage?: string
    }>()

    items.forEach(item => {
      const advertiserId = item.advertiser_id || 'unknown'
      
      if (adsByAdvertiser.has(advertiserId)) {
        const existing = adsByAdvertiser.get(advertiserId)!
        existing.adCount += 1
        // Update last_shown to most recent
        if (item.last_shown && item.last_shown > existing.lastShown) {
          existing.lastShown = item.last_shown
        }
      } else {
        // Extract domain from URL if available
        let domain = ''
        try {
          if (item.url) {
            const urlMatch = item.url.match(/advertiser\/(AR\d+)/)
            domain = urlMatch ? urlMatch[1] : advertiserId
          }
        } catch (e) {
          domain = advertiserId
        }

        adsByAdvertiser.set(advertiserId, {
          advertiser: advertiserId,
          advertiserId: advertiserId,
          domain: domain,
          title: item.title || "Untitled Ad",
          description: "", // Not available in ads_search response
          displayUrl: item.url || "",
          isVerified: item.verified || false,
          adCount: 1,
          format: item.format || "text",
          firstShown: item.first_shown || "",
          lastShown: item.last_shown || "",
          previewImage: item.preview_image?.url,
        })
      }
    })

    const ads = Array.from(adsByAdvertiser.values())
      .sort((a, b) => b.adCount - a.adCount)
      .slice(0, 50) // Limit to top 50 advertisers

    console.log("📤 Returning", ads.length, "unique advertisers")

    return NextResponse.json({ 
      ads,
      totalAds: items.length,
      uniqueAdvertisers: ads.length,
    })
  } catch (error) {
    console.error("❌ Paid ads error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch ads data" },
      { status: 500 },
    )
  }
}