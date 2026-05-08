import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Reviu — Code review that reads your codebase",
  description: "AI-powered PR reviews with full RAG context, intent verification, and confidence scoring.",
  openGraph: {
    title: "Reviu — Code review that reads your codebase",
    description: "AI-powered PR reviews with full RAG context, intent verification, and confidence scoring.",
    url: "https://reviu.vercel.app",
    images: [
      {
        url: "https://reviu.vercel.app/preview.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reviu — Code review that reads your codebase",
    description: "AI-powered PR reviews with full RAG context, intent verification, and confidence scoring.",
    images: ["https://reviu.vercel.app/preview.png"],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
