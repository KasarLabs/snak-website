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
import SuccessView from "./steps/SuccessView";

function getJsonHash(
  obj: Record<string, unknown>,
  excludeFields: string[] = [],
): string {
  const clone = JSON.parse(JSON.stringify(obj));

  const removeFields = (object: Record<string, unknown>) => {
    for (const key in object) {
      if (excludeFields.includes(key)) {
        delete object[key];
      } else if (typeof object[key] === "object" && object[key] !== null) {
        removeFields(object[key] as Record<string, unknown>);
      }
    }
    return object;
  };
  const result = btoa(JSON.stringify(removeFields(clone)))
    .split("=")[0]
    .replace(/[/+]/g, "_");
  return result;
}

const AgentForm = () => {
  const initialFormData: AgentData = {
    name: "",
    bio: "",
    interval: 5000,
    lore: [],
    objectives: [],
    knowledge: [],
    plugins: [],
  };

  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [configId, setConfigId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AgentData>(initialFormData);
  const [isExisting, setIsExisting] = useState(false);

  const handleNext = () => {
    if (currentStep === 0) {
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

  const resetForm = () => {
    setFormData(initialFormData);
    setConfigId(null);
    setCurrentStep(0);
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
      const plugin = allPlugins.find((p) => p.id === pluginId);
      if (plugin) {
        if (plugin.internal ?? true) {
          internal_plugins.push(pluginId);
        } else {
          external_plugins.push(pluginId);
        }
      }
    });

    try {
      const agentConfig = {
        name: formData.name,
        bio: formData.bio,
        lore: formData.lore.filter((item) => item.trim() !== ""),
        objectives: formData.objectives.filter((item) => item.trim() !== ""),
        knowledge: formData.knowledge.filter((item) => item.trim() !== ""),
        interval: formData.interval,
        chat_id: uuidv4(),
        external_plugins,
        internal_plugins,
      };
      const config_hash = getJsonHash(agentConfig, ["chat_id"]);
      const { data: existingAgent } = await supabase
        .from("agents")
        .select("id")
        .eq("id", config_hash)
        .maybeSingle();

      if (existingAgent) {
        setIsExisting(true);
        setConfigId(config_hash);
        setCurrentStep(steps.length);
      } else {
        setIsExisting(false);
        const { error } = await supabase.from("agents").insert({
          id: config_hash,
          config: agentConfig,
        });
        if (error) throw error;
        setConfigId(config_hash);
        setCurrentStep(steps.length);
      }

      console.log("Agent configuration saved:", agentConfig);
    } catch (error) {
      console.error("Error creating agent:", error);
      toast({
        title: "Error",
        description: "Failed to create agent. Please try again.",
        duration: 3000,
      });
    }
  };
  if (currentStep === steps.length && configId) {
    return (
      <div className="w-full max-w-2xl bg-neutral-900 rounded-lg shadow-lg border border-neutral-800 flex flex-col h-[400px]">
        <SuccessView
          configId={configId}
          onReset={resetForm}
          isExisting={isExisting}
        />
      </div>
    );
  }

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
