"use client"

import { useQuery } from "@tanstack/react-query"
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets } from "lucide-react"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Widget, WidgetContent, WidgetConfig } from './WidgetCard'
import { Widget as WidgetType } from "./Widgets"

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

const fetchWeatherData = async (location: string): Promise<WeatherData> => {
  const response = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`)

  if (!response.ok) {
    throw new Error("Weather data not available")
  }

  const data = await response.json()
  const current = data.current_condition[0]

  return {
    temperature: Number.parseInt(current.temp_C),
    description: current.weatherDesc[0].value,
    icon: current.weatherCode,
    humidity: Number.parseInt(current.humidity),
    windSpeed: Number.parseInt(current.windspeedKmph),
    location: data.nearest_area[0].areaName[0].value,
  }
}

export function WeatherWidgetSquare({ props }: { props: {
  widget: WidgetType,
  onRemove: (widgetId: string) => void,
  onConfigChange: (widgetId: string, config: Record<string, any>) => void
}}) {
  const { widget, onRemove, onConfigChange } = props;
  const [location, setLocation] = useState(widget.config.location || '');
  
  const { data: weather, isLoading, error } = useQuery({
    queryKey: ['weather', widget.config.location],
    queryFn: () => fetchWeatherData(widget.config.location),
    enabled: !!widget.config.location,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
    retry: 2,
  })

  if (isLoading) {
    return (
      <Widget widget={widget} onRemove={onRemove}>
        <WidgetContent>
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <Cloud className="h-8 w-8 text-muted-foreground mx-auto animate-pulse" strokeWidth={1.5} />
              <p className="text-xs text-muted-foreground font-medium">Loading...</p>
            </div>
          </div>
        </WidgetContent>
        
        <WidgetConfig onSubmit={(e) => {
          e.preventDefault();
          onConfigChange(widget.id, { ...widget.config, location });
        }}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Vancouver, London, Tokyo"
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a city name or location
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="submit">Save Changes</Button>
          </div>
        </WidgetConfig>
      </Widget>
    )
  }

  if (error || !weather) {
    return (
      <Widget widget={widget} onRemove={onRemove}>
        <WidgetContent>
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <Cloud className="h-8 w-8 text-muted-foreground mx-auto" strokeWidth={1.5} />
              <div>
                <p className="text-xs text-foreground font-medium">{error ? "Weather unavailable" : "Weather unavailable"}</p>
                <p className="text-xs text-muted-foreground mt-1">Set location in settings</p>
              </div>
            </div>
          </div>
        </WidgetContent>
        
        <WidgetConfig onSubmit={(e) => {
          e.preventDefault();
          onConfigChange(widget.id, { ...widget.config, location });
        }}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Vancouver, London, Tokyo"
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a city name or location
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="submit">Save Changes</Button>
          </div>
        </WidgetConfig>
      </Widget>
    )
  }

  return (
    <Widget widget={widget} onRemove={onRemove}>
      <WidgetContent>
        <div className="h-full w-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-mono truncate">{weather.location}</span>
            <span className="text-xs text-muted-foreground font-mono capitalize truncate ml-1">{weather.description}</span>
          </div>

          {/* Main weather display - centered for square layout */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-2 min-h-0">
            {/* Weather icon and temperature */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                {getWeatherIcon(weather.icon)}
                <div className="text-2xl font-light tracking-tight text-foreground">{weather.temperature}°</div>
              </div>
            </div>

            {/* Weather details - compact grid */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <div className="flex flex-col items-center gap-0.5">
                <Wind className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-xs text-muted-foreground">Wind</p>
                <p className="text-xs font-medium text-foreground">{weather.windSpeed} km/h</p>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Droplets className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-xs text-muted-foreground">Humidity</p>
                <p className="text-xs font-medium text-foreground">{weather.humidity}%</p>
              </div>
            </div>
          </div>
        </div>
      </WidgetContent>

      <WidgetConfig onSubmit={(e) => {
        e.preventDefault();
        onConfigChange(widget.id, { ...widget.config, location });
      }}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Vancouver, London, Tokyo"
              className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter a city name or location
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button type="submit">Save Changes</Button>
        </div>
      </WidgetConfig>
    </Widget>
  )
}