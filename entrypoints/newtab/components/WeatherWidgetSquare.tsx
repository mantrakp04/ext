"use client"

import { useState, useEffect } from "react"
import { useAtom } from "jotai"
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets } from "lucide-react"
import { settingsAtom } from "../store/settings"

interface WeatherData {
  temperature: number
  description: string
  icon: string
  humidity: number
  windSpeed: number
  location: string
}

const WEATHER_ICONS: Record<string, { icon: typeof Sun; className: string }> = {
  "01d": { icon: Sun, className: "text-amber-500" },
  "01n": { icon: Sun, className: "text-amber-400" },
  "02d": { icon: Cloud, className: "text-slate-400" },
  "02n": { icon: Cloud, className: "text-slate-400" },
  "03d": { icon: Cloud, className: "text-slate-400" },
  "03n": { icon: Cloud, className: "text-slate-400" },
  "04d": { icon: Cloud, className: "text-slate-500" },
  "04n": { icon: Cloud, className: "text-slate-500" },
  "09d": { icon: CloudRain, className: "text-blue-500" },
  "09n": { icon: CloudRain, className: "text-blue-500" },
  "10d": { icon: CloudRain, className: "text-blue-500" },
  "10n": { icon: CloudRain, className: "text-blue-500" },
  "11d": { icon: CloudRain, className: "text-violet-500" },
  "11n": { icon: CloudRain, className: "text-violet-500" },
  "13d": { icon: CloudSnow, className: "text-cyan-400" },
  "13n": { icon: CloudSnow, className: "text-cyan-400" },
}

const getWeatherIcon = (code: string) => {
  const config = WEATHER_ICONS[code] || { icon: Cloud, className: "text-slate-400" }
  const Icon = config.icon
  return <Icon className={`h-8 w-8 ${config.className}`} strokeWidth={1.5} />
}

export function WeatherWidgetSquare() {
  const [settings] = useAtom(settingsAtom)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      if (!settings.showWeather || !settings.weatherLocation) {
        setLoading(false)
        return
      }

      try {
        const location = settings.weatherLocation
        const response = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`)

        if (!response.ok) {
          throw new Error("Weather data not available")
        }

        const data = await response.json()
        const current = data.current_condition[0]

        setWeather({
          temperature: Number.parseInt(current.temp_C),
          description: current.weatherDesc[0].value,
          icon: current.weatherCode,
          humidity: Number.parseInt(current.humidity),
          windSpeed: Number.parseInt(current.windspeedKmph),
          location: data.nearest_area[0].areaName[0].value,
        })
        setError(null)
      } catch (err) {
        setError("Weather unavailable")
        console.error("Weather fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
    const interval = setInterval(fetchWeather, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [settings.showWeather, settings.weatherLocation])

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm h-full w-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <Cloud className="h-8 w-8 text-muted-foreground mx-auto animate-pulse" strokeWidth={1.5} />
          <p className="text-xs text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm h-full w-full flex items-center justify-center">
        <div className="text-center space-y-2">
          <Cloud className="h-8 w-8 text-muted-foreground mx-auto" strokeWidth={1.5} />
          <div>
            <p className="text-xs text-foreground font-medium">{error || "Weather unavailable"}</p>
            <p className="text-xs text-muted-foreground mt-1">Set location in settings</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm h-full w-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-mono">{weather.location}</span>
        <span className="text-xs text-muted-foreground font-mono capitalize">{weather.description}</span>
      </div>

      {/* Main weather display - centered for square layout */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-3">
        {/* Weather icon and temperature */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            {getWeatherIcon(weather.icon)}
            <div className="text-3xl font-light tracking-tight text-foreground">{weather.temperature}°</div>
          </div>
        </div>

        {/* Weather details - compact grid */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="flex flex-col items-center gap-1">
            <Wind className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-xs text-muted-foreground">Wind</p>
            <p className="text-xs font-medium text-foreground">{weather.windSpeed} km/h</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Droplets className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-xs text-muted-foreground">Humidity</p>
            <p className="text-xs font-medium text-foreground">{weather.humidity}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
