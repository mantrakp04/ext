"use client"

import { useQuery } from "@tanstack/react-query"
import { TrendingUp, TrendingDown, BarChart3, RefreshCw } from "lucide-react"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Widget, WidgetContent, WidgetConfig } from './WidgetCard'
import { Widget as WidgetType } from "./Widgets"
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Tooltip
} from 'recharts'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  chartData: Array<{
    time: string
    price: number
    volume: number
  }>
}

// Mock data generator for demonstration
const generateMockChartData = (symbol: string, days: number = 30) => {
  const data = []
  const basePrice = Math.random() * 200 + 50 // Random base price between 50-250
  let currentPrice = basePrice
  
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    // Simulate realistic stock movement with much higher volatility
    const volatility = 0.15 // Increased significantly for more visible movement
    const trend = Math.sin(i * 0.3) * 0.02 // Add some trend
    const randomChange = (Math.random() - 0.5) * volatility * currentPrice
    const totalChange = randomChange + (trend * currentPrice)
    
    currentPrice += totalChange
    
    // Ensure price doesn't go negative but allow more variation
    currentPrice = Math.max(currentPrice, basePrice * 0.5)
    
    data.push({
      time: date.toISOString().split('T')[0],
      price: Math.round(currentPrice * 100) / 100,
      volume: Math.floor(Math.random() * 1000000) + 100000
    })
  }
  
  return data
}

const fetchStockData = async (symbol: string): Promise<StockData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const basePrice = Math.random() * 200 + 50
  // Create more dramatic changes for better visualization
  const changePercent = (Math.random() - 0.5) * 12 // -6% to +6% range for more visible changes
  const change = (changePercent / 100) * basePrice
  
  return {
    symbol,
    name: symbol === 'AAPL' ? 'Apple Inc.' : 
          symbol === 'GOOGL' ? 'Alphabet Inc.' : 
          symbol === 'MSFT' ? 'Microsoft Corporation' :
          symbol === 'TSLA' ? 'Tesla Inc.' :
          symbol === 'AMZN' ? 'Amazon.com Inc.' :
          `${symbol} Corporation`,
    price: Math.round(basePrice * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    volume: Math.floor(Math.random() * 10000000) + 1000000,
    marketCap: Math.floor(Math.random() * 2000000000000) + 100000000000,
    chartData: generateMockChartData(symbol)
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}

const formatVolume = (volume: number) => {
  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toFixed(1)}B`
  } else if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`
  }
  return volume.toString()
}

export function StockWidget({ props }: { props: {
  widget: WidgetType,
  onRemove: (widgetId: string) => void,
  onConfigChange: (widgetId: string, config: Record<string, any>) => void
}}) {
  const { widget, onRemove, onConfigChange } = props;
  const [symbol, setSymbol] = useState<string>(widget.config.symbol || 'AAPL');
  
  const { data: stock, isLoading, error, refetch } = useQuery({
    queryKey: ['stock', symbol],
    queryFn: () => fetchStockData(symbol),
    enabled: !!symbol,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    retry: 2,
  })

  if (isLoading) {
    return (
      <Widget widget={widget} onRemove={onRemove}>
        <WidgetContent>
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto animate-pulse" strokeWidth={1.5} />
              <p className="text-xs text-muted-foreground font-medium">Loading...</p>
            </div>
          </div>
        </WidgetContent>
        
        <WidgetConfig onSubmit={(e) => {
          e.preventDefault();
          onConfigChange(widget.id, { ...widget.config, symbol });
        }}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Stock Symbol</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., AAPL"
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a single stock symbol
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

  if (error || !stock) {
    return (
      <Widget widget={widget} onRemove={onRemove}>
        <WidgetContent>
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto" strokeWidth={1.5} />
              <div>
                <p className="text-xs text-foreground font-medium">Stock unavailable</p>
                <p className="text-xs text-muted-foreground mt-1">Configure symbol in settings</p>
              </div>
            </div>
          </div>
        </WidgetContent>
        
        <WidgetConfig onSubmit={(e) => {
          e.preventDefault();
          onConfigChange(widget.id, { ...widget.config, symbol });
        }}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Stock Symbol</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., AAPL"
                className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a single stock symbol
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
          {/* Header with refresh button */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-xs text-muted-foreground font-mono">{stock.symbol}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 -mr-1"
              onClick={() => refetch()}
              title="Refresh data"
            >
              <RefreshCw className="h-3 w-3" strokeWidth={1.5} />
            </Button>
          </div>

          {/* Stock info */}
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{formatPrice(stock.price)}</p>
                <p className="text-xs text-muted-foreground truncate">{stock.name}</p>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 text-xs ${
                  stock.change >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stock.change >= 0 ? (
                    <TrendingUp className="h-3 w-3" strokeWidth={1.5} />
                  ) : (
                    <TrendingDown className="h-3 w-3" strokeWidth={1.5} />
                  )}
                  <span>{stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {stock.change >= 0 ? '+' : ''}{formatPrice(stock.change)}
                </p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="flex-1 min-h-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stock.chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id={`gradient-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop 
                      offset="5%" 
                      stopColor={stock.change >= 0 ? "#22c55e" : "#ef4444"} 
                      stopOpacity={0.3}
                    />
                    <stop 
                      offset="95%" 
                      stopColor={stock.change >= 0 ? "#22c55e" : "#ef4444"} 
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={stock.change >= 0 ? "#22c55e" : "#ef4444"}
                  strokeWidth={2}
                  fill={`url(#gradient-${stock.symbol})`}
                  dot={false}
                  activeDot={{ r: 3, fill: stock.change >= 0 ? "#22c55e" : "#ef4444" }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
                          <p className="text-xs text-muted-foreground">{label}</p>
                          <p className="text-sm font-semibold text-foreground">
                            {formatPrice(payload[0].value as number)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Volume */}
          <div className="mt-2 text-center">
            <span className="text-xs text-muted-foreground">Vol: </span>
            <span className="text-xs font-medium text-foreground">{formatVolume(stock.volume)}</span>
          </div>
        </div>
      </WidgetContent>

      <WidgetConfig onSubmit={(e) => {
        e.preventDefault();
        onConfigChange(widget.id, { ...widget.config, symbol });
      }}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Stock Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., AAPL"
              className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background text-foreground"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter a single stock symbol
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