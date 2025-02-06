import { useState, useEffect } from "react";
import Image from "next/image";
import { Plugin } from "../utils/types";
import { CollapsibleSection } from "./CollapsibleSection";

interface PluginModalProps {
  plugin: Plugin | null;
  isVisible: boolean;
  expandedActions: Set<number>;
  onClose: () => void;
}

export const PluginModal = ({
  plugin,
  isVisible,
  onClose,
}: PluginModalProps) => {
  const [expandedActions, setExpandedActions] = useState<Set<number>>(
    new Set(),
  );
  useEffect(() => {
    if (!isVisible) {
      setExpandedActions(new Set());
    }
  }, [isVisible]);
  if (!isVisible || !plugin) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-start justify-center pt-[10vh] bg-black/50">
      <div className="bg-black w-[600px] max-h-[80vh] rounded-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-black p-8 z-10">
          <div className="flex items-start justify-between">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <Image
                  src={plugin.image}
                  alt={plugin.name}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{plugin.name}</h2>
                <p className="text-gray-400 text-sm mt-2">
                  {plugin.description}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white text-xl ml-4">
              ✕
            </button>
          </div>
        </div>

        {/* Actions List */}
        <div className="p-5 pt-0">
          {plugin.actions.map((action, index) => (
            <CollapsibleSection
              key={index}
              title={action.name}
              defaultOpen={expandedActions.has(index)}
            >
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">{action.description}</p>

                {action.parameters && action.parameters.length > 0 && (
                  <div className="space-y-3">
                    {action.parameters.map((param, paramIndex) => (
                      <div
                        key={paramIndex}
                        className="bg-neutral-900 rounded-lg p-3 border border-neutral-800"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white font-medium">
                            {param.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-white/20 rounded-full px-2 py-1 text-white">
                              {param.type}
                            </span>
                            {param.required && (
                              <span className="text-xs text-red-400">
                                required
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm">
                          {param.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CollapsibleSection>
          ))}
        </div>
      </div>
    </div>
  );
};
