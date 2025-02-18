import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, UserCircle, Scroll, Target, Book, Puzzle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const StepIcon = ({ icon: Icon, isActive, isComplete, tooltip }) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger>
          <motion.div
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
              isActive 
                ? 'bg-white text-black' 
                : isComplete
                  ? 'bg-neutral-700 text-white'
                  : 'bg-neutral-800 text-neutral-500'
            }`}
            initial={false}
            animate={{ 
              scale: isActive ? 1.1 : 1
            }}
          >
            <Icon className="w-4 h-4" />
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const StepperHeader = ({ currentStep, steps }) => {
  const icons = [
    { icon: UserCircle, tooltip: "Basic Info" },
    { icon: Scroll, tooltip: "Lore" },
    { icon: Target, tooltip: "Objectives" },
    { icon: Book, tooltip: "Knowledge" },
    { icon: Puzzle, tooltip: "Plugins" }
  ];

  return (
    <div className="w-full bg-neutral-900 border-b border-neutral-800 p-4">
      <div className="relative flex justify-between items-center">
        {/* Progress track wrapper with controlled width */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2">
          {/* Background track */}
          <div className="absolute inset-0 h-[1px] bg-neutral-800" />
          
          {/* Progress bar - stops at the current step */}
          <div 
            className="absolute h-[1px] bg-white transition-all duration-300"
            style={{
              width: `${currentStep === 0 ? 0 : (currentStep / (icons.length - 1) * 100)}%`,
              maxWidth: '100%'
            }}
          />
        </div>

        {/* Icons container */}
        <div className="relative flex justify-between w-full z-10">
          {icons.map((iconData, index) => (
            <StepIcon 
              key={index}
              icon={iconData.icon}
              isActive={index === currentStep}
              isComplete={index < currentStep}
              tooltip={iconData.tooltip}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const StyledAgentForm = ({ children, currentStep, steps, onNext, onBack, onSubmit }) => {
  return (
    <div className="flex items-center justify-center w-full px-4">
      <div className="w-full max-w-2xl bg-neutral-900 rounded-lg shadow-lg border border-neutral-800 flex flex-col h-[450px]">
        <StepperHeader currentStep={currentStep} steps={steps} />
        
        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </div>

        {/* Navigation Footer */}
        <div className="px-6 py-4 border-t border-neutral-800">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className={`flex items-center gap-1 text-neutral-400 px-3 py-1.5 rounded hover:text-white transition-colors
                ${currentStep === 0 ? 'invisible' : ''}`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            
            {currentStep === steps.length - 1 ? (
              <button
                onClick={onSubmit}
                className="bg-white text-black px-4 py-1.5 rounded hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Create Agent
              </button>
            ) : (
              <button
                onClick={onNext}
                className="flex items-center gap-1 text-white px-3 py-1.5 rounded hover:bg-neutral-800 transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyledAgentForm;