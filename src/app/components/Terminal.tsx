'use client';

import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const installCommand = `npm install starknet-agent-kit`;

export default function Terminal() {
  const [typed, setTyped] = useState('');
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= installCommand.length) {
        setTyped(installCommand.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(installCommand);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className="bg-gray-800 rounded-lg p-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="relative">
          <SyntaxHighlighter
            language="bash"
            style={vscDarkPlus}
            customStyle={{
              background: 'transparent',
              padding: 0,
              margin: 0,
            }}
          >
            {typed}
          </SyntaxHighlighter>
          <button
            onClick={copyToClipboard}
            className="absolute top-0 right-0 text-gray-400 hover:text-white transition-colors"
          >
            {showCopied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}