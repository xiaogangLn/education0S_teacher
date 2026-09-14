import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  promptOpsService,
  type PromptExperimentItem,
  type PromptExperimentMetrics,
  type PromptRecipeItem,
} from '@api/index';
import { extractPayload } from '@/utils/api';
import { SCENE_LABEL, SCENE_OPTIONS, STAGE_LABEL, STAGE_OPTIONS } from '../constants';

type Props = {
  recipes: PromptRecipeItem[];
};

const EXP_STATUS: Record<string, string> = {
  draft: '草稿',
  running: '运行中',
  paused: '已暂停',
  finished: '已结束',
};

export const ExperimentPanel = ({ recipes }: Props) => {
  const [items, setItems] = useState<PromptExperimentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [metrics, setMetrics] = useState<PromptExperimentMetrics | null>(null);
  const [form] = Form.useForm();

  const recipeOptions = useMemo(
    () =>
      recipes
        .filter((item) => item.status === 'published' || item.status === 'draft')
        .map((item) => ({ value: item.code, label: `${item.code}（${item.title}）` })),
    [recipes],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await promptOpsService.listExperiments();
      const payload = extractPayload<{ items: PromptExperimentItem[] }>(res);
      setItems(payload?.items || []);
    } catch (error: any) {
      message.error(error?.message || '加载实验失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    form.setFieldsValue({
      name: '',
      scene: 'lesson_plan',
      stage: 'analysis',
      recipe_a: undefined,
      recipe_b: undefined,
      weight_a: 50,
      weight_b: 50,
      percent: 100,
      note: '',
    });
    setModalOpen(true);
  };

  const create = async () => {
    const values = await form.validateFields();
    if (values.recipe_a === values.recipe_b) {
      message.error('请选择两个不同配方');
      return;
    }
    setSaving(true);
    try {
      await promptOpsService.createExperiment({
        name: values.name,
        scene: values.scene,
        stage: values.stage,
        variants: [
          { recipe_code: values.recipe_a, weight: values.weight_a, label: 'A' },
          { recipe_code: values.recipe_b, weight: values.weight_b, label: 'B' },
        ],
        scope: { percent: values.percent },
        note: values.note,
      });
      message.success('已创建实验草稿');
      setModalOpen(false);
      await load();
    } catch (error: any) {
      message.error(error?.message || '创建失败');
    } finally {
      setSaving(false);
    }
  };

  const act = async (
    row: PromptExperimentItem,
    action: 'start' | 'pause' | 'finish' | 'delete',
  ) => {
    try {
      if (action === 'start') await promptOpsService.startExperiment(row.id);
      if (action === 'pause') await promptOpsService.pauseExperiment(row.id);
      if (action === 'finish') await promptOpsService.finishExperiment(row.id);
      if (action === 'delete') await promptOpsService.deleteExperiment(row.id);
      message.success('已更新');
      await load();
    } catch (error: any) {
      message.error(error?.message || '操作失败');
    }
  };

  const showMetrics = async (row: PromptExperimentItem) => {
    try {
      const res = await promptOpsService.getExperimentMetrics(row.id);
      const payload = extractPayload<PromptExperimentMetrics>(res);
      setMetrics(payload);
    } catch (error: any) {
      message.error(error?.message || '加载指标失败');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="text-sm text-slate-500">
          同 scene/stage 同时仅一个 running。命中后按权重分流到变体配方。
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => void load()}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建实验
          </Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        pagination={{ pageSize: 10 }}
        columns={[
          { title: '名称', dataIndex: 'name', ellipsis: true },
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
            title: '变体',
            width: 280,
            render: (_: unknown, row: PromptExperimentItem) =>
              row.variants
                .map((item) => `${item.label || item.recipe_code}:${item.weight}`)
                .join(' / '),
          },
          {
            title: '灰度%',
            width: 80,
            render: (_: unknown, row: PromptExperimentItem) => row.scope?.percent ?? 100,
          },
          {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            render: (status: string) => (
              <Tag
                color={
                  status === 'running'
                    ? 'success'
                    : status === 'paused'
                      ? 'warning'
                      : status === 'finished'
                        ? 'default'
                        : 'processing'
                }
              >
                {EXP_STATUS[status] || status}
              </Tag>
            ),
          },
          {
            title: '操作',
            width: 320,
            render: (_: unknown, row: PromptExperimentItem) => (
              <Space wrap>
                <Button type="link" size="small" onClick={() => void showMetrics(row)}>
                  指标
                </Button>
                {row.status !== 'running' && row.status !== 'finished' && (
                  <Button type="link" size="small" onClick={() => void act(row, 'start')}>
                    启动
                  </Button>
                )}
                {row.status === 'running' && (
                  <Button type="link" size="small" onClick={() => void act(row, 'pause')}>
                    暂停
                  </Button>
                )}
                {row.status !== 'finished' && (
                  <Button type="link" size="small" onClick={() => void act(row, 'finish')}>
                    结束
                  </Button>
                )}
                {row.status !== 'running' && (
                  <Button type="link" size="small" danger onClick={() => void act(row, 'delete')}>
                    删除
                  </Button>
                )}
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title="新建实验"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void create()}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-2">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="scene" label="场景" rules={[{ required: true }]}>
              <Select options={SCENE_OPTIONS.map((i) => ({ value: i.value, label: i.label }))} />
            </Form.Item>
            <Form.Item name="stage" label="阶段" rules={[{ required: true }]}>
              <Select options={STAGE_OPTIONS.map((i) => ({ value: i.value, label: i.label }))} />
            </Form.Item>
          </div>
          <Form.Item name="recipe_a" label="变体 A 配方" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="label" options={recipeOptions} />
          </Form.Item>
          <Form.Item name="weight_a" label="A 权重" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="recipe_b" label="变体 B 配方" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="label" options={recipeOptions} />
          </Form.Item>
          <Form.Item name="weight_b" label="B 权重" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="percent" label="流量百分比" rules={[{ required: true }]}>
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={metrics ? `指标 · ${metrics.experiment.name}` : '指标'}
        open={Boolean(metrics)}
        onCancel={() => setMetrics(null)}
        footer={null}
        width={720}
      >
        {metrics && (
          <div className="space-y-3">
            <div className="text-sm text-slate-500">总调用 {metrics.total_calls}</div>
            <Table
              rowKey="recipe_code"
              pagination={false}
              dataSource={metrics.variants}
              columns={[
                { title: '变体', dataIndex: 'label' },
                { title: '配方', dataIndex: 'recipe_code', ellipsis: true },
                { title: '调用', dataIndex: 'calls', width: 80 },
                { title: '修订次数', dataIndex: 'revisions', width: 100 },
                {
                  title: '修订率',
                  dataIndex: 'revision_rate',
                  width: 90,
                  render: (v: number) => `${Math.round(v * 100)}%`,
                },
              ]}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};
