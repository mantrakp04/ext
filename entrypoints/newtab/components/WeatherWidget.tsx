import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer } from 'lucide-react';
import { settingsAtom } from '../store/settings';

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

const getWeatherIcon = (icon: string) => {
  switch (icon) {
    case '01d':
    case '01n':
      return <Sun className="h-8 w-8 text-yellow-500" />;
    case '02d':
    case '02n':
    case '03d':
    case '03n':
    case '04d':
    case '04n':
      return <Cloud className="h-8 w-8 text-gray-500" />;
    case '09d':
    case '09n':
    case '10d':
    case '10n':
      return <CloudRain className="h-8 w-8 text-blue-500" />;
    case '11d':
    case '11n':
      return <CloudRain className="h-8 w-8 text-purple-500" />;
    case '13d':
    case '13n':
      return <CloudSnow className="h-8 w-8 text-blue-300" />;
    default:
      return <Cloud className="h-8 w-8 text-gray-500" />;
  }
};

export function WeatherWidget() {
  const [settings] = useAtom(settingsAtom);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!settings.showWeather || !settings.weatherLocation) {
        setLoading(false);
        return;
      }

      try {
        // Using OpenWeatherMap API (you'll need to get a free API key)
        const API_KEY = 'your_api_key_here'; // Replace with actual API key
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(settings.weatherLocation)}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
          throw new Error('Weather data not available');
        }

        const data = await response.json();
        setWeather({
          temperature: Math.round(data.main.temp),
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
          location: data.name,
        });
      } catch (err) {
        setError('Weather unavailable');
        console.error('Weather fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [settings.showWeather, settings.weatherLocation]);


  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm h-full w-full flex items-center justify-center">
        <div className="text-center">
          <Cloud className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading weather...</p>
        </div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm h-full w-full flex items-center justify-center">
        <div className="text-center">
          <Cloud className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{error || 'Weather unavailable'}</p>
          <p className="text-xs text-muted-foreground mt-1">Set location in settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm h-full w-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">Weather</h3>
        <span className="text-xs text-muted-foreground">{weather.location}</span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center justify-center mb-3">
          {getWeatherIcon(weather.icon)}
          <div className="ml-3">
            <div className="text-2xl font-light">{weather.temperature}°C</div>
            <div className="text-xs text-muted-foreground capitalize">{weather.description}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Wind className="h-3 w-3 text-muted-foreground" />
            <span>{weather.windSpeed} km/h</span>
          </div>
          <div className="flex items-center gap-1">
            <Thermometer className="h-3 w-3 text-muted-foreground" />
            <span>{weather.humidity}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
