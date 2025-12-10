"use client"

import { useState } from "react"
import { Megaphone, Download, FileJson, Printer, Loader2, ExternalLink, BadgeCheck, Search, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LOCATIONS, formatNumber } from "@/lib/dataforseo"
import { exportToCSV, exportToJSON, exportToPDF } from "@/lib/export-utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AdData {
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
}

// Utility function to truncate URLs
const truncateUrl = (url: string, maxLength: number = 50) => {
  if (url.length <= maxLength) return url
  return url.substring(0, maxLength) + "..."
}

// Extract clean domain from URL
const extractDomain = (url: string) => {
  try {
    if (!url.startsWith('http')) {
      return url.split('/')[0]
    }
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return url.split('/')[0]
  }
}

export function PaidAdsResearch() {
  const [query, setQuery] = useState("")
  const [searchType, setSearchType] = useState<"keyword" | "domain">("keyword")
  const [location, setLocation] = useState("2840")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<AdData[]>([])

  const handleSearch = async () => {
    if (!query.trim()) {
      setError(`Please enter a ${searchType}`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/paid-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          searchType,
          locationCode: Number.parseInt(location),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch ads data")
      }

      // Check if keyword search returned a message
      if (data.message) {
        setError(data.message)
        setResults([])
        return
      }

      setResults(data.ads || [])
      
      if (!data.ads || data.ads.length === 0) {
        setError(`No ads found for "${query}". ${searchType === 'domain' ? 'This domain may not be running Google Ads campaigns. Try popular domains like nike.com, amazon.com, or shopify.com.' : 'Try using domain search instead.'}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    exportToCSV(results, `ads-${query}`, [
      { key: "advertiser", label: "Advertiser" },
      { key: "advertiserId", label: "Advertiser ID" },
      { key: "domain", label: "Domain" },
      { key: "title", label: "Title" },
      { key: "displayUrl", label: "Display URL" },
      { key: "isVerified", label: "Verified" },
      { key: "adCount", label: "Ad Count" },
      { key: "format", label: "Format" },
      { key: "firstShown", label: "First Shown" },
      { key: "lastShown", label: "Last Shown" },
    ])
  }

  const handleExportJSON = () => {
    exportToJSON(results, `ads-${query}`)
  }

  const topAdvertisers = [...results]
    .sort((a, b) => b.adCount - a.adCount)
    .slice(0, 10)
    .map((ad) => ({
      name: ad.advertiser.length > 20 ? `${ad.advertiser.slice(0, 20)}...` : ad.advertiser,
      fullName: ad.advertiser,
      ads: ad.adCount,
    }))

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Paid Ads Research
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="searchType">Search Type</Label>
              <Select value={searchType} onValueChange={(v) => setSearchType(v as "keyword" | "domain")}>
                <SelectTrigger id="searchType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="keyword">
                    <span className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      By Keyword
                    </span>
                  </SelectItem> */}
                  <SelectItem value="domain">
                    <span className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      By Domain
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="query">{searchType === "domain" ? "Domain" : "Keyword"}</Label>
              <Input
                id="query"
                placeholder={searchType === "keyword" ? "project management software" : "asana.com"}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger id="location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc.code} value={loc.code.toString()}>
                      {loc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Megaphone className="mr-2 h-4 w-4" />
                  Search Ads
                </>
              )}
            </Button>
            {results.length > 0 && (
              <>
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button variant="outline" onClick={handleExportJSON}>
                  <FileJson className="mr-2 h-4 w-4" />
                  JSON
                </Button>
                <Button variant="outline" onClick={exportToPDF}>
                  <Printer className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </>
            )}
          </div>
          {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground">Total Advertisers</p>
                <p className="text-3xl font-bold">{formatNumber(results.length)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground">Total Ads</p>
                <p className="text-3xl font-bold">
                  {formatNumber(results.reduce((sum, ad) => sum + ad.adCount, 0))}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground">Verified Advertisers</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatNumber(results.filter(ad => ad.isVerified).length)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Advertisers Chart */}
          {topAdvertisers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Megaphone className="h-4 w-4 text-primary" />
                  Top Advertisers by Ad Count
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topAdvertisers}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={150}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number, _, props) => [
                          formatNumber(value),
                          `Ads (${props.payload.fullName})`,
                        ]}
                      />
                      <Bar dataKey="ads" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ad Previews */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ad Results ({results.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {results.map((ad, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
                  >
                    {/* Ad Preview styled like Google Ads */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800">
                          Ad
                        </span>
                        <span className="flex items-center gap-1 text-sm text-green-700 truncate flex-1 min-w-0">
                          <span className="truncate">{extractDomain(ad.displayUrl)}</span>
                          {ad.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />}
                        </span>
                      </div>
                      <h3 className="font-medium text-blue-600 hover:underline line-clamp-2">
                        {ad.title || "Ad Preview"}
                      </h3>
                      {ad.previewImage && (
                        <img 
                          src={ad.previewImage} 
                          alt={ad.title}
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                      <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 truncate flex-1 min-w-0">
                          <Globe className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{ad.domain || ad.advertiserId}</span>
                        </span>
                        <span className="flex items-center gap-1 flex-shrink-0 ml-2">
                          <Megaphone className="h-3 w-3" />
                          {ad.adCount} ads
                        </span>
                      </div>
                      {ad.format && (
                        <span className="text-xs px-2 py-1 bg-muted rounded">
                          {ad.format}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Advertiser Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left font-medium text-muted-foreground">Advertiser</th>
                      <th className="pb-3 text-left font-medium text-muted-foreground">Domain</th>
                      <th className="pb-3 text-center font-medium text-muted-foreground">Verified</th>
                      <th className="pb-3 text-right font-medium text-muted-foreground">Active Ads</th>
                      <th className="pb-3 text-center font-medium text-muted-foreground">Last Seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((ad, index) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="py-3 font-medium max-w-[200px]">
                          <div className="truncate" title={ad.advertiser}>
                            {ad.advertiser}
                          </div>
                        </td>
                        <td className="py-3 max-w-[250px]">
                          <a
                            href={ad.displayUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline group"
                            title={ad.displayUrl}
                          >
                            <span className="truncate">{extractDomain(ad.displayUrl)}</span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </td>
                        <td className="py-3 text-center">
                          {ad.isVerified ? (
                            <BadgeCheck className="mx-auto h-5 w-5 text-blue-500" />
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{
                                width: `${Math.min((ad.adCount / Math.max(...results.map((r) => r.adCount))) * 60, 60)}px`,
                              }}
                            />
                            <span>{formatNumber(ad.adCount)}</span>
                          </div>
                        </td>
                        <td className="py-3 text-center text-xs text-muted-foreground">
                          {ad.lastShown ? new Date(ad.lastShown).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && !error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No ads found</h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
              Search by domain to discover paid advertising campaigns.
              Try popular domains like "nike.com" .
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}