import Terminal from "./components/Terminal";
import { Github, Package, Twitter } from "lucide-react";
import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 py-24 md:py-4">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Left side - Title and Description */}
        <div className="text-center md:text-left">
          <div className="flex items-center gap-4 mb-6 justify-center md:justify-start">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-white/90">
              <span className={`${inter.className} text-gray-100 font-light`}>
                Build powerful and secured AI agents on Starknet.
              </span>
            </h1>
          </div>
          <div className="flex flex-col space-y-8">
            <div className="flex gap-2 items-center justify-center md:justify-start">
              <p className="font-ppsans text-md md:text-xl text-[#787B7E] ">
                powered by
              </p>

              <Image
                src="https://github.com/KasarLabs/brand/blob/main/kasar/logo/KasarWhiteLogo.png?raw=true"
                alt="Kasarlabs"
                width={84}
                height={0}
                className="w-28"
              />
            </div>

            <div className="flex space-x-6 justify-center md:justify-start">
              <a
                href="https://github.com/kasarlabs/starknet-agent-kit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors"
                aria-label="GitHub Repository"
              >
                <Github size={28} className="sm:w-8 sm:h-8" />
              </a>
              <a
                href="https://www.npmjs.com/package/starknet-agent-kit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors"
                aria-label="NPM Package"
              >
                <Package size={28} className="sm:w-8 sm:h-8" />
              </a>
              <a
                href="https://twitter.com/kasarlabs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300 transition-colors"
                aria-label="Twitter Profile"
              >
                <Twitter size={28} className="sm:w-8 sm:h-8" />
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
