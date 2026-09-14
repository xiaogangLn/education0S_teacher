import { useCallback, useEffect, useState } from 'react';
import { Tabs, message } from 'antd';
import { promptOpsService, type PromptRecipeItem } from '@api/index';
import { extractPayload } from '@/utils/api';
import { FragmentList } from './Fragments/FragmentList';
import { RecipeList } from './Recipes/RecipeList';
import { DryRunPanel } from './DryRun/DryRunPanel';
import { ExperimentPanel } from './Experiments/ExperimentPanel';
import { EvalPanel } from './Evals/EvalPanel';
import { OptimizePanel } from './Optimize/OptimizePanel';

export const PromptOpsPage = () => {
  const [recipes, setRecipes] = useState<PromptRecipeItem[]>([]);

  const loadRecipes = useCallback(async () => {
    try {
      const res = await promptOpsService.listRecipes({ include_archived: false });
      const payload = extractPayload<{ items: PromptRecipeItem[] }>(res);
      setRecipes(payload?.items || []);
    } catch (error: any) {
      message.error(error?.message || '加载配方失败');
    }
  }, []);

  useEffect(() => {
    void loadRecipes();
  }, [loadRecipes]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="m-0 text-xl font-semibold">提示词中心</h1>
        <p className="mt-1 text-sm text-slate-500">
          片段 / 配方运维、试跑、A/B 实验、回归评测，以及从线上任务克隆优化草稿。
        </p>
      </div>
      <Tabs
        items={[
          { key: 'fragments', label: '片段库', children: <FragmentList /> },
          {
            key: 'recipes',
            label: '组装配方',
            children: <RecipeList onChanged={() => void loadRecipes()} />,
          },
          {
            key: 'dry-run',
            label: '试跑',
            children: <DryRunPanel recipes={recipes} />,
          },
          {
            key: 'experiments',
            label: '实验',
            children: <ExperimentPanel recipes={recipes} />,
          },
          {
            key: 'evals',
            label: '评测',
            children: <EvalPanel recipes={recipes} />,
          },
          {
            key: 'optimize',
            label: '优化闭环',
            children: <OptimizePanel onCloned={() => void loadRecipes()} />,
          },
        ]}
      />
    </div>
  );
};

export default PromptOpsPage;
