// components/keyword-research.tsx - Fixed competition display
"use client"

import { useState } from "react"
import { Search, Download, FileJson, Printer, Loader2, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { LOCATIONS, LANGUAGES, formatNumber, formatCurrency } from "@/lib/dataforseo"
import {LOCATIONS_BY_REGION, searchLocations,} from "@/lib/locations"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ChevronDown } from "lucide-react"
// import { LOCATIONS, LANGUAGES, formatNumber, formatCurrency } from "@/lib/dataforseo"
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
} from "recharts"
import { useMemo } from 'react'

import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover"

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

// Helper function to get competition level color
const getCompetitionColor = (value: number) => {
  if (value >= 0.7) return "text-red-600 bg-red-50"
  if (value >= 0.4) return "text-yellow-600 bg-yellow-50"
  return "text-green-600 bg-green-50"
}

// Helper function to get competition text
const getCompetitionText = (level: string, value: number) => {
  // If we have a level string, use it
  if (level && level !== "Unknown") return level
  
  // Otherwise, calculate from value
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
  const [locationOpen, setLocationOpen] = useState(false)
  const [locationSearch, setLocationSearch] = useState("")

  // Get selected location name
  const selectedLocation = useMemo(() => {
    return LOCATIONS.find(l => l.code.toString() === location)
  }, [location])

  // Filter locations based on search
  const filteredLocations = useMemo(() => {
    if (!locationSearch) return LOCATIONS
    return searchLocations(locationSearch)
  }, [locationSearch])

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
      { key: "competitionValue", label: "Competition Score" },
    ])
  }

  const handleExportJSON = () => {
    exportToJSON(results, `keywords-${keyword}`)
  }

  const topKeywordsByVolume = [...results]
    .sort((a, b) => b.searchVolume - a.searchVolume)
    .slice(0, 20)
    .map((kw) => ({
      keyword: kw.keyword.length > 20 ? `${kw.keyword.slice(0, 20)}...` : kw.keyword,
      fullKeyword: kw.keyword,
      volume: kw.searchVolume,
    }))

  const difficultyVsVolume = results
    .filter((kw) => kw.searchVolume > 0)
    .slice(0, 50)
    .map((kw) => ({
      difficulty: kw.keywordDifficulty,
      volume: kw.searchVolume,
      keyword: kw.keyword,
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
              <Label htmlFor="location">Location ({LOCATIONS.length} available)</Label>
              <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={locationOpen}
                    className="w-full justify-between"
                  >
                    {selectedLocation ? selectedLocation.name : "Select location..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search locations..." 
                      value={locationSearch}
                      onValueChange={setLocationSearch}
                    />
                    <CommandList className="max-h-[300px]">
                      <CommandEmpty>No location found.</CommandEmpty>
                      {Object.entries(LOCATIONS_BY_REGION).map(([region, locs]) => (
                        <CommandGroup key={region} heading={region}>
                          {locs.slice(0, 10).map((loc) => (
                            <CommandItem
                              key={loc.code}
                              value={`${loc.name}-${loc.code}`}
                              onSelect={() => {
                                setLocation(loc.code.toString())
                                setLocationOpen(false)
                                setLocationSearch("")
                              }}
                            >
                              <span className="text-xs text-muted-foreground mr-2">{loc.countryCode}</span>
                              {loc.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ))}
                      {locationSearch && filteredLocations.length > 0 && (
                        <CommandGroup heading="Search Results">
                          {filteredLocations.map((loc) => (
                            <CommandItem
                              key={loc.code}
                              value={`${loc.name}-${loc.code}`}
                              onSelect={() => {
                                setLocation(loc.code.toString())
                                setLocationOpen(false)
                                setLocationSearch("")
                              }}
                            >
                              <span className="text-xs text-muted-foreground mr-2">{loc.countryCode}</span>
                              {loc.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
            <Slider value={[limit]} onValueChange={([value]) => setLimit(value)} min={10} max={100} step={10} />
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
          {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
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
            {/* Top Keywords Chart */}
            {topKeywordsByVolume.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Top Keywords by Search Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topKeywordsByVolume} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis
                          dataKey="keyword"
                          type="category"
                          width={120}
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={10}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number, _, props) => [
                            formatNumber(value),
                            props.payload.fullKeyword,
                          ]}
                        />
                        <Bar dataKey="volume" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Difficulty vs Volume Scatter */}
            {difficultyVsVolume.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Keyword Opportunity Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          type="number"
                          dataKey="difficulty"
                          name="Difficulty"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis
                          type="number"
                          dataKey="volume"
                          name="Volume"
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
                          formatter={(value: number, name: string) => [
                            name === "volume" ? formatNumber(value) : value,
                            name === "volume" ? "Search Volume" : "Difficulty",
                          ]}
                        />
                        <Scatter data={difficultyVsVolume} fill="hsl(var(--primary))">
                          {difficultyVsVolume.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.difficulty < 30 && entry.volume > 1000
                                  ? "hsl(var(--chart-2))"
                                  : "hsl(var(--primary))"
                              }
                            />
                          ))}
                        </Scatter>
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground text-center">
                    Green dots = Low difficulty + High volume (best opportunities)
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Keywords Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Keyword Results ({results.length})</CardTitle>
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
                      <tr key={index} className="border-b border-border/50">
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
                        <td className="py-3 text-right font-medium">{formatNumber(kw.searchVolume)}</td>
                        <td className="py-3 text-center">
                          <span
                            className={`inline-block rounded px-2 py-1 text-xs font-medium ${
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
                        <td className="py-3 text-right">{formatCurrency(kw.cpc)}</td>
                        <td className="py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`rounded px-2 py-0.5 text-xs font-medium ${getCompetitionColor(kw.competitionValue)}`}>
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