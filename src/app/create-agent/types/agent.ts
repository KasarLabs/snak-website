export interface AgentData {
  name: string;
  bio: string;
  interval: number;
  lore: string[];
  objectives: string[];
  knowledge: string[];
  plugins: string[];
}

export interface StepProps {
  formData: AgentData;
  setFormData: React.Dispatch<React.SetStateAction<AgentData>>;
}

export interface MultiInputStepProps extends StepProps {
  title: string;
  values: string[];
  onChange: (newValues: string[]) => void;
  placeholder: string;
}
