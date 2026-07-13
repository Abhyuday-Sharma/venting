"use client"

import React, { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react"

export default function ShaderBackground() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Define colors for each theme
  let colors = {
    color1: "#DEE2FD", // Light Pastel Lavender-blue
    color2: "#F1F5F9", // Light Grey
    color3: "#E2E8F0", // Slate Light
  }

  if (resolvedTheme === "dark") {
    colors = {
      color1: "#070814", // Very deep dark navy-black
      color2: "#110b29", // Calming deep indigo
      color3: "#070c1e", // Restful slate
    }
  } else if (resolvedTheme === "enlighten") {
    colors = {
      color1: "#fbe2d3", // Soft sunrise peach
      color2: "#e0f2f1", // Peaceful minty water
      color3: "#f3e5f5", // Soft lilac
    }
  }

  return (
    <div className="fixed inset-0 -z-10 h-full w-full pointer-events-none select-none overflow-hidden bg-background">
      <ShaderGradientCanvas 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <ShaderGradient
          control="props"
          type="waterPlane"
          animate="on"
          uSpeed={0.2}
          uStrength={1.5}
          uDensity={1.2}
          color1={colors.color1}
          color2={colors.color2}
          color3={colors.color3}
          cAzimuthAngle={180}
          cPolarAngle={90}
          cDistance={3.6}
          cameraZoom={1}
          grain="off"
        />
      </ShaderGradientCanvas>
    </div>
  )
}
