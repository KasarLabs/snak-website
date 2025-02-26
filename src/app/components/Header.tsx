"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSearch } from "../plugins/context/SearchContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { searchQuery, setSearchQuery } = useSearch();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const isPluginPage = pathname === "/plugins";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full fixed top-0 z-50 ">
      <nav className="h-20 px-4 bg-black/100 md:bg-black/80 backdrop-blur-sm md:px-6">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/snaklogo-nobg.png"
                alt="Logo"
                width={80}
                height={80}
                className="hidden sm:block object-contain -mt-1	" // Negative margin top to move up
              />
              <Image
                src="/snaklogo-nobg.png"
                alt="Logo"
                width={60}
                height={60}
                className="block sm:hidden object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className=" md:flex items-center gap-8">
            {isPluginPage && (
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search for a plugin"
                  value={searchQuery}
                  onChange={handleSearch}
                  className="bg-transparent border-b border-gray-600/10 focus:border-white/10 text-gray-300 placeholder-gray-500 py-1 px-2 w-48 focus:w-64 transition-all duration-300 focus:outline-none"
                />
                <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              </div>
            )}
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="/plugins"
                className="text-gray-300 hover:text-white font-calibre-medium text-2xl hover:scale-105 transition-all"
              >
                Plugins
              </Link>
              <Link
                href="https://docs.starkagent.ai"
                className="text-gray-300 hover:text-white font-calibre-medium text-2xl hover:scale-105 transition-all"
              >
                Docs
              </Link>
              <a
                href="https://github.com/kasarlabs/starknet-agent-kit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white font-calibre-medium text-2xl hover:scale-105 transition-all"
              >
                GitHub
              </a>
              <Link
                href="/create-agent"
                className="bg-white text-black px-4 py-2 rounded-lg font-calibre-medium text-xl hover:bg-gray-200 transition-all"
              >
                Create Agent
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-black/100 backdrop-blur-sm border-b border-neutral-800 py-4 px-6 space-y-4">
            <Link
              href="/plugins"
              className="block text-gray-300 hover:text-white font-calibre-medium text-lg hover:bg-black py-2 px-4 rounded-lg transition-all"
            >
              Plugins
            </Link>
            <Link
              href="https://docs.starkagent.ai"
              className="block text-gray-300 hover:text-white font-calibre-medium text-lg hover:bg-black py-2 px-4 rounded-lg transition-all"
            >
              Docs
            </Link>
            <a
              href="https://github.com/kasarlabs/starknet-agent-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-gray-300 hover:text-white font-calibre-medium text-lg hover:bg-black py-2 px-4 rounded-lg transition-all"
            >
              GitHub
            </a>
            <Link
              href="/create-agent"
              className="block bg-white text-black px-4 py-2 rounded-lg font-calibre-medium text-lg hover:bg-gray-200 transition-all max-w-[200px]"
            >
              Create Agent
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
