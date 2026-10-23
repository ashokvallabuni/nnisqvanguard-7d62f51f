import { createContext, useContext, useEffect, useState, useCallback } from "react"

export type Theme = "dark" | "light"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "dark",
  setTheme: () => null,
  toggleTheme: () => null,
})

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "nisq-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored =
        localStorage.getItem(storageKey) || localStorage.getItem("course-theme")
      if (stored === "light" || stored === "dark") return stored
    } catch {}
    return defaultTheme
  })

  const applyDomTheme = useCallback((targetTheme: Theme) => {
    const root = window.document.documentElement
    root.setAttribute("data-theme", targetTheme)
    if (targetTheme === "dark") {
      root.classList.add("dark")
      root.classList.remove("light")
      root.style.colorScheme = "dark"
    } else {
      root.classList.add("light")
      root.classList.remove("dark")
      root.style.colorScheme = "light"
    }
    window.dispatchEvent(new CustomEvent("nisq-theme-change", { detail: targetTheme }))
  }, [])

  useEffect(() => {
    applyDomTheme(theme)
  }, [theme, applyDomTheme])

  const setTheme = useCallback(
    (newTheme: Theme) => {
      try {
        localStorage.setItem(storageKey, newTheme)
        localStorage.setItem("course-theme", newTheme)
      } catch {}

      if (document.startViewTransition) {
        document.documentElement.classList.add("theme-switching")
        document
          .startViewTransition(() => {
            setThemeState(newTheme)
            applyDomTheme(newTheme)
          })
          .finished.finally(() => {
            document.documentElement.classList.remove("theme-switching")
          })
      } else {
        setThemeState(newTheme)
        applyDomTheme(newTheme)
      }
    },
    [storageKey, applyDomTheme]
  )

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [theme, setTheme])

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme, toggleTheme }} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
