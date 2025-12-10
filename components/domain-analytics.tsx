"use client"

import { useState } from "react"
import {
  Globe,
  Download,
  FileJson,
  Printer,
  Loader2,
  Link2,
  TrendingUp,
  BarChart3,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { formatNumber } from "@/lib/dataforseo"
import { exportToCSV, exportToJSON, exportToPDF } from "@/lib/export-utils"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface DomainData {
  domainRank: number
  organicTraffic: number
  organicKeywords: number
  backlinks: {
    total: number
    referringDomains: number
    newBacklinks: number
    lostBacklinks: number
    dofollow: number
    nofollow: number
  }
  topKeywords: Array<{
    keyword: string
    position: number
    searchVolume: number
    url: string
  }>
  trafficTrend: Array<{ month: string; traffic: number }>
  dataAvailable: boolean
  message?: string
}

export function DomainAnalytics() {
  const [domain, setDomain] = useState("")
  const [includeSubdomains, setIncludeSubdomains] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DomainData | null>(null)

  const handleAnalyze = async () => {
    if (!domain.trim()) {
      setError("Please enter a domain")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/domain-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: domain
            .trim()
            .replace(/^https?:\/\//, "")
            .replace(/\/$/, ""),
          includeSubdomains,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch domain data")
      }

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (!data?.topKeywords.length) {
      alert("No keywords to export")
      return
    }
    exportToCSV(data.topKeywords, `domain-${domain}-keywords`, [
      { key: "keyword", label: "Keyword" },
      { key: "position", label: "Position" },
      { key: "searchVolume", label: "Search Volume" },
      { key: "url", label: "URL" },
    ])
  }

  const handleExportJSON = () => {
    if (!data) return
    exportToJSON(data, `domain-${domain}`)
  }

  const backlinksDistribution =
    data && (data.backlinks.dofollow > 0 || data.backlinks.nofollow > 0)
      ? [
          ...(data.backlinks.dofollow > 0
            ? [{ name: "Dofollow", value: data.backlinks.dofollow, color: "hsl(var(--chart-1))" }]
            : []),
          ...(data.backlinks.nofollow > 0
            ? [{ name: "Nofollow", value: data.backlinks.nofollow, color: "hsl(var(--chart-2))" }]
            : []),
        ]
      : []

  const getDomainRankColor = (rank: number) => {
    if (rank === 0) return "text-gray-400"
    if (rank >= 70) return "text-green-500"
    if (rank >= 40) return "text-yellow-500"
    return "text-red-500"
  }

  const hasValidData = data && data.dataAvailable

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Domain Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              />
            </div>
            <div className="flex items-end space-x-2 pb-0.5">
              <Checkbox
                id="subdomains"
                checked={includeSubdomains}
                onCheckedChange={(checked) => setIncludeSubdomains(checked === true)}
              />
              <Label htmlFor="subdomains" className="text-sm font-normal">
                Include subdomains
              </Label>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAnalyze} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Globe className="mr-2 h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
            {data && (
              <>
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  disabled={!data.topKeywords.length}
                >
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
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {data && (
        <>
          {/* No Data Message */}
          {!hasValidData && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Info className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">
                      Limited Data Available
                    </h3>
                    <p className="text-sm text-yellow-800">
                      {data.message ||
                        "This domain appears to be new or has minimal search visibility. Possible reasons:"}
                    </p>
                    <ul className="text-sm text-yellow-800 mt-2 ml-4 list-disc space-y-1">
                      <li>Domain is newly registered (less than 3-6 months old)</li>
                      <li>Very few inbound links from other websites</li>
                      <li>No indexed pages or minimal Google search presence</li>
                      <li>Domain is on blocklist or deindexed</li>
                    </ul>
                    <p className="text-xs text-yellow-700 mt-3">
                      📌 Tip: DataForSEO tracks publicly available data. New or private domains may not have
                      measurable metrics.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overview Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Domain Rank</p>
                    <p className={`text-3xl font-bold ${getDomainRankColor(data.domainRank)}`}>
                      {data.domainRank || "—"}
                    </p>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full ${
                      data.domainRank > 0 ? "bg-primary/10" : "bg-gray-100"
                    }`}
                  >
                    <TrendingUp className={`h-6 w-6 ${data.domainRank > 0 ? "text-primary" : "text-gray-400"}`} />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">out of 1000</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Organic Traffic</p>
                    <p className="text-3xl font-bold">{formatNumber(data.organicTraffic)}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-1/10">
                    <BarChart3 className="h-6 w-6 text-chart-1" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">estimated monthly</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Organic Keywords</p>
                    <p className="text-3xl font-bold">{formatNumber(data.organicKeywords)}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-2/10">
                    <Globe className="h-6 w-6 text-chart-2" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">ranking keywords</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Backlinks</p>
                    <p className="text-3xl font-bold">{formatNumber(data.backlinks.total)}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-3/10">
                    <Link2 className="h-6 w-6 text-chart-3" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {data.backlinks.referringDomains > 0
                    ? `from ${formatNumber(data.backlinks.referringDomains)} domains`
                    : "No data"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Backlinks Summary - Only show if data exists */}
          {hasValidData && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-green-500/5 border-green-500/20">
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground">New Backlinks</p>
                  <p className="text-2xl font-bold text-green-600">
                    {data.backlinks.newBacklinks > 0 ? `+${formatNumber(data.backlinks.newBacklinks)}` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">detected in crawl</p>
                </CardContent>
              </Card>
              <Card className="bg-red-500/5 border-red-500/20">
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground">Lost Backlinks</p>
                  <p className="text-2xl font-bold text-red-600">
                    {data.backlinks.lostBacklinks > 0 ? `-${formatNumber(data.backlinks.lostBacklinks)}` : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">removed in crawl</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground">Dofollow Links</p>
                  <p className="text-2xl font-bold">
                    {data.backlinks.dofollow > 0 ? formatNumber(data.backlinks.dofollow) : "—"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-muted-foreground">Nofollow Links</p>
                  <p className="text-2xl font-bold">
                    {data.backlinks.nofollow > 0 ? formatNumber(data.backlinks.nofollow) : "—"}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts - Only show if data exists */}
          {hasValidData && (data.trafficTrend.some(t => t.traffic > 0) || backlinksDistribution.length > 0) && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Traffic Trend */}
              {data.trafficTrend.some(t => t.traffic > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Organic Traffic Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={data.trafficTrend}
                          margin={{ top: 10, right: 30, left: 60, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis
                            dataKey="month"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                          />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickFormatter={formatNumber}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number) => [formatNumber(value), "Traffic"]}
                          />
                          <Area
                            type="monotone"
                            dataKey="traffic"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Backlinks Distribution */}
              {backlinksDistribution.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Link2 className="h-4 w-4 text-primary" />
                      Backlinks Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={backlinksDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {backlinksDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number) => [formatNumber(value), "Backlinks"]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Top Keywords - Only show if data exists */}
          {data.topKeywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Top Ranking Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-3 text-left font-medium text-muted-foreground">Keyword</th>
                        <th className="pb-3 w-20 text-center font-medium text-muted-foreground">Position</th>
                        <th className="pb-3 w-32 text-center font-medium text-muted-foreground">Search Volume</th>
                        <th className="pb-3 text-left font-medium text-muted-foreground">URL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topKeywords.map((kw, index) => (
                        <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="py-3 font-medium">{kw.keyword}</td>
                          <td className="py-3 text-center">
                            {kw.position > 0 ? (
                              <span
                                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                  kw.position <= 3
                                    ? "bg-green-500/20 text-green-700"
                                    : kw.position <= 10
                                      ? "bg-yellow-500/20 text-yellow-700"
                                      : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {kw.position}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-3 text-center text-muted-foreground">{formatNumber(kw.searchVolume)}</td>
                          <td className="py-3">
                            {kw.url && kw.url !== "#" ? (
                              <a
                                href={kw.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline truncate"
                                title={kw.url}
                              >
                                <span className="truncate">
                                  {kw.url.length > 45 ? `${kw.url.slice(0, 45)}...` : kw.url}
                                </span>
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && !data && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No domain analyzed</h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-sm">
              Enter a domain (e.g., <code className="bg-muted px-2 py-1 rounded">example.com</code>) to analyze its
              SEO performance, backlinks, and ranking keywords.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}