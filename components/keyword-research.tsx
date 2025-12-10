"use client"

import { useState } from "react"
import { Search, Download, FileJson, Printer, Loader2, TrendingUp, BarChart3, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { LOCATIONS, LANGUAGES, formatNumber, formatCurrency } from "@/lib/dataforseo"
import { exportToCSV, exportToJSON, exportToPDF } from "@/lib/export-utils"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts"

interface KeywordData {
  keyword: string
  searchVolume: number
  keywordDifficulty: number
  cpc: number
  competition: string
  competitionValue: number
  monthlySearches: { month: string; volume: number }[]
  isSeed?: boolean
}

const getCompetitionColor = (value: number) => {
  if (value >= 0.7) return "text-red-600 bg-red-50"
  if (value >= 0.4) return "text-yellow-600 bg-yellow-50"
  return "text-green-600 bg-green-50"
}

const getCompetitionText = (level: string, value: number) => {
  if (level && level !== "Unknown") return level
  if (value >= 0.7) return "HIGH"
  if (value >= 0.4) return "MEDIUM"
  return "LOW"
}

export function KeywordResearch() {
  const [keyword, setKeyword] = useState("")
  const [location, setLocation] = useState("2840")
  const [language, setLanguage] = useState("en")
  const [limit, setLimit] = useState(50)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<KeywordData[]>([])

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError("Please enter a keyword")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/keyword-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: keyword.trim(),
          locationCode: Number.parseInt(location),
          languageCode: language,
          limit,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch keyword data")
      }

      setResults(data.keywords || [])

      if (!data.keywords || data.keywords.length === 0) {
        setError("No keywords found. Try a different keyword or adjust your filters.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    exportToCSV(results, `keywords-${keyword}`, [
      { key: "keyword", label: "Keyword" },
      { key: "searchVolume", label: "Search Volume" },
      { key: "keywordDifficulty", label: "Difficulty" },
      { key: "cpc", label: "CPC" },
      { key: "competition", label: "Competition Level" },
    ])
  }

  const handleExportJSON = () => {
    exportToJSON(results, `keywords-${keyword}`)
  }

  // Top 10 keywords by volume (cleaner chart)
  const topKeywordsByVolume = [...results]
    .sort((a, b) => b.searchVolume - a.searchVolume)
    .slice(0, 10)
    .map((kw) => ({
      keyword: kw.keyword.length > 25 ? `${kw.keyword.slice(0, 25)}...` : kw.keyword,
      fullKeyword: kw.keyword,
      volume: kw.searchVolume,
    }))

  // Better difficulty distribution
  const difficultyDistribution = [
    {
      range: "Easy (0-30)",
      count: results.filter((k) => k.keywordDifficulty <= 30).length,
      color: "hsl(var(--chart-2))",
    },
    {
      range: "Medium (31-60)",
      count: results.filter((k) => k.keywordDifficulty > 30 && k.keywordDifficulty <= 60).length,
      color: "hsl(var(--chart-3))",
    },
    {
      range: "Hard (61-100)",
      count: results.filter((k) => k.keywordDifficulty > 60).length,
      color: "hsl(var(--chart-1))",
    },
  ]

  // Opportunity keywords (low difficulty + high volume)
  const opportunityKeywords = results
    .filter((k) => k.keywordDifficulty < 40 && k.searchVolume > 1000)
    .sort((a, b) => b.searchVolume - a.searchVolume)
    .slice(0, 10)

  // Volume vs CPC scatter (cleaner)
  const volumeVsCPC = results
    .filter((k) => k.searchVolume > 0 && k.cpc > 0)
    .slice(0, 50)
    .map((k) => ({
      volume: k.searchVolume,
      cpc: k.cpc,
      keyword: k.keyword,
      difficulty: k.keywordDifficulty,
    }))

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Keyword Research
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="keyword">Keyword</Label>
              <Input
                id="keyword"
                placeholder="e.g., seo tools"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
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
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Number of Results: {limit}</Label>
            <Slider
              value={[limit]}
              onValueChange={([value]) => setLimit(value)}
              min={10}
              max={100}
              step={10}
            />
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
                  <Search className="mr-2 h-4 w-4" />
                  Search Keywords
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
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground">Total Keywords</p>
                <p className="text-3xl font-bold">{formatNumber(results.length)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground">Avg Search Volume</p>
                <p className="text-3xl font-bold">
                  {formatNumber(Math.round(results.reduce((sum, k) => sum + k.searchVolume, 0) / results.length))}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground">Avg Difficulty</p>
                <p className="text-3xl font-bold">
                  {Math.round(results.reduce((sum, k) => sum + k.keywordDifficulty, 0) / results.length)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-muted-foreground">Avg CPC</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(results.reduce((sum, k) => sum + k.cpc, 0) / results.length)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Keywords - Horizontal Bar Chart */}
            {topKeywordsByVolume.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Top 10 Keywords by Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topKeywordsByVolume} layout="vertical" margin={{ left: 150, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <YAxis
                          dataKey="keyword"
                          type="category"
                          width={140}
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={11}
                          interval={0}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                          formatter={(value: number) => [formatNumber(value), "Volume"]}
                          labelFormatter={(label) => label}
                        />
                        <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Difficulty Distribution */}
            {difficultyDistribution.some((d) => d.count > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Difficulty Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={difficultyDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="range"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          angle={-15}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [value, "Keywords"]}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {difficultyDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Volume vs CPC Scatter */}
          {volumeVsCPC.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-4 w-4 text-primary" />
                  Search Volume vs CPC
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-2">Higher right = High value keywords</p>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        type="number"
                        dataKey="volume"
                        name="Search Volume"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={formatNumber}
                      />
                      <YAxis
                        type="number"
                        dataKey="cpc"
                        name="CPC ($)"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={(val) => `$${val.toFixed(0)}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        cursor={{ strokeDasharray: "3 3" }}
                        formatter={(value: number, name: string) => {
                          if (name === "volume") return [formatNumber(value), "Search Volume"]
                          if (name === "cpc") return [formatCurrency(value), "CPC"]
                          return value
                        }}
                        labelFormatter={(label) => `Keywords`}
                      />
                      <Scatter
                        data={volumeVsCPC}
                        fill="hsl(var(--primary))"
                        fillOpacity={0.6}
                      >
                        {volumeVsCPC.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.difficulty < 40 ? "hsl(var(--chart-2))" : "hsl(var(--primary))"}
                            opacity={entry.difficulty < 40 ? 0.8 : 0.5}
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Green dots = Lower difficulty | Blue dots = Higher difficulty
                </p>
              </CardContent>
            </Card>
          )}

          {/* Opportunity Keywords */}
          {opportunityKeywords.length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-green-900">
                  <Zap className="h-4 w-4 text-green-600" />
                  Quick Wins ({opportunityKeywords.length} keywords)
                </CardTitle>
                <p className="text-xs text-green-700 mt-1">
                  Low difficulty (&lt;40) + High volume (&gt;1000) = Best opportunities
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {opportunityKeywords.map((kw, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-white p-3 border border-green-200 hover:border-green-400 transition-colors"
                    >
                      <p className="font-medium text-sm truncate" title={kw.keyword}>
                        {kw.keyword}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>📊 {formatNumber(kw.searchVolume)}</span>
                        <span>🎯 {kw.keywordDifficulty}</span>
                        <span>💰 {formatCurrency(kw.cpc)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Full Keywords Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Keywords ({results.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left font-medium text-muted-foreground">Keyword</th>
                      <th className="pb-3 text-right font-medium text-muted-foreground">Search Volume</th>
                      <th className="pb-3 text-center font-medium text-muted-foreground">Difficulty</th>
                      <th className="pb-3 text-right font-medium text-muted-foreground">CPC</th>
                      <th className="pb-3 text-center font-medium text-muted-foreground">Competition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((kw, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 font-medium max-w-[300px]">
                          <div className="flex items-center gap-2">
                            {kw.isSeed && (
                              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                                Seed
                              </span>
                            )}
                            <span className="truncate" title={kw.keyword}>
                              {kw.keyword}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-right font-medium text-sm">{formatNumber(kw.searchVolume)}</td>
                        <td className="py-3 text-center">
                          <span
                            className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                              kw.keywordDifficulty > 70
                                ? "bg-red-100 text-red-700"
                                : kw.keywordDifficulty > 40
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {kw.keywordDifficulty}
                          </span>
                        </td>
                        <td className="py-3 text-right text-sm font-medium">{formatCurrency(kw.cpc)}</td>
                        <td className="py-3 text-center">
                          <div className="flex flex-col items-center gap-0.5">
                            <span
                              className={`rounded px-2 py-0.5 text-xs font-semibold ${getCompetitionColor(
                                kw.competitionValue,
                              )}`}
                            >
                              {getCompetitionText(kw.competition, kw.competitionValue)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {(kw.competitionValue * 100).toFixed(0)}%
                            </span>
                          </div>
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
            <Search className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No keywords searched</h3>
            <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
              Enter a keyword above to discover related keywords with search volume, difficulty, and CPC data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}