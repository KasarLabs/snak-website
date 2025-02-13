import { Info } from "lucide-react";
import { StepProps } from "../../types/agent";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const BasicInfoStep: React.FC<StepProps> = ({ formData, setFormData }) => {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="block text-sm font-medium text-gray-300">
            Name*
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help translate-y-[2px]" />
              </TooltipTrigger>
              <TooltipContent>
                <p>The name of your agent. This will be used to identify it.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none transition-colors"
          placeholder="Enter agent name"
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="block text-sm font-medium text-gray-300">
            Bio*
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help translate-y-[2px]" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  A description of your agent&apos;s purpose and capabilities.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          className="w-full p-2 bg-neutral-800 border border-neutral-700 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none transition-colors h-32"
          placeholder="Enter agent bio"
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="block text-sm font-medium text-gray-300">
            Interval (ms)*
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-400 cursor-help translate-y-[1px]" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  How often should the agent check for updates and perform its
                  tasks? (in milliseconds)
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            required
            value={formData.interval}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value) && value > 0) {
                setFormData({ ...formData, interval: value });
              }
            }}
            className="w-32 p-2 bg-neutral-800 border border-neutral-700 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none transition-colors"
          />
          <span className="text-gray-400 text-sm">ms</span>
        </div>
      </div>
    </motion.div>
  );
};

export default BasicInfoStep;
