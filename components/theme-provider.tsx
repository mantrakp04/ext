import { useEffect } from "react"
import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { settingsAtom } from "@/entrypoints/newtab/store/settings"

type Theme = "dark" | "light" | "system"

const themeAtom = atomWithStorage<Theme>("vite-ui-theme", "system")

export function useTheme() {
  const [theme, setTheme] = useAtom(themeAtom)
  
  return {
    theme,
    setTheme,
  }
}

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="hover:bg-accent/50"
    >
      <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useAtom(themeAtom)
  const [settings] = useAtom(settingsAtom)

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  useEffect(() => {
    const body = window.document.body
    
    if (settings.backgroundImage) {
      body.style.backgroundImage = `url(${settings.backgroundImage})`
      body.style.backgroundSize = 'cover'
      body.style.backgroundPosition = 'center'
      body.style.backgroundRepeat = 'no-repeat'
      body.style.backgroundAttachment = 'fixed'
    } else {
      body.style.backgroundImage = ''
      body.style.backgroundSize = ''
      body.style.backgroundPosition = ''
      body.style.backgroundRepeat = ''
      body.style.backgroundAttachment = ''
    }
  }, [settings.backgroundImage])

  return <>{children}</>
}

export function BackgroundWrapper({ children }: { children: React.ReactNode }) {
  const [settings] = useAtom(settingsAtom)

  const backgroundStyle = settings.backgroundImage 
    ? {
        backgroundImage: `url(${settings.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }
    : {};

  return (
    <div 
      className="h-screen w-full bg-background p-2"
      style={backgroundStyle}
    >
      {/* Semi-transparent overlay for better text readability */}
      {settings.backgroundImage && (
        <div className="absolute inset-0 bg-black/20 pointer-events-none" />
      )}
      {children}
    </div>
  )
}
