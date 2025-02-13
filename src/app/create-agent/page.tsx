"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { allPlugins } from "../../../data/plugins";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface AgentData {
  name: string;
  bio: string;
  lore: string[];
  objectives: string[];
  knowledge: string[];
  plugins: string[];
}

interface StepProps {
  formData: AgentData;
  setFormData: React.Dispatch<React.SetStateAction<AgentData>>;
}

interface MultiInputStepProps extends StepProps {
  title: string;
  values: string[];
  onChange: (newValues: string[]) => void;
  placeholder: string;
}

export default function AgentForm() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AgentData>({
    name: "",
    bio: "",
    lore: [],
    objectives: [],
    knowledge: [],
    plugins: [],
  });

  const handleNext = () => {
    if (currentStep === 0) {
      // Validate name and bio before allowing to proceed
      if (!formData.name.trim() || !formData.bio.trim()) {
        toast({
          variant: "destructive",
          title: "Required information",
          description:
            "Please fill in both the name and bio fields before continuing.",
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

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.bio.trim()) {
      // Show error message
      alert("Name and Bio are required fields");
      // Optionally return to the first step
      setCurrentStep(0);
      return;
    }

    // Format the data
    try {
      const agentConfig = {
        name: formData.name,
        bio: formData.bio,
        lore: formData.lore.filter((item) => item.trim() !== ""), // Remove empty entries
        objectives: formData.objectives.filter((item) => item.trim() !== ""),
        knowledge: formData.knowledge.filter((item) => item.trim() !== ""),
        plugins: formData.plugins,
        createdAt: new Date().toISOString(),
      };

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
}

const BasicInfoStep: React.FC<StepProps> = ({ formData, setFormData }) => {
  const [errors, setErrors] = useState<{ name?: string; bio?: string }>({});

  // Validate on blur
  const validateField = (field: "name" | "bio", value: string) => {
    if (!value.trim()) {
      setErrors((prev) => ({
        ...prev,
        [field]: `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
      }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Name*
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          onBlur={(e) => validateField("name", e.target.value)}
          className={`w-full p-2 bg-neutral-800 border rounded-md text-gray-100 placeholder-gray-500 focus:outline-none transition-colors ${
            errors.name ? "border-red-500" : "border-neutral-700"
          }`}
          placeholder="Enter agent name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Bio*
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          onBlur={(e) => validateField("bio", e.target.value)}
          className={`w-full p-2 bg-neutral-800 border rounded-md text-gray-100 placeholder-gray-500 focus:outline-none transition-colors h-32 ${
            errors.bio ? "border-red-500" : "border-neutral-700"
          }`}
          placeholder="Enter agent bio"
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-500">{errors.bio}</p>
        )}
      </div>
    </motion.div>
  );
};

const MultiInputStep: React.FC<MultiInputStepProps> = ({
  title,
  values,
  onChange,
  placeholder,
}) => {
  const addInput = () => {
    onChange([...values, ""]);
  };

  const updateValue = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    onChange(newValues);
  };

  const removeInput = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h3 className="text-lg font-medium text-gray-200">{title}</h3>
      {values.map((value, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex gap-2 items-start"
        >
          <textarea
            value={value}
            onChange={(e) => updateValue(index, e.target.value)}
            className="flex-1 p-2 bg-neutral-800 border border-neutral-700 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none transition-colors h-32"
            style={{ minHeight: "100px" }}
            placeholder={placeholder}
          />
          <button
            onClick={() => removeInput(index)}
            className="p-2 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-gray-300 transition-colors mt-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </motion.div>
      ))}
      <motion.button
        onClick={addInput}
        className="flex items-center gap-2 text-neutral-400 hover:text-neutral-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-4 h-4" />
        Add {title.toLowerCase()}
      </motion.button>
    </motion.div>
  );
};
const LoreStep: React.FC<StepProps> = ({ formData, setFormData }) => (
  <MultiInputStep
    title="Lore"
    values={formData.lore}
    onChange={(newLore) => setFormData({ ...formData, lore: newLore })}
    placeholder="Enter lore details"
    formData={formData}
    setFormData={setFormData}
  />
);

const ObjectivesStep: React.FC<StepProps> = ({ formData, setFormData }) => (
  <MultiInputStep
    title="Objectives"
    values={formData.objectives}
    onChange={(newObjectives) =>
      setFormData({ ...formData, objectives: newObjectives })
    }
    placeholder="Enter objective"
    formData={formData}
    setFormData={setFormData}
  />
);

const KnowledgeStep: React.FC<StepProps> = ({ formData, setFormData }) => (
  <MultiInputStep
    title="Knowledge"
    values={formData.knowledge}
    onChange={(newKnowledge) =>
      setFormData({ ...formData, knowledge: newKnowledge })
    }
    placeholder="Enter knowledge"
    formData={formData}
    setFormData={setFormData}
  />
);

const PluginsStep: React.FC<StepProps> = ({ formData, setFormData }) => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePlugin = (pluginId: string) => {
    setFormData({
      ...formData,
      plugins: formData.plugins.includes(pluginId)
        ? formData.plugins.filter((id) => id !== pluginId)
        : [...formData.plugins, pluginId],
    });
  };

  const selectedPlugins = allPlugins.filter((plugin) =>
    formData.plugins.includes(plugin.id),
  );

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <h3 className="text-lg font-medium text-gray-200 mb-4">Plugins</h3>

      {/* Selected Plugins Display */}
      <div className="flex flex-wrap gap-4">
        {selectedPlugins.map((plugin) => (
          <motion.div
            key={plugin.id}
            className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer bg-neutral-800 border border-neutral-700 overflow-hidden"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => togglePlugin(plugin.id)}
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

        {/* Add Plugin Button remains the same */}
        <motion.div
          className="w-16 h-16 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center cursor-pointer text-gray-400 hover:text-gray-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
        >
          <Plus className="w-6 h-6" />
        </motion.div>
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
                <div key={plugin.id} className="p-1">
                  {" "}
                  {/* Padding container */}
                  <motion.div
                    className={`h-24 p-4 rounded-lg border cursor-pointer ${
                      formData.plugins.includes(plugin.id)
                        ? "bg-neutral-700 border-neutral-600"
                        : "bg-neutral-800 border-neutral-700"
                    }`}
                    onClick={() => togglePlugin(plugin.id)}
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
