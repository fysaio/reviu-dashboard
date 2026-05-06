import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Reviu — AI PR Reviewer",
  description: "Agentic code review that knows your codebase. Junior/senior mode, intent verification, confidence scoring.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
