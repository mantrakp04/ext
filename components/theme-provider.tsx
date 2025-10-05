import { useEffect } from "react"
import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

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

  return <>{children}</>
}
