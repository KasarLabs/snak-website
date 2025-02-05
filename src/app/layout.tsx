import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Starknet Agent Kit",
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
    title: "Starknet Agent Kit | AI Agents for Starknet Blockchain",
    description:
      "Create powerful AI agents for Starknet blockchain. Build autonomous agents for DeFi, NFTs, and more.",
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
    title: "Starknet Agent Kit | AI Agents for Starknet Blockchain",
    description:
      "Create powerful AI agents for Starknet blockchain. Build autonomous agents for DeFi, NFTs, and more.",
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
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
