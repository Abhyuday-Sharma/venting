"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Moon, Sun, Monitor, Sunrise } from "lucide-react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="grid grid-cols-4 gap-2 rounded-lg border p-1">
      <Button
        variant={theme === "light" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setTheme("light")}
        className="flex items-center gap-2"
      >
        <Sun className="h-4 w-4" />
        Light
      </Button>
      <Button
        variant={theme === "dark" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setTheme("dark")}
        className="flex items-center gap-2"
      >
        <Moon className="h-4 w-4" />
        Dark
      </Button>
      <Button
        variant={theme === "system" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setTheme("system")}
        className="flex items-center gap-2"
      >
        <Monitor className="h-4 w-4" />
        System
      </Button>
      <Button
        variant={theme === "enlighten" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setTheme("enlighten")}
        className="flex items-center gap-2"
      >
        <Sunrise className="h-4 w-4" />
        Enlighten
      </Button>
    </div>
  )
}
