import Terminal from "./components/Terminal";
import { Github, Package, Twitter } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left side - Title and Description */}
        <div>
          <div className="flex items-center gap-4 mb-6">
            <Image
              src="/starknet.png"
              alt="Starknet Logo"
              width={62}
              height={62}
              className="object-contain"
            />
            <h1 className="text-5xl font-bold text-white">
              Starknet Agent Kit
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-8">
            A powerful and simple toolkit for creating AI agents that can interact with the Starknet blockchain.
          </p>
          <div className="flex space-x-6">
            <a
              href="https://github.com/kasarlabs/starknet-agent-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors"
              aria-label="GitHub Repository"
            >
              <Github size={32} />
            </a>
            <a
              href="https://www.npmjs.com/package/starknet-agent-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors"
              aria-label="NPM Package"
            >
              <Package size={32} />
            </a>
            <a
              href="https://twitter.com/kasarlabs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300 transition-colors"
              aria-label="Twitter Profile"
            >
              <Twitter size={32} />
            </a>
          </div>
        </div>

        {/* Right side - Terminal */}
        <Terminal />
      </div>
    </div>
  );
}