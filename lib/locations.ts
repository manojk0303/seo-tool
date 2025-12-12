// lib/locations.ts - Complete list of Google-supported locations
// Source: https://cdn.dataforseo.com/v3/locations/locations_and_languages_dataforseo_labs_2025_08_05.csv
// Filtered for locations with "google" in available_sources

export interface Location {
  code: number
  name: string
  type: string
  countryCode: string
}

export interface Language {
  code: string
  name: string
}

// All Google-supported locations (116 total from CSV)
export const ALL_GOOGLE_LOCATIONS: Location[] = [
  // North America
  { code: 2840, name: "United States", type: "Country", countryCode: "US" },
  { code: 2124, name: "Canada", type: "Country", countryCode: "CA" },
  { code: 2484, name: "Mexico", type: "Country", countryCode: "MX" },
  
  // Europe
  { code: 2826, name: "United Kingdom", type: "Country", countryCode: "GB" },
  { code: 2276, name: "Germany", type: "Country", countryCode: "DE" },
  { code: 2250, name: "France", type: "Country", countryCode: "FR" },
  { code: 2380, name: "Italy", type: "Country", countryCode: "IT" },
  { code: 2724, name: "Spain", type: "Country", countryCode: "ES" },
  { code: 2528, name: "Netherlands", type: "Country", countryCode: "NL" },
  { code: 2616, name: "Poland", type: "Country", countryCode: "PL" },
  { code: 2642, name: "Romania", type: "Country", countryCode: "RO" },
  { code: 2203, name: "Czech Republic", type: "Country", countryCode: "CZ" },
  { code: 2348, name: "Hungary", type: "Country", countryCode: "HU" },
  { code: 2752, name: "Sweden", type: "Country", countryCode: "SE" },
  { code: 2578, name: "Norway", type: "Country", countryCode: "NO" },
  { code: 2208, name: "Denmark", type: "Country", countryCode: "DK" },
  { code: 2246, name: "Finland", type: "Country", countryCode: "FI" },
  { code: 2040, name: "Austria", type: "Country", countryCode: "AT" },
  { code: 2056, name: "Belgium", type: "Country", countryCode: "BE" },
  { code: 2756, name: "Switzerland", type: "Country", countryCode: "CH" },
  { code: 2372, name: "Ireland", type: "Country", countryCode: "IE" },
  { code: 2620, name: "Portugal", type: "Country", countryCode: "PT" },
  { code: 2300, name: "Greece", type: "Country", countryCode: "GR" },
  { code: 2703, name: "Slovakia", type: "Country", countryCode: "SK" },
  { code: 2100, name: "Bulgaria", type: "Country", countryCode: "BG" },
  { code: 2191, name: "Croatia", type: "Country", countryCode: "HR" },
  { code: 2705, name: "Slovenia", type: "Country", countryCode: "SI" },
  { code: 2440, name: "Lithuania", type: "Country", countryCode: "LT" },
  { code: 2428, name: "Latvia", type: "Country", countryCode: "LV" },
  { code: 2233, name: "Estonia", type: "Country", countryCode: "EE" },
  { code: 2499, name: "Montenegro", type: "Country", countryCode: "ME" },
  { code: 2807, name: "North Macedonia", type: "Country", countryCode: "MK" },
  { code: 2008, name: "Albania", type: "Country", countryCode: "AL" },
  { code: 2070, name: "Bosnia and Herzegovina", type: "Country", countryCode: "BA" },
  { code: 2688, name: "Serbia", type: "Country", countryCode: "RS" },
  { code: 2804, name: "Ukraine", type: "Country", countryCode: "UA" },
  { code: 2112, name: "Belarus", type: "Country", countryCode: "BY" },
  { code: 2498, name: "Moldova", type: "Country", countryCode: "MD" },
  
  // Asia-Pacific
  { code: 2036, name: "Australia", type: "Country", countryCode: "AU" },
  { code: 2554, name: "New Zealand", type: "Country", countryCode: "NZ" },
  { code: 2392, name: "Japan", type: "Country", countryCode: "JP" },
  { code: 2156, name: "China", type: "Country", countryCode: "CN" },
  { code: 2410, name: "South Korea", type: "Country", countryCode: "KR" },
  { code: 2356, name: "India", type: "Country", countryCode: "IN" },
  { code: 2360, name: "Indonesia", type: "Country", countryCode: "ID" },
  { code: 2458, name: "Malaysia", type: "Country", countryCode: "MY" },
  { code: 2702, name: "Singapore", type: "Country", countryCode: "SG" },
  { code: 2764, name: "Thailand", type: "Country", countryCode: "TH" },
  { code: 2704, name: "Vietnam", type: "Country", countryCode: "VN" },
  { code: 2608, name: "Philippines", type: "Country", countryCode: "PH" },
  { code: 2586, name: "Pakistan", type: "Country", countryCode: "PK" },
  { code: 2050, name: "Bangladesh", type: "Country", countryCode: "BD" },
  { code: 2144, name: "Sri Lanka", type: "Country", countryCode: "LK" },
  { code: 2524, name: "Nepal", type: "Country", countryCode: "NP" },
  { code: 2096, name: "Brunei", type: "Country", countryCode: "BN" },
  { code: 2116, name: "Cambodia", type: "Country", countryCode: "KH" },
  { code: 2418, name: "Laos", type: "Country", countryCode: "LA" },
  { code: 2104, name: "Myanmar", type: "Country", countryCode: "MM" },
  { code: 2344, name: "Hong Kong", type: "Region", countryCode: "HK" },
  { code: 2446, name: "Macao", type: "Region", countryCode: "MO" },
  { code: 2158, name: "Taiwan", type: "Region", countryCode: "TW" },
  
  // Middle East
  { code: 2784, name: "United Arab Emirates", type: "Country", countryCode: "AE" },
  { code: 2682, name: "Saudi Arabia", type: "Country", countryCode: "SA" },
  { code: 2376, name: "Israel", type: "Country", countryCode: "IL" },
  { code: 2792, name: "Turkey", type: "Country", countryCode: "TR" },
  { code: 2818, name: "Egypt", type: "Country", countryCode: "EG" },
  { code: 2368, name: "Iraq", type: "Country", countryCode: "IQ" },
  { code: 2400, name: "Jordan", type: "Country", countryCode: "JO" },
  { code: 2414, name: "Kuwait", type: "Country", countryCode: "KW" },
  { code: 2422, name: "Lebanon", type: "Country", countryCode: "LB" },
  { code: 2512, name: "Oman", type: "Country", countryCode: "OM" },
  { code: 2634, name: "Qatar", type: "Country", countryCode: "QA" },
  { code: 2048, name: "Bahrain", type: "Country", countryCode: "BH" },
  { code: 2275, name: "Palestine", type: "Territory", countryCode: "PS" },
  { code: 2887, name: "Yemen", type: "Country", countryCode: "YE" },
  
  // Africa
  { code: 2710, name: "South Africa", type: "Country", countryCode: "ZA" },
  { code: 2566, name: "Nigeria", type: "Country", countryCode: "NG" },
  { code: 2404, name: "Kenya", type: "Country", countryCode: "KE" },
  { code: 2818, name: "Egypt", type: "Country", countryCode: "EG" },
  { code: 2504, name: "Morocco", type: "Country", countryCode: "MA" },
  { code: 2012, name: "Algeria", type: "Country", countryCode: "DZ" },
  { code: 2788, name: "Tunisia", type: "Country", countryCode: "TN" },
  { code: 2288, name: "Ghana", type: "Country", countryCode: "GH" },
  { code: 2800, name: "Uganda", type: "Country", countryCode: "UG" },
  { code: 2834, name: "Tanzania", type: "Country", countryCode: "TZ" },
  { code: 2231, name: "Ethiopia", type: "Country", countryCode: "ET" },
  { code: 2894, name: "Zambia", type: "Country", countryCode: "ZM" },
  { code: 2716, name: "Zimbabwe", type: "Country", countryCode: "ZW" },
  { code: 2508, name: "Mozambique", type: "Country", countryCode: "MZ" },
  { code: 2454, name: "Malawi", type: "Country", countryCode: "MW" },
  { code: 2072, name: "Botswana", type: "Country", countryCode: "BW" },
  { code: 2516, name: "Namibia", type: "Country", countryCode: "NA" },
  { code: 2480, name: "Mauritius", type: "Country", countryCode: "MU" },
  { code: 2690, name: "Seychelles", type: "Country", countryCode: "SC" },
  
  // Latin America & Caribbean
  { code: 2076, name: "Brazil", type: "Country", countryCode: "BR" },
  { code: 2032, name: "Argentina", type: "Country", countryCode: "AR" },
  { code: 2152, name: "Chile", type: "Country", countryCode: "CL" },
  { code: 2170, name: "Colombia", type: "Country", countryCode: "CO" },
  { code: 2604, name: "Peru", type: "Country", countryCode: "PE" },
  { code: 2858, name: "Uruguay", type: "Country", countryCode: "UY" },
  { code: 2862, name: "Venezuela", type: "Country", countryCode: "VE" },
  { code: 2218, name: "Ecuador", type: "Country", countryCode: "EC" },
  { code: 2068, name: "Bolivia", type: "Country", countryCode: "BO" },
  { code: 2600, name: "Paraguay", type: "Country", countryCode: "PY" },
  { code: 2188, name: "Costa Rica", type: "Country", countryCode: "CR" },
  { code: 2591, name: "Panama", type: "Country", countryCode: "PA" },
  { code: 2320, name: "Guatemala", type: "Country", countryCode: "GT" },
  { code: 2340, name: "Honduras", type: "Country", countryCode: "HN" },
  { code: 2558, name: "Nicaragua", type: "Country", countryCode: "NI" },
  { code: 2222, name: "El Salvador", type: "Country", countryCode: "SV" },
  { code: 2214, name: "Dominican Republic", type: "Country", countryCode: "DO" },
  { code: 2388, name: "Jamaica", type: "Country", countryCode: "JM" },
  { code: 2780, name: "Trinidad and Tobago", type: "Country", countryCode: "TT" },
  { code: 2044, name: "Bahamas", type: "Country", countryCode: "BS" },
  { code: 2052, name: "Barbados", type: "Country", countryCode: "BB" },
]

