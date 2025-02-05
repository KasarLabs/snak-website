"use client";

import { useState, useEffect, useRef } from 'react';

const Terminal = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [text, setText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  const [spinnerFrame, setSpinnerFrame] = useState(0);

  const steps = [
    { text: 'pnpm run local', delay: 1000, loading: true },
    { 
      text: '╭──────────────────────────────────────────────╮\n│ Starknet-Agent-Kit v0.0.1                    │\n╰──────────────────────────────────────────────╯',
      delay: 800,
      loading: false,
      class: 'text-gray-300'
    },
    { 
      text: '? Select operation mode:',
      delay: 1000,
      loading: false,
      class: 'text-blue-400'
    },
    { 
      text: '  > Interactive Mode\n❯ > Autonomous Mode',
      delay: 500,
      loading: false,
      class: 'text-white'
    },
    { 
      text: '✔ Agent initialized successfully',
      delay: 1200,
      loading: false,
      class: 'text-green-400'
    },
    { 
      text: '✔ Character config loaded successfully',
      delay: 800,
      loading: false,
      class: 'text-green-400'
    },
    { 
      text: '🤖 Starting autonomous session...',
      delay: 1000,
      loading: true,
      class: 'text-blue-400'
    },
    {
      text: '📊 Analyzing market conditions...',
      delay: 1200,
      loading: true,
      class: 'text-blue-400'
    },
    {
      text: `Market Analysis:
- ETH/USDC Price: $3,245.67
- 24h Volume: $2.1B
- Market Direction: Bullish
- Volatility Index: Medium
- Optimal Entry Point: Current`,
      delay: 1500,
      loading: false,
      class: 'text-green-400'
    },
    { 
      text: `Route information: {
  "name": "Ekubo",
  "address": "0x5dd3d2f4429af886cd1a3b08289dbcea99a294197e9eb43b0e0325b4b",
  "routeInfo": {
    "token0": "0x3fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac",
    "token1": "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    "fee": "0x20c49ba5e353f80000000000000000",
    "tickSpacing": "0x3e8",
    "extension": "0x0"
  }
}`,
      delay: 1500,
      loading: false,
      class: 'text-blue-300'
    },
    { 
      text: '✔ Allowance verification successful',
      delay: 800,
      loading: false,
      class: 'text-green-400'
    },
    { 
      text: '🔄 Executing swap transaction...',
      delay: 1000,
      loading: true,
      class: 'text-blue-400'
    },
    { 
      text: '✔ Transaction executed: 0x7da3ae0b687f45a56079b58d3e8abc841d0326e14783f65b346a19f9d965741d',
      delay: 800,
      loading: false,
      class: 'text-green-400'
    },
    { 
      text: '✔ Swap completed successfully { execution_status: "SUCCEEDED", finality_status: "ACCEPTED_ON_L2" }',
      delay: 1200,
      loading: false,
      class: 'text-green-400'
    },
    {
      text: '📢 Preparing social media update...',
      delay: 800,
      loading: true,
      class: 'text-blue-400'
    },
    {
      text: `🐦 Posted to Twitter:
"$ekb sitting at $30m mcap. protocol putting in work - privacy pools + onchain dca + native account abstraction. real defi still exists in 2025"`,
      delay: 1500,
      loading: false,
      class: 'text-green-400'
    },
    {
      text: '✨ Looking for next opportunity...',
      delay: 1000,
      loading: false,
      class: 'text-green-400'
    }
  ];

  // Spinner animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSpinnerFrame(prev => (prev + 1) % spinnerFrames.length);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll effect
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [text]);

  // Terminal text animation
  useEffect(() => {
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      setIsLoading(step.loading);
      
      const timeout = setTimeout(() => {
        setText(prev => {
          const newText = `${prev}${prev ? '\n' : ''}${step.text}`;
          return newText;
        });
        setCurrentStep(prev => prev + 1);
      }, step.delay);

      return () => clearTimeout(timeout);
    } else {
      setIsLoading(false);
    }
  }, [currentStep]);

  return (
    <div className="relative w-full">
      <div className="bg-black rounded-lg shadow-xl border border-gray-800">
        {/* Terminal window controls */}
        <div className="flex items-center p-2 bg-gray-900 rounded-t-lg border-b border-gray-800">
          <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
          <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
          <div className="w-3 h-3 rounded-full bg-gray-500"></div>
        </div>
        {/* Terminal content */}
        <div 
          ref={terminalRef}
          className="font-mono text-sm p-4 h-[340px] overflow-y-auto"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#4A5568 #1A202C'
          }}
        >
          <div className="text-gray-300 whitespace-pre-wrap">
            {steps.slice(0, currentStep).map((step, index) => (
              <div key={index} className={`mb-2 ${step.class || 'text-gray-300'}`}>
                {step.loading && (
                  <span className="text-blue-400 mr-2">{spinnerFrames[spinnerFrame]}</span>
                )}
                {step.text}
              </div>
            ))}
            {isLoading && (
              <span className="text-blue-400">{spinnerFrames[spinnerFrame]}</span>
            )}
            {!isLoading && showCursor && (
              <span className="text-gray-300 ml-1 animate-blink">▊</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terminal;