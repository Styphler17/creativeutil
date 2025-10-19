import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ToolOutput {
  id: string;
  type: 'palette' | 'gradient' | 'icon' | 'animation' | 'other' | 'button' | 'font' | 'code' | 'image';
  data: Record<string, unknown>;
  timestamp: number;
  toolId?: string;
  toolName?: string;
}

interface ToolOutputsContextType {
  outputs: ToolOutput[];
  addOutput: (output: Omit<ToolOutput, 'id' | 'timestamp'>) => void;
  removeOutput: (id: string) => void;
  getOutputsByType: (type: ToolOutput['type']) => ToolOutput[];
  getOutputsByTool: (toolId: string) => ToolOutput[];
  clearOutputs: () => void;
  shareOutput: (outputId: string) => string;
  getRecentOutputs: (limit?: number) => ToolOutput[];
}

const ToolOutputsContext = createContext<ToolOutputsContextType | undefined>(undefined);

export const useToolOutputs = () => {
  const context = useContext(ToolOutputsContext);
  if (!context) {
    throw new Error('useToolOutputs must be used within a ToolOutputsProvider');
  }
  return context;
};

interface ToolOutputsProviderProps {
  children: ReactNode;
}

export const ToolOutputsProvider: React.FC<ToolOutputsProviderProps> = ({ children }) => {
  const [outputs, setOutputs] = useState<ToolOutput[]>([]);

  const addOutput = (output: Omit<ToolOutput, 'id' | 'timestamp'>) => {
    const newOutput: ToolOutput = {
      ...output,
      id: `${output.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    setOutputs(prev => [newOutput, ...prev].slice(0, 50)); // Keep last 50 outputs
  };

  const removeOutput = (id: string) => {
    setOutputs(prev => prev.filter(output => output.id !== id));
  };

  const getOutputsByType = (type: ToolOutput['type']) => {
    return outputs.filter(output => output.type === type);
  };

  const getOutputsByTool = (toolId: string) => {
    return outputs.filter(output => output.toolId === toolId);
  };

  const shareOutput = (outputId: string): string => {
    const output = outputs.find(o => o.id === outputId);
    if (!output) return '';

    // Create a shareable link with encoded data
    const shareData = {
      id: output.id,
      type: output.type,
      data: output.data,
      toolName: output.toolName,
      timestamp: output.timestamp
    };

    const encoded = btoa(JSON.stringify(shareData));
    return `${window.location.origin}/share/${encoded}`;
  };

  const getRecentOutputs = (limit: number = 10): ToolOutput[] => {
    return outputs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  };

  const clearOutputs = () => {
    setOutputs([]);
  };

  return (
    <ToolOutputsContext.Provider
      value={{
        outputs,
        addOutput,
        removeOutput,
        getOutputsByType,
        getOutputsByTool,
        shareOutput,
        getRecentOutputs,
        clearOutputs,
      }}
    >
      {children}
    </ToolOutputsContext.Provider>
  );
};
