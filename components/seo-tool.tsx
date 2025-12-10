"use client"

import { useState } from "react"
import { Search, Globe, Megaphone } from "lucide-react"
import { KeywordResearch } from "./keyword-research"
import { DomainAnalytics } from "./domain-analytics"
import { PaidAdsResearch } from "./paid-ads-research"

type Tab = "keyword" | "domain" | "ads"

export function SEOTool() {
  const [activeTab, setActiveTab] = useState<Tab>("keyword")

  const tabs = [
    { id: "keyword" as Tab, label: "Keyword Research", icon: Search },
    { id: "domain" as Tab, label: "Domain Analytics", icon: Globe },
    { id: "ads" as Tab, label: "Paid Ads", icon: Megaphone },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Search className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">SEO Insights</span>
            </div>
            <nav className="hidden md:flex md:gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          {/* Mobile tabs */}
          <div className="flex gap-1 pb-4 md:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                <tab.icon className="h-3 w-3" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === "keyword" && <KeywordResearch />}
        {activeTab === "domain" && <DomainAnalytics />}
        {activeTab === "ads" && <PaidAdsResearch />}
      </main>
    </div>
  )
}
