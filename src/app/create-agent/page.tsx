"use client";

import React, { useState } from 'react';
import { Plus, X, Search } from 'lucide-react';
import { allPlugins } from '../../../data/plugins';
import { Dialog } from '@/components/ui/dialog';

interface AgentConfig {
  name: string;
  bio: string;
  lore: string[];
  objectives: string[];
  knowledge: string[];
  interval: string;
  chat_id: string;
  allowed_tools: string[];
}

export default function CreateAgent() {
  const [isPluginModalOpen, setIsPluginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    name: '',
    bio: '',
    lore: [''],
    objectives: [''],
    knowledge: [''],
    interval: '',
    chat_id: '',
    allowed_tools: []
  });

  const handleArrayInput = (field: keyof AgentConfig, index: number, value: string) => {
    setAgentConfig(prev => {
      const newArray = [...(prev[field] as string[])];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field: keyof AgentConfig) => {
    setAgentConfig(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };

  const removeArrayItem = (field: keyof AgentConfig, index: number) => {
    setAgentConfig(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Agent Configuration:', agentConfig);
  };

  const filteredPlugins = allPlugins.filter(plugin =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-light">Create Agent</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="space-y-6">
            <input
              type="text"
              value={agentConfig.name}
              onChange={e => setAgentConfig(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-transparent border-b border-neutral-800 px-0 py-2 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
              placeholder="Agent Name"
            />

            <textarea
              value={agentConfig.bio}
              onChange={e => setAgentConfig(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full bg-transparent border-b border-neutral-800 px-0 py-2 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600 min-h-[100px] resize-none"
              placeholder="Bio"
            />
          </div>

          {/* Dynamic Fields */}
          {(['lore', 'objectives', 'knowledge'] as const).map(field => (
            <div key={field} className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-light capitalize">{field}</h2>
                <button
                  type="button"
                  onClick={() => addArrayItem(field)}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="space-y-4">
                {agentConfig[field].map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={e => handleArrayInput(field, index, e.target.value)}
                      className="flex-1 bg-transparent border-b border-neutral-800 px-0 py-2 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
                      placeholder={`Add ${field}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(field, index)}
                      className="text-neutral-400 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Technical Config */}
          <div className="space-y-6">
            <input
              type="number"
              value={agentConfig.interval}
              onChange={e => setAgentConfig(prev => ({ ...prev, interval: e.target.value }))}
              className="w-full bg-transparent border-b border-neutral-800 px-0 py-2 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
              placeholder="Interval (ms)"
            />

            <input
              type="text"
              value={agentConfig.chat_id}
              onChange={e => setAgentConfig(prev => ({ ...prev, chat_id: e.target.value }))}
              className="w-full bg-transparent border-b border-neutral-800 px-0 py-2 focus:outline-none focus:border-white transition-colors placeholder:text-neutral-600"
              placeholder="Chat ID"
            />

            <button
              type="button"
              onClick={() => setIsPluginModalOpen(true)}
              className="w-full text-left py-2 border-b border-neutral-800 text-neutral-400 hover:text-white hover:border-white transition-colors"
            >
              Select Tools ({agentConfig.allowed_tools.length})
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black py-3 rounded-full hover:bg-neutral-200 transition-colors mt-8"
          >
            Create Agent
          </button>
        </form>

        {/* Plugin Selection Modal */}
        {isPluginModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-neutral-900 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-light">Select Tools</h2>
                  <button
                    onClick={() => setIsPluginModalOpen(false)}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search plugins..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-800 rounded-full pl-10 pr-4 py-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto grid grid-cols-2 gap-4">
                {filteredPlugins.map(plugin => (
                  <button
                    key={plugin.id}
                    onClick={() => {
                      const newTools = agentConfig.allowed_tools.includes(plugin.id)
                        ? agentConfig.allowed_tools.filter(id => id !== plugin.id)
                        : [...agentConfig.allowed_tools, plugin.id];
                      setAgentConfig(prev => ({ ...prev, allowed_tools: newTools }));
                    }}
                    className={`p-4 rounded-xl border ${
                      agentConfig.allowed_tools.includes(plugin.id)
                        ? 'border-white bg-white/10'
                        : 'border-neutral-800 hover:border-neutral-700'
                    } transition-all text-left`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <img src={plugin.image} alt={plugin.name} className="w-8 h-8 rounded-full" />
                      <h3 className="font-medium">{plugin.name}</h3>
                    </div>
                    <p className="text-sm text-neutral-400">{plugin.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}