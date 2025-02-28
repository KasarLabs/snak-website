import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { SearchProvider } from "./plugins/context/SearchContext";
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Snak",
  icons: [
	{
		rel: 'icon',
		type: 'image/png',
		url: '/favicon-dark.ico',
		media: '(prefers-color-scheme: dark)',
	  },
    {
      rel: 'icon',
      type: 'image/x-icon',
      url: '/favicon-light.ico',
      media: '(prefers-color-scheme: light)',
    },
  ],
  description:
    "A powerful and simple toolkit for creating AI agents that can interact with the Starknet blockchain. Build autonomous agents for DeFi, NFTs, and more.",
  keywords: [
    "Starknet",
    "blockchain",
    "AI agents",
    "DeFi",
    "smart contracts",
    "web3",
    "cryptocurrency",
  ],
  robots: "index, follow",
  openGraph: {
    title: "Snak",
    description: "Build powerful and secure AI Agents on Starknet.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Starknet Agent Kit",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Snak",
    description: "Build powerful and secure AI Agents on Starknet.",
    creator: "@kasarlabs",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://starkagent.ai" />
      </head>
      <body className="bg-black">
        <SearchProvider>
          <Header />
          <main className="min-h-screen flex flex-col items-center justify-center">
            {children}
          </main>
          <Footer />
          <Toaster />
        </SearchProvider>
      </body>
    </html>
  );
}
