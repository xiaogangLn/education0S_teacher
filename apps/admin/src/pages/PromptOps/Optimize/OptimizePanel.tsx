import { useCallback, useEffect, useState } from 'react';
import { Button, Input, Modal, Space, Table, Tag, message } from 'antd';
import { CopyOutlined, ReloadOutlined, RobotOutlined } from '@ant-design/icons';
import { promptOpsService } from '@api/index';
import { extractPayload } from '@/utils/api';
import { SCENE_LABEL, STAGE_LABEL } from '../constants';

type OptimizeTaskItem = {
  id: string;
  type: string;
  subject: string;
  topic: string;
  current_stage: string;
  status: string;
  prompt_recipe_code?: string | null;
  has_revision: boolean;
  revision_note?: string | null;
  fragment_keys: string[];
  model_hint?: string | null;
  updated_at?: string;
};

type SuggestionPayload = {
  diagnosis: string;
  suggested_stage_ask?: string | null;
  suggested_model_hint?: string | null;
  change_summary: string[];
  revision_note?: string | null;
};

type Props = {
  onCloned?: () => void;
};

export const OptimizePanel = ({ onCloned }: Props) => {
  const [items, setItems] = useState<OptimizeTaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [suggestingId, setSuggestingId] = useState<string | null>(null);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<OptimizeTaskItem | null>(null);
  const [suggestion, setSuggestion] = useState<SuggestionPayload | null>(null);
  const [editedAsk, setEditedAsk] = useState('');
  const [applying, setApplying] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await promptOpsService.listOptimizeTasks(40);
      const payload = extractPayload<{ items: OptimizeTaskItem[] }>(res);
      setItems(payload?.items || []);
    } catch (error: any) {
      message.error(error?.message || '加载任务失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const clone = (row: OptimizeTaskItem) => {
    Modal.confirm({
      title: '克隆为优化草稿？',
      content: (
        <div className="text-sm text-slate-600">
          将基于任务所用片段创建 stage_ask 草稿（若有修订意见会附上），并生成一份草稿配方。
          <div className="mt-2">课题：{row.topic}</div>
          <div>配方：{row.prompt_recipe_code || '（无）'}</div>
        </div>
      ),
      onOk: async () => {
        setCloningId(row.id);
        try {
          const res = await promptOpsService.cloneFromTask({
            task_id: row.id,
            include_kinds: ['stage_ask'],
          });
          const payload = extractPayload<{
            recipe?: { code?: string };
            fragments?: unknown[];
          }>(res);
          message.success(
            `已创建草稿配方 ${payload?.recipe?.code || ''}（${payload?.fragments?.length || 0} 个片段）`,
          );
          onCloned?.();
          await load();
        } catch (error: any) {
          message.error(error?.message || '克隆失败');
        } finally {
          setCloningId(null);
        }
      },
    });
  };

  const openSuggest = async (row: OptimizeTaskItem) => {
    setActiveTask(row);
    setSuggestOpen(true);
    setSuggestion(null);
    setEditedAsk('');
    setSuggestingId(row.id);
    try {
      const res = await promptOpsService.suggestFromTask({
        task_id: row.id,
        call_model: true,
      });
      const payload = extractPayload<SuggestionPayload>(res);
      setSuggestion(payload);
      setEditedAsk(payload?.suggested_stage_ask || '');
    } catch (error: any) {
      message.error(error?.message || 'AI 建议失败');
      setSuggestOpen(false);
    } finally {
      setSuggestingId(null);
    }
  };

  const applySuggestion = async () => {
    if (!activeTask) return;
    setApplying(true);
    try {
      const res = await promptOpsService.cloneWithSuggestion({
        task_id: activeTask.id,
        suggested_stage_ask: editedAsk || suggestion?.suggested_stage_ask || undefined,
        suggested_model_hint: suggestion?.suggested_model_hint,
        note: 'AI 优化建议应用',
      });
      const payload = extractPayload<{ recipe?: { code?: string }; fragments?: unknown[] }>(res);
      message.success(
        `已应用建议并创建草稿 ${payload?.recipe?.code || ''}（${payload?.fragments?.length || 0} 个片段）`,
      );
      setSuggestOpen(false);
      onCloned?.();
      await load();
    } catch (error: any) {
      message.error(error?.message || '应用建议失败');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-500">
          从带配方归因或教师修订意见的生成任务，一键克隆草稿；可用「AI 建议」生成改写并落草稿。
        </div>
        <Button icon={<ReloadOutlined />} onClick={() => void load()}>
          刷新
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        pagination={{ pageSize: 10 }}
        columns={[
          { title: '课题', dataIndex: 'topic', ellipsis: true },
          {
            title: '场景',
            dataIndex: 'type',
            width: 90,
            render: (v: string) => SCENE_LABEL[v] || v,
          },
          {
            title: '阶段',
            dataIndex: 'current_stage',
            width: 100,
            render: (v: string) => STAGE_LABEL[v] || v,
          },
          { title: '学科', dataIndex: 'subject', width: 80 },
          {
            title: '配方',
            dataIndex: 'prompt_recipe_code',
            width: 200,
            ellipsis: true,
            render: (v?: string | null) => v || '—',
          },
          {
            title: '修订',
            width: 80,
            render: (_: unknown, row: OptimizeTaskItem) =>
              row.has_revision ? <Tag color="warning">有</Tag> : '—',
          },
          {
            title: '更新时间',
            dataIndex: 'updated_at',
            width: 170,
            render: (v?: string) => (v ? new Date(v).toLocaleString() : '—'),
          },
          {
            title: '操作',
            width: 200,
            render: (_: unknown, row: OptimizeTaskItem) => (
              <Space>
                <Button
                  type="link"
                  size="small"
                  icon={<RobotOutlined />}
                  loading={suggestingId === row.id}
                  onClick={() => void openSuggest(row)}
                >
                  AI 建议
                </Button>
                <Button
                  type="link"
                  size="small"
                  icon={<CopyOutlined />}
                  loading={cloningId === row.id}
                  onClick={() => clone(row)}
                >
                  克隆
                </Button>
              </Space>
            ),
          },
        ]}
      />

      <Modal
        title={`AI 优化建议${activeTask ? ` · ${activeTask.topic}` : ''}`}
        open={suggestOpen}
        onCancel={() => setSuggestOpen(false)}
        width={720}
        footer={[
          <Button key="cancel" onClick={() => setSuggestOpen(false)}>
            取消
          </Button>,
          <Button
            key="apply"
            type="primary"
            loading={applying}
            disabled={!editedAsk.trim()}
            onClick={() => void applySuggestion()}
          >
            应用并克隆草稿
          </Button>,
        ]}
      >
        {!suggestion ? (
          <div className="py-8 text-center text-slate-500">正在生成建议…</div>
        ) : (
          <div className="space-y-3">
            <div>
              <div className="mb-1 text-sm font-medium">诊断</div>
              <div className="text-sm text-slate-700 whitespace-pre-wrap">{suggestion.diagnosis}</div>
            </div>
            {suggestion.change_summary?.length ? (
              <div>
                <div className="mb-1 text-sm font-medium">改动要点</div>
                <ul className="list-disc pl-5 text-sm text-slate-700">
                  {suggestion.change_summary.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {suggestion.suggested_model_hint ? (
              <div className="text-sm">
                建议模型：<Tag>{suggestion.suggested_model_hint}</Tag>
              </div>
            ) : null}
            <div>
              <div className="mb-1 text-sm font-medium">建议 stage_ask（可编辑）</div>
              <Input.TextArea
                rows={12}
                value={editedAsk}
                onChange={(e) => setEditedAsk(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
