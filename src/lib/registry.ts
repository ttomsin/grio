import React from 'react';

export type ToolExecutorContext = {
  queryGriot: (params: any) => Promise<any>;
  board: any;
  setActiveSkillIds: any;
};

export type ToolExecutor = (input: any, context: ToolExecutorContext) => Promise<any>;
export type ToolRenderer = React.FC<{ data: any; isUpdate?: boolean }>;

export const ToolExecutors: Record<string, ToolExecutor> = {};
export const ToolRenderers: Record<string, ToolRenderer> = {};

/**
 * Register a function that executes when the AI calls a specific tool.
 */
export function registerExecutor(name: string, executor: ToolExecutor) {
  ToolExecutors[name] = executor;
}

/**
 * Register a React component that renders the UI for a specific tool call.
 */
export function registerRenderer(name: string, renderer: ToolRenderer) {
  ToolRenderers[name] = renderer;
}
