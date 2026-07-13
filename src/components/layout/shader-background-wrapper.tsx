"use client"

import dynamic from 'next/dynamic'

const ShaderBackgroundInner = dynamic(
  () => import('./shader-background'),
  { ssr: false }
)

export default function ShaderBackgroundWrapper() {
  return <ShaderBackgroundInner />
}
