import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const CollapsibleSection = ({
  title,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-5 bg-neutral-900 rounded-lg border border-neutral-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4"
      >
        <span className="text-base font-bold text-white">{title}</span>
        <span className="text-white text-lg">
          {isOpen ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
        </span>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-neutral-800 max-h-[200px] overflow-y-auto font-mono">
          {children}
        </div>
      )}
    </div>
  );
};
