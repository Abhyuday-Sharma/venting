"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

/**
 * The "enlighten" theme was removed. next-themes only strips classes for themes
 * it still knows about, so anyone carrying it in localStorage would keep a dead
 * .enlighten class with no CSS behind it. Move them back to the default.
 */
function RetiredThemeMigration() {
  const { theme, setTheme } = useTheme()

  React.useEffect(() => {
    if (theme !== "enlighten") return
    document.documentElement.classList.remove("enlighten")
    setTheme("system")
  }, [theme, setTheme])

  return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <RetiredThemeMigration />
      {children}
    </NextThemesProvider>
  )
}
