import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Reviu — Code review that reads your codebase",
  description: "AI-powered PR reviews with full RAG context, intent verification, and confidence scoring.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
