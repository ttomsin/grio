import { create } from 'zustand';

interface BoardState {
  isOpen: boolean;
  task: string;
  status: string;
  steps: string[];
  completedSteps: string[];
  currentStep: string;
  dataPreview: any | null;
  openBoard: (data: any) => void;
  updateBoard: (data: any) => void;
  closeBoard: () => void;
}

export const useBoard = create<BoardState>((set) => ({
  isOpen: false,
  task: "",
  status: "",
  steps: [],
  completedSteps: [],
  currentStep: "",
  dataPreview: null,
  openBoard: (data) => set({ 
    isOpen: true, 
    task: data.task, 
    status: data.status, 
    steps: data.steps || [],
    completedSteps: [],
    currentStep: "",
    dataPreview: null
  }),
  updateBoard: (data) => set((state) => ({
    status: data.status || state.status,
    completedSteps: data.completed_steps || state.completedSteps,
    currentStep: data.current_step || state.currentStep,
    dataPreview: data.data_preview || state.dataPreview
  })),
  closeBoard: () => set({ isOpen: false })
}));
