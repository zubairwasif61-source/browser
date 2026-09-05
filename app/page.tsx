'use client'

import { useState } from 'react'
import Browser from '@/components/Browser'

export default function Home() {
  return (
    <main className="w-full h-screen flex flex-col bg-white">
      <Browser />
    </main>
  )
}
