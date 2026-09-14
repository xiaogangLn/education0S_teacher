import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Form, Select, Space, Switch, Table, Tag, message } from 'antd';
import { PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  promptOpsService,
  type PromptEvalCaseItem,
  type PromptEvalRunItem,
  type PromptRecipeItem,
} from '@api/index';
import { extractPayload } from '@/utils/api';
import { SCENE_LABEL, STAGE_LABEL } from '../constants';

type Props = {
  recipes: PromptRecipeItem[];
};

export const EvalPanel = ({ recipes }: Props) => {
  const [cases, setCases] = useState<PromptEvalCaseItem[]>([]);
  const [runs, setRuns] = useState<PromptEvalRunItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [form] = Form.useForm();

  const recipeOptions = useMemo(
    () =>
      recipes.map((item) => ({
        value: item.code,
        label: `${item.code}（${item.title}）`,
      })),
    [recipes],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [caseRes, runRes] = await Promise.all([
        promptOpsService.listEvalCases('default'),
        promptOpsService.listEvalRuns('default'),
      ]);
      setCases(extractPayload<{ items: PromptEvalCaseItem[] }>(caseRes)?.items || []);
      setRuns(extractPayload<{ items: PromptEvalRunItem[] }>(runRes)?.items || []);
    } catch (error: any) {
      message.error(error?.message || '加载评测数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startRun = async () => {
    const values = await form.validateFields();
    if (values.recipe_a_code === values.recipe_b_code) {
      message.error('请选择两个不同配方');
      return;
    }
    setRunning(true);
    try {
      const res = await promptOpsService.createEvalRun({
        suite_key: 'default',
        recipe_a_code: values.recipe_a_code,
        recipe_b_code: values.recipe_b_code,
        call_model: Boolean(values.call_model),
      });
      const payload = extractPayload<PromptEvalRunItem>(res);
      if (payload?.status === 'failed') {
        message.error(payload.error || '评测失败');
      } else {
        message.success(
          `评测完成：A胜 ${payload?.summary?.a_wins ?? 0} / B胜 ${payload?.summary?.b_wins ?? 0} / 平 ${payload?.summary?.ties ?? 0}`,
        );
      }
      await load();
    } catch (error: any) {
      message.error(error?.message || '评测失败');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded border border-slate-200 bg-white p-4">
        <div className="mb-3 text-sm text-slate-500">
          用默认回归集对比两个已发布配方（启发式打分；可选调模型）。
        </div>
        <Form
          form={form}
          layout="inline"
          initialValues={{ call_model: false }}
          className="flex flex-wrap gap-2"
        >
          <Form.Item name="recipe_a_code" rules={[{ required: true, message: '选 A' }]}>
            <Select
              style={{ width: 280 }}
              showSearch
              optionFilterProp="label"
              placeholder="配方 A"
              options={recipeOptions}
            />
          </Form.Item>
          <Form.Item name="recipe_b_code" rules={[{ required: true, message: '选 B' }]}>
            <Select
              style={{ width: 280 }}
              showSearch
              optionFilterProp="label"
              placeholder="配方 B"
              options={recipeOptions}
            />
          </Form.Item>
          <Form.Item name="call_model" label="调模型" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Space>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              loading={running}
              onClick={() => void startRun()}
            >
              开始对比
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => void load()}>
              刷新
            </Button>
          </Space>
        </Form>
      </div>

      <div>
        <h3 className="mb-2 text-base font-medium">回归用例</h3>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={cases}
          pagination={false}
          size="small"
          columns={[
            { title: '标题', dataIndex: 'title' },
            {
              title: '场景',
              dataIndex: 'scene',
              width: 90,
              render: (v: string) => SCENE_LABEL[v] || v,
            },
            {
              title: '阶段',
              dataIndex: 'stage',
              width: 110,
              render: (v: string) => STAGE_LABEL[v] || v,
            },
            {
              title: '学情',
              dataIndex: 'has_students',
              width: 80,
              render: (v: boolean) => (v ? '有' : '无'),
            },
          ]}
        />
      </div>

      <div>
        <h3 className="mb-2 text-base font-medium">运行记录</h3>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={runs}
          pagination={{ pageSize: 8 }}
          columns={[
            { title: 'A', dataIndex: 'recipe_a_code', ellipsis: true },
            { title: 'B', dataIndex: 'recipe_b_code', ellipsis: true },
            {
              title: '状态',
              dataIndex: 'status',
              width: 90,
              render: (status: string) => <Tag>{status}</Tag>,
            },
            {
              title: '结果',
              width: 180,
              render: (_: unknown, row: PromptEvalRunItem) =>
                row.summary
                  ? `A ${row.summary.a_wins ?? 0} / B ${row.summary.b_wins ?? 0} / 平 ${row.summary.ties ?? 0}`
                  : row.error || '—',
            },
            {
              title: '调模型',
              dataIndex: 'call_model',
              width: 80,
              render: (v: boolean) => (v ? '是' : '否'),
            },
            {
              title: '时间',
              dataIndex: 'created_at',
              width: 180,
              render: (v?: string) => (v ? new Date(v).toLocaleString() : '—'),
            },
          ]}
        />
      </div>
    </div>
  );
};
