
import { useQuery } from "@tanstack/react-query"
import { TrendingUp, TrendingDown, BarChart3, RefreshCw } from "lucide-react"
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Widget, WidgetContent, WidgetConfig } from './WidgetCard'
import { Widget as WidgetType } from "./Widgets"
import debounce from 'debounce'
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  chartData: Array<{ time: string; price: number; volume: number }>
}

const API_URL = 'https://www.alphavantage.co/query'
const API_KEY = 'SYTCQBUIU44BX2G4'

const fetchStock = async (symbol: string): Promise<StockData> => {
  const fetch3 = (func: string) => fetch(`${API_URL}?function=${func}&symbol=${symbol}&apikey=${API_KEY}`).then(r => r.json())

  const [quote, timeSeries, overview] = await Promise.all([
    fetch3('GLOBAL_QUOTE'),
    fetch3('TIME_SERIES_DAILY'),
    fetch3('OVERVIEW')
  ])

  const q = quote['Global Quote']
  if (!q?.['05. price']) throw new Error(`Symbol ${symbol} not found`)

  const ts = timeSeries['Time Series (Daily)']
  if (!ts) throw new Error(`No data for ${symbol}`)

  const dates = Object.keys(ts).sort().reverse().slice(0, 30).reverse()
  const chartData = dates.map(d => ({
    time: d,
    price: parseFloat(ts[d]['4. close']),
    volume: parseInt(ts[d]['5. volume'], 10)
  }))

  return {
    symbol,
    name: overview['Name'] || `${symbol} Corp`,
    price: parseFloat(q['05. price']),
    change: parseFloat(q['09. change']),
    changePercent: parseFloat(q['10. change percent'].replace('%', '')),
    volume: parseInt(q['06. volume'], 10),
    marketCap: parseInt(overview['MarketCapitalization'] || 0, 10),
    chartData
  }
}

const formatPrice = (p: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p)

const formatVolume = (v: number) => {
  if (v >= 1e9) return `${(v / 1e9).toFixed(1)}B`
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`
  return v.toString()
}

export function StockWidget({ props }: { props: {
  widget: WidgetType
  onRemove: (id: string) => void
  onConfigChange: (id: string, config: any) => void
}}) {
  const { widget, onRemove, onConfigChange } = props
  const [symbol, setSymbol] = useState(widget.config.symbol || 'AAPL')
  const [searchSymbol, setSearchSymbol] = useState(widget.config.symbol || 'AAPL')

  const debouncedSearch = useRef(debounce((s: string) => {
    if (s.trim()) setSearchSymbol(s.toUpperCase().trim())
  }, 500)).current

  useEffect(() => {
    debouncedSearch(symbol)
  }, [symbol, debouncedSearch])

  const { data: stock, isLoading, error, refetch } = useQuery({
    queryKey: ['stock', searchSymbol],
    queryFn: () => fetchStock(searchSymbol),
    enabled: searchSymbol.length > 0,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 1
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
          onConfigChange(widget.id, { ...widget.config, symbol: searchSymbol });
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
                <p className="text-xs text-muted-foreground mt-1">
                  {error ? `${error.message}` : 'Configure symbol in settings'}
                </p>
              </div>
            </div>
          </div>
        </WidgetContent>
        
        <WidgetConfig onSubmit={(e) => {
          e.preventDefault();
          onConfigChange(widget.id, { ...widget.config, symbol: searchSymbol });
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
        onConfigChange(widget.id, { ...widget.config, symbol: searchSymbol });
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