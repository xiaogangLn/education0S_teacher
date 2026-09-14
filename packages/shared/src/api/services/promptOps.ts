import { httpClient } from '../client';

export type PromptFragmentKind = 'system' | 'stage_ask' | 'rule' | 'format';
export type PromptPublishStatus = 'draft' | 'published' | 'archived';

export interface PromptFragmentItem {
  id: string;
  key: string;
  title: string;
  kind: PromptFragmentKind | string;
  body: string;
  variables: string[];
  status: PromptPublishStatus | string;
  version: number;
  locked: boolean;
  parent_id?: string | null;
  changelog?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PromptRecipeItem {
  id: string;
  code: string;
  title: string;
  scene: string;
  stage: string;
  conditions: {
    hasStudents?: boolean;
    subject?: string[];
    planCode?: string[];
  };
  fragment_keys: string[];
  model_hint?: string | null;
  status: PromptPublishStatus | string;
  version: number;
  locked: boolean;
  parent_id?: string | null;
  changelog?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PromptPreviewResult {
  recipe: PromptRecipeItem;
  conditions: PromptRecipeItem['conditions'];
  system_prompt: string;
  stage_ask: string;
}

export const promptOpsService = {
  listFragments: async (params?: {
    kind?: string;
    status?: string;
    keyword?: string;
    include_archived?: boolean;
  }) => {
    return httpClient.get<{ items: PromptFragmentItem[]; total: number }>(
      '/admin/prompts/fragments',
      { params },
    );
  },
  getFragment: async (id: string) => {
    return httpClient.get<PromptFragmentItem>(`/admin/prompts/fragments/${id}`);
  },
  createFragment: async (data: {
    key: string;
    title: string;
    kind: string;
    body: string;
    variables?: string[];
    locked?: boolean;
    changelog?: string;
  }) => {
    return httpClient.post<PromptFragmentItem>('/admin/prompts/fragments', data);
  },
  updateFragment: async (
    id: string,
    data: Partial<{
      title: string;
      kind: string;
      body: string;
      variables: string[];
      changelog: string;
    }>,
  ) => {
    return httpClient.put<PromptFragmentItem>(`/admin/prompts/fragments/${id}`, data);
  },
  publishFragment: async (id: string, changelog?: string) => {
    return httpClient.post<PromptFragmentItem>(`/admin/prompts/fragments/${id}/publish`, {
      changelog,
    });
  },
  archiveFragment: async (id: string) => {
    return httpClient.delete<{ ok: boolean }>(`/admin/prompts/fragments/${id}`);
  },

  listRecipes: async (params?: {
    scene?: string;
    stage?: string;
    status?: string;
    keyword?: string;
    include_archived?: boolean;
  }) => {
    return httpClient.get<{ items: PromptRecipeItem[]; total: number }>(
      '/admin/prompts/recipes',
      { params },
    );
  },
  getRecipe: async (id: string) => {
    return httpClient.get<PromptRecipeItem>(`/admin/prompts/recipes/${id}`);
  },
  createRecipe: async (data: {
    code: string;
    title: string;
    scene: string;
    stage: string;
    conditions?: PromptRecipeItem['conditions'];
    fragment_keys: string[];
    model_hint?: string | null;
    locked?: boolean;
    changelog?: string;
  }) => {
    return httpClient.post<PromptRecipeItem>('/admin/prompts/recipes', data);
  },
  updateRecipe: async (
    id: string,
    data: Partial<{
      title: string;
      scene: string;
      stage: string;
      conditions: PromptRecipeItem['conditions'];
      fragment_keys: string[];
      model_hint: string | null;
      changelog: string;
    }>,
  ) => {
    return httpClient.put<PromptRecipeItem>(`/admin/prompts/recipes/${id}`, data);
  },
  publishRecipe: async (id: string, changelog?: string) => {
    return httpClient.post<PromptRecipeItem>(`/admin/prompts/recipes/${id}/publish`, {
      changelog,
    });
  },
  previewRecipe: async (id: string, variables?: Record<string, string>) => {
    return httpClient.post<PromptPreviewResult>(`/admin/prompts/recipes/${id}/preview`, {
      variables,
    });
  },
  dryRun: async (data: {
    recipe_id?: string;
    scene?: string;
    stage?: string;
    has_students?: boolean;
    subject?: string;
    school_id?: string;
    variables?: Record<string, string>;
    call_model?: boolean;
    max_tokens?: number;
  }) => {
    return httpClient.post<{
      system_prompt: string;
      stage_ask: string;
      user_prompt: string;
      output: string;
      latency_ms: number;
      model_error?: string | null;
      call_model: boolean;
      meta?: Record<string, unknown>;
    }>('/admin/prompts/dry-run', data);
  },
  dryRunRecipe: async (
    id: string,
    data?: {
      variables?: Record<string, string>;
      school_id?: string;
      call_model?: boolean;
      max_tokens?: number;
    },
  ) => {
    return httpClient.post<{
      system_prompt: string;
      stage_ask: string;
      user_prompt: string;
      output: string;
      latency_ms: number;
      model_error?: string | null;
      call_model: boolean;
      meta?: Record<string, unknown>;
    }>(`/admin/prompts/recipes/${id}/dry-run`, data || {});
  },
  archiveRecipe: async (id: string) => {
    return httpClient.delete<{ ok: boolean }>(`/admin/prompts/recipes/${id}`);
  },

  listExperiments: async (params?: { scene?: string; stage?: string; status?: string }) => {
    return httpClient.get<{ items: PromptExperimentItem[]; total: number }>(
      '/admin/prompts/experiments',
      { params },
    );
  },
  createExperiment: async (data: {
    name: string;
    scene: string;
    stage: string;
    variants: PromptExperimentVariant[];
    scope?: PromptExperimentScope;
    note?: string;
  }) => {
    return httpClient.post<PromptExperimentItem>('/admin/prompts/experiments', data);
  },
  updateExperiment: async (
    id: string,
    data: Partial<{
      name: string;
      scene: string;
      stage: string;
      variants: PromptExperimentVariant[];
      scope: PromptExperimentScope;
      note: string | null;
    }>,
  ) => {
    return httpClient.put<PromptExperimentItem>(`/admin/prompts/experiments/${id}`, data);
  },
  startExperiment: async (id: string) => {
    return httpClient.post<PromptExperimentItem>(`/admin/prompts/experiments/${id}/start`);
  },
  pauseExperiment: async (id: string) => {
    return httpClient.post<PromptExperimentItem>(`/admin/prompts/experiments/${id}/pause`);
  },
  finishExperiment: async (id: string) => {
    return httpClient.post<PromptExperimentItem>(`/admin/prompts/experiments/${id}/finish`);
  },
  deleteExperiment: async (id: string) => {
    return httpClient.delete<{ ok: boolean }>(`/admin/prompts/experiments/${id}`);
  },
  getExperimentMetrics: async (id: string) => {
    return httpClient.get<PromptExperimentMetrics>(`/admin/prompts/experiments/${id}/metrics`);
  },

  listEvalCases: async (suite_key = 'default') => {
    return httpClient.get<{ items: PromptEvalCaseItem[]; total: number }>(
      '/admin/prompts/evals/cases',
      { params: { suite_key } },
    );
  },
  listEvalRuns: async (suite_key?: string) => {
    return httpClient.get<{ items: PromptEvalRunItem[]; total: number }>(
      '/admin/prompts/evals/runs',
      { params: suite_key ? { suite_key } : undefined },
    );
  },
  getEvalRun: async (id: string) => {
    return httpClient.get<PromptEvalRunItem>(`/admin/prompts/evals/runs/${id}`);
  },
  createEvalRun: async (data: {
    suite_key?: string;
    recipe_a_code: string;
    recipe_b_code: string;
    call_model?: boolean;
    school_id?: string;
  }) => {
    return httpClient.post<PromptEvalRunItem>('/admin/prompts/evals/runs', data);
  },

  listOptimizeTasks: async (limit = 30) => {
    return httpClient.get<{ items: PromptOptimizeTaskItem[]; total: number }>(
      '/admin/prompts/optimize/tasks',
      { params: { limit } },
    );
  },
  cloneFromTask: async (data: {
    task_id: string;
    include_kinds?: string[];
    note?: string;
  }) => {
    return httpClient.post<{
      task_id: string;
      recipe: PromptRecipeItem;
      fragments: PromptFragmentItem[];
      source_recipe_code?: string | null;
      revision_note?: string | null;
    }>('/admin/prompts/optimize/clone-from-task', data);
  },

  suggestFromTask: async (data: {
    task_id: string;
    school_id?: string;
    call_model?: boolean;
  }) => {
    return httpClient.post<{
      task_id: string;
      scene: string;
      stage: string;
      diagnosis: string;
      suggested_stage_ask?: string | null;
      suggested_model_hint?: string | null;
      change_summary: string[];
      revision_note?: string | null;
      call_model: boolean;
    }>('/admin/prompts/optimize/suggest-from-task', data);
  },

  cloneWithSuggestion: async (data: {
    task_id: string;
    suggested_stage_ask?: string;
    suggested_model_hint?: string | null;
    note?: string;
    school_id?: string;
  }) => {
    return httpClient.post<{
      task_id: string;
      recipe: PromptRecipeItem;
      fragments: PromptFragmentItem[];
      suggestion?: {
        diagnosis?: string | null;
        change_summary?: string[];
        suggested_stage_ask?: string | null;
        suggested_model_hint?: string | null;
      };
    }>('/admin/prompts/optimize/clone-with-suggestion', data);
  },
};

export interface PromptOptimizeTaskItem {
  id: string;
  type: string;
  subject: string;
  topic: string;
  current_stage: string;
  status: string;
  prompt_recipe_id?: string | null;
  prompt_recipe_code?: string | null;
  prompt_recipe_version?: number | null;
  prompt_experiment_id?: string | null;
  prompt_variant?: string | null;
  fragment_keys: string[];
  model_hint?: string | null;
  has_revision: boolean;
  revision_note?: string | null;
  updated_at?: string;
  created_at?: string;
}

export interface PromptExperimentVariant {
  recipe_code: string;
  weight: number;
  label?: string;
}

export interface PromptExperimentScope {
  school_ids?: string[];
  plan_codes?: string[];
  percent?: number;
}

export interface PromptExperimentItem {
  id: string;
  name: string;
  scene: string;
  stage: string;
  variants: PromptExperimentVariant[];
  scope: PromptExperimentScope;
  status: string;
  note?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PromptExperimentMetrics {
  experiment: PromptExperimentItem;
  total_calls: number;
  variants: Array<{
    label: string;
    recipe_code: string;
    calls: number;
    revisions: number;
    revision_rate: number;
  }>;
}

export interface PromptEvalCaseItem {
  id: string;
  suite_key: string;
  title: string;
  scene: string;
  stage: string;
  has_students: boolean;
  variables: Record<string, string>;
  enabled: boolean;
  sort_order: number;
}

export interface PromptEvalRunItem {
  id: string;
  suite_key: string;
  recipe_a_code: string;
  recipe_b_code: string;
  status: string;
  call_model: boolean;
  summary?: {
    total?: number;
    a_wins?: number;
    b_wins?: number;
    ties?: number;
  } | null;
  results?: Array<Record<string, unknown>>;
  error?: string | null;
  created_at?: string;
}
