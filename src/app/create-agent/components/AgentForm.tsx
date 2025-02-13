import {
  BasicInfoStep,
  LoreStep,
  ObjectivesStep,
  KnowledgeStep,
  PluginsStep,
} from "./steps";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AgentData } from "../types/agent";
import { v4 as uuidv4 } from "uuid";
import { allPlugins } from "../../../../data/plugins";
import { supabase } from "@/lib/supabase";

const AgentForm = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AgentData>({
    name: "",
    bio: "",
    interval: 5,
    lore: [],
    objectives: [],
    knowledge: [],
    plugins: [],
  });

  const handleNext = () => {
    if (currentStep === 0) {
      // Validate name and bio before allowing to proceed
      if (!formData.name.trim() || !formData.bio.trim() || !formData.interval) {
        toast({
          variant: "destructive",
          title: "Required information",
          description: "Please fill in all required fields before continuing.",
          duration: 3000,
        });
        return;
      }
    }

    setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));
  };

  const steps = useMemo(
    () => [
      {
        title: "Basic Info",
        component: (
          <BasicInfoStep formData={formData} setFormData={setFormData} />
        ),
      },
      {
        title: "Lore",
        component: <LoreStep formData={formData} setFormData={setFormData} />,
      },
      {
        title: "Objectives",
        component: (
          <ObjectivesStep formData={formData} setFormData={setFormData} />
        ),
      },
      {
        title: "Knowledge",
        component: (
          <KnowledgeStep formData={formData} setFormData={setFormData} />
        ),
      },
      {
        title: "Plugins",
        component: (
          <PluginsStep formData={formData} setFormData={setFormData} />
        ),
      },
    ],
    [formData, setFormData],
  );

  const handleSubmit = async () => {
    const selectedPluginIds = formData.plugins;
    const internal_plugins: string[] = [];
    const external_plugins: string[] = [];

    selectedPluginIds.forEach((pluginId) => {
      // Find the plugin in your allPlugins array
      const plugin = allPlugins.find((p) => p.id === pluginId);
      if (plugin) {
        // If internal is undefined or true, it's an internal plugin
        if (plugin.internal ?? true) {
          internal_plugins.push(pluginId);
        } else {
          external_plugins.push(pluginId);
        }
      }
    });

    // Format the data
    try {
      const agent_id = uuidv4();
      const agentConfig = {
        name: formData.name,
        bio: formData.bio,
        lore: formData.lore.filter((item) => item.trim() !== ""), // Remove empty entries
        objectives: formData.objectives.filter((item) => item.trim() !== ""),
        knowledge: formData.knowledge.filter((item) => item.trim() !== ""),
        interval: formData.interval,
        chat_id: uuidv4(),
        external_plugins,
        internal_plugins,
      };

      // Save to Supabase with our generated ID
      const { error } = await supabase.from("agents").insert({
        id: agent_id,
        config: agentConfig,
      });

      if (error) throw error;

      // Show success message with the agent ID we generated
      toast({
        title: "Success!",
        description: `Agent created successfully! Your agent ID is: ${agent_id}`,
        duration: 5000,
      });

      // Create a Blob containing the JSON data
      const jsonString = JSON.stringify(agentConfig, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });

      // Create a download link and trigger it
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${formData.name.toLowerCase().replace(/\s+/g, "-")}-config.json`;

      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("Agent configuration saved:", agentConfig);
    } catch (error) {
      console.error("Error creating agent:", error);
      alert("Error creating agent. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-2xl bg-neutral-900 rounded-lg shadow-lg border border-neutral-800 flex flex-col h-[400px]">
      {/* Fixed Header - Progress Dots */}
      <div className="p-6 pb-2">
        <motion.div
          className="flex justify-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {steps.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === currentStep ? "bg-neutral-400" : "bg-neutral-700"
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </motion.div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {steps[currentStep].component}
        </motion.div>
      </div>

      {/* Fixed Footer - Navigation */}
      <div className="p-6 pt-2">
        <motion.div
          className="flex justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            className={`flex items-center text-gray-300 px-6 py-2 ${
              currentStep === 0 ? "invisible" : ""
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </motion.button>
          {currentStep === steps.length - 1 ? (
            <motion.button
              onClick={handleSubmit}
              className="bg-neutral-700 text-white px-6 py-2 rounded-md hover:bg-neutral-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Agent
            </motion.button>
          ) : (
            <motion.button
              onClick={handleNext}
              className="flex items-center text-gray-300 px-6 py-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AgentForm;
