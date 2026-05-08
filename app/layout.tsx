import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Reviu — The AI Code Reviewer That Reads Your Entire Codebase",
  description: "AI-powered PR reviews that index your entire repository to provide full RAG context, intent verification, and adjustable confidence scoring for every finding.",
  openGraph: {
    title: "Reviu — The AI Code Reviewer That Reads Your Entire Codebase",
    description: "AI-powered PR reviews that index your entire repository to provide full RAG context, intent verification, and adjustable confidence scoring for every finding.",
    url: "https://reviu-dashboard.vercel.app",
    images: [
      {
        url: "https://reviu-dashboard.vercel.app/preview.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reviu — The AI Code Reviewer That Reads Your Entire Codebase",
    description: "AI-powered PR reviews that index your entire repository to provide full RAG context, intent verification, and adjustable confidence scoring for every finding.",
    images: ["https://reviu-dashboard.vercel.app/preview.png"],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
