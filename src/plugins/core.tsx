import React from 'react';
import { registerExecutor, registerRenderer } from '../lib/registry';
import { SKILL_REGISTRY } from '../lib/skills';

// Import all renderers
import { ChartRender } from '../components/renders/ChartRender';
import { ThreadRender } from '../components/renders/ThreadRender';
import { ComparisonRender } from '../components/renders/ComparisonRender';
import { TimelineRender } from '../components/renders/TimelineRender';
import { LessonRender } from '../components/renders/LessonRender';
import { DatasetRender } from '../components/renders/DatasetRender';
import { ThinkRender } from '../components/renders/ThinkRender';
import { PlanRender } from '../components/renders/PlanRender';

// ---------------------------------------------------------
// 1. Register UI Renderers
// ---------------------------------------------------------
registerRenderer('render_chart', ChartRender);
registerRenderer('render_thread', ThreadRender);
registerRenderer('render_comparison', ComparisonRender);
registerRenderer('render_timeline', TimelineRender);
registerRenderer('render_lesson', LessonRender);
registerRenderer('build_dataset', DatasetRender);
registerRenderer('think', ThinkRender);
registerRenderer('open_board', PlanRender);
registerRenderer('update_board', (props) => <PlanRender {...props} isUpdate={true} />);

// ---------------------------------------------------------
// 2. Register Tool Executors
// ---------------------------------------------------------

registerExecutor('read_skill', async (input) => {
  const skill = SKILL_REGISTRY.find(s => s.id === input.skill_id);
  if (!skill) return { error: `Skill ${input.skill_id} not found.` };
  return { skill_id: skill.id, name: skill.name, detailed_instructions: skill.detailedInstructions };
});

registerExecutor('query_griot', async (input, ctx) => {
  return await ctx.queryGriot(input);
});

registerExecutor('open_board', async (input, ctx) => {
  ctx.board.openBoard(input);
  return { success: true };
});

registerExecutor('update_board', async (input, ctx) => {
  ctx.board.updateBoard(input);
  return { success: true };
});

registerExecutor('manage_skills', async (input, ctx) => {
  ctx.setActiveSkillIds((prev: string[]) => {
    let next = [...prev];
    if (input.enable_skills) {
      input.enable_skills.forEach((s: string) => {
        if (!next.includes(s)) next.push(s);
      });
    }
    if (input.disable_skills) {
      next = next.filter(s => !input.disable_skills.includes(s) || s === 'records_explorer');
    }
    return next;
  });
  return { success: true };
});

// UI Tools just need to return success to the LLM so it knows it rendered
const uiTools = [
  'render_chart', 
  'render_thread', 
  'render_comparison', 
  'render_timeline', 
  'render_lesson', 
  'build_dataset', 
  'think'
];

uiTools.forEach(tool => {
  registerExecutor(tool, async () => ({ success: true, rendered: true }));
});