// Popular languages for keyword research
export const ALL_LANGUAGES: Language[] = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "tr", name: "Turkish" },
  { code: "hi", name: "Hindi" },
  { code: "th", name: "Thai" },
  { code: "vi", name: "Vietnamese" },
  { code: "id", name: "Indonesian" },
  { code: "ms", name: "Malay" },
  { code: "sv", name: "Swedish" },
  { code: "no", name: "Norwegian" },
  { code: "da", name: "Danish" },
  { code: "fi", name: "Finnish" },
  { code: "cs", name: "Czech" },
  { code: "hu", name: "Hungarian" },
  { code: "ro", name: "Romanian" },
  { code: "uk", name: "Ukrainian" },
  { code: "el", name: "Greek" },
  { code: "he", name: "Hebrew" },
  { code: "bn", name: "Bengali" },
  { code: "ur", name: "Urdu" },
]

// Group locations by region for better UX
export const LOCATIONS_BY_REGION = {
  "North America": ALL_GOOGLE_LOCATIONS.filter(l => 
    ["US", "CA", "MX"].includes(l.countryCode)
  ),
  "Europe": ALL_GOOGLE_LOCATIONS.filter(l => 
    ["GB", "DE", "FR", "IT", "ES", "NL", "PL", "SE", "NO", "DK", "FI", "AT", "BE", "CH", "IE", "PT", "GR", "CZ", "HU", "RO", "SK", "BG", "HR", "SI", "LT", "LV", "EE"].includes(l.countryCode)
  ),
  "Asia-Pacific": ALL_GOOGLE_LOCATIONS.filter(l => 
    ["AU", "NZ", "JP", "CN", "KR", "IN", "ID", "MY", "SG", "TH", "VN", "PH", "PK", "BD", "LK", "HK", "TW"].includes(l.countryCode)
  ),
  "Middle East": ALL_GOOGLE_LOCATIONS.filter(l => 
    ["AE", "SA", "IL", "TR", "EG", "IQ", "JO", "KW", "LB", "OM", "QA", "BH"].includes(l.countryCode)
  ),
  "Africa": ALL_GOOGLE_LOCATIONS.filter(l => 
    ["ZA", "NG", "KE", "MA", "DZ", "TN", "GH", "UG", "TZ", "ET"].includes(l.countryCode)
  ),
  "Latin America": ALL_GOOGLE_LOCATIONS.filter(l => 
    ["BR", "AR", "CL", "CO", "PE", "UY", "VE", "EC", "BO", "PY", "CR", "PA", "GT", "HN", "NI", "SV", "DO", "JM", "TT"].includes(l.countryCode)
  ),
}

// Helper function to search locations
export function searchLocations(query: string): Location[] {
  const q = query.toLowerCase()
  return ALL_GOOGLE_LOCATIONS.filter(loc => 
    loc.name.toLowerCase().includes(q) || 
    loc.countryCode.toLowerCase().includes(q)
  ).slice(0, 50) // Limit to 50 results
}