"use client";

import Terminal from "./components/Terminal";
import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 py-24 md:py-4">
      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Left side - Title and Description */}
        <div className="text-center md:text-left">
          <div className="flex items-center gap-4 mb-6 justify-center md:justify-start">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white/90">
              <span className={`${inter.className} text-gray-100 font-light`}>
                Build powerful and secure AI Agents on Starknet.
              </span>
            </h1>
          </div>
          <div className="flex flex-col space-y-8">
            <div className="flex gap-2 items-center justify-center md:justify-start">
              <p className="font-ppsans text-sm md:text-lg text-[#787B7E]">
                powered by
              </p>

              <a
                href="https://kasar.io"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform duration-300 hover:scale-105"
              >
                <Image
                  src="https://github.com/KasarLabs/brand/blob/main/kasar/logo/KasarWhiteLogo.png?raw=true"
                  alt="Kasarlabs"
                  width={84}
                  height={0}
                  className="w-28"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Right side - Terminal */}
        <Terminal />
      </div>
    </div>
  );
}
