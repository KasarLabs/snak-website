import Terminal from './components/Terminal';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left side - Title and Description */}
        <div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Starknet Agent Kit
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            A powerful toolkit for building and managing Starknet agents with ease
          </p>
          <div className="flex space-x-4">
            <a
              href="https://github.com/yourusername/starknet-agent-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/starknet-agent-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              NPM
            </a>
          </div>
        </div>

        {/* Right side - Terminal */}
        <Terminal />
      </div>
    </div>
  );
}