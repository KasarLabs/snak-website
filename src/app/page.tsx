import Terminal from "./components/Terminal";
import { Github, Package, Twitter } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 py-24 md:py-4">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        {/* Left side - Title and Description */}
        <div className="text-center md:text-left">
          <div className="flex items-center gap-4 mb-6 justify-center md:justify-start">
            <Image
              src="/starknet.png"
              alt="Starknet Logo"
              width={48}
              height={48}
              className="object-contain sm:w-[62px] sm:h-[62px]"
            />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Starknet Agent Kit
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-xl mx-auto md:mx-0">
            A powerful and simple toolkit for creating AI agents that can
            interact with the Starknet blockchain.
          </p>
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

        {/* Right side - Terminal */}
        <Terminal />
      </div>
    </div>
  );
}
