import { allPlugins } from "../../../../../data/plugins";
import Image from "next/image";
import { StepProps } from "../../types/agent";
import { useState } from "react";
import { motion } from "framer-motion";
import { Info, Plus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CircularSlider from "../CircularSlider";

const PluginsStep: React.FC<StepProps> = ({ formData, setFormData }) => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePlugin = (pluginName: string) => {
    setFormData({
      ...formData,
      plugins: formData.plugins.includes(pluginName)
        ? formData.plugins.filter((name) => name !== pluginName)
        : [...formData.plugins, pluginName],
    });
  };

  const selectedPlugins = allPlugins.filter((plugin) =>
    formData.plugins.includes(plugin.name),
  );

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-medium text-gray-200">Plugins</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-gray-400 cursor-help translate-y-[1px]" />
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Select the plugins your agent will have access to. Each plugin
                provides different capabilities and integrations.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="space-y-4">
        {" "}
        {/* Added container with vertical spacing */}
        {/* Top row with Add button and Slider */}
        <div className="flex gap-4 items-center">
          {/* Add Plugin Button */}
          <motion.div
            className="w-16 h-16 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
          >
            <Plus className="w-6 h-6" />
          </motion.div>

          <div className="flex items-center gap-2">
            <CircularSlider
              value={formData.interval}
              onChange={(value) =>
                setFormData({ ...formData, interval: value })
              }
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <span className="text-gray-300 text-sm">Interval</span>
                    <Info className="h-4 w-4 text-gray-400" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    How often the agent should check for updates and perform its
                    tasks (in seconds)
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        {/* Bottom row with selected plugins */}
        <div className="flex flex-wrap gap-6">
          {selectedPlugins.map((plugin) => (
            <motion.div
              key={plugin.name}
              className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer bg-neutral-800 border border-neutral-700 overflow-hidden"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => togglePlugin(plugin.name)}
            >
              <div className="relative w-full h-full">
                <Image
                  src={plugin.image}
                  alt={plugin.name}
                  fill
                  className="object-cover"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Plugin Selection Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-neutral-900 border border-neutral-800 text-gray-200 max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Select Plugins
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto mt-4 pr-4 -mr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
              {allPlugins.map((plugin) => (
                <div key={plugin.name} className="p-1">
                  {" "}
                  {/* Padding container */}
                  <motion.div
                    className={`h-24 p-4 rounded-lg border cursor-pointer ${
                      formData.plugins.includes(plugin.name)
                        ? "bg-neutral-700 border-neutral-600"
                        : "bg-neutral-800 border-neutral-700"
                    }`}
                    onClick={() => togglePlugin(plugin.name)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3 h-full">
                      <div className="relative w-12 h-12 rounded-full bg-neutral-700 overflow-hidden flex-shrink-0">
                        <Image
                          src={plugin.image}
                          alt={plugin.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="font-medium text-gray-200 truncate">
                          {plugin.name}
                        </h4>
                        {plugin.description && (
                          <p className="text-sm text-gray-400 truncate">
                            {plugin.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default PluginsStep;
