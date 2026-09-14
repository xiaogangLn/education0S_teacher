import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import { PlusOutlined, ReloadOutlined, CloudUploadOutlined, EyeOutlined } from '@ant-design/icons';
import { promptOpsService, type PromptRecipeItem } from '@api/index';
import { extractPayload } from '@/utils/api';
import {
  PREVIEW_SAMPLE_VARS,
  SCENE_LABEL,
  SCENE_OPTIONS,
  STAGE_LABEL,
  STAGE_OPTIONS,
  STATUS_COLOR,
  STATUS_LABEL,
} from '../constants';
import { RecipeEditor } from './RecipeEditor';

type Filters = {
  scene?: string;
  stage?: string;
  status?: string;
  keyword?: string;
};

type Props = {
  onChanged?: () => void;
};

export const RecipeList = ({ onChanged }: Props) => {
  const [items, setItems] = useState<PromptRecipeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<PromptRecipeItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await promptOpsService.listRecipes(filters);
      const payload = extractPayload<{ items: PromptRecipeItem[]; total: number }>(res);
      setItems(payload?.items || []);
    } catch (error: any) {
      message.error(error?.message || '加载配方失败');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (row: PromptRecipeItem) => {
    setEditing(row);
    setEditorOpen(true);
  };

  const publish = (row: PromptRecipeItem) => {
    Modal.confirm({
      title: `发布配方 ${row.code}？`,
      content: '发布后匹配该 scene/stage/条件 的新生成将使用此配方。',
      onOk: async () => {
        try {
          await promptOpsService.publishRecipe(row.id);
          message.success('已发布');
          await load();
          onChanged?.();
        } catch (error: any) {
          message.error(error?.message || '发布失败');
        }
      },
    });
  };

  const preview = async (row: PromptRecipeItem) => {
    try {
      const res = await promptOpsService.previewRecipe(row.id, PREVIEW_SAMPLE_VARS);
      const payload = extractPayload<{
        system_prompt: string;
        stage_ask: string;
      }>(res);
      Modal.info({
        title: `预览 · ${row.code}`,
        width: 860,
        content: (
          <div className="max-h-[60vh] space-y-4 overflow-auto text-sm">
            <div>
              <div className="mb-1 font-medium">System</div>
              <pre className="whitespace-pre-wrap rounded bg-slate-50 p-3">{payload?.system_prompt}</pre>
            </div>
            <div>
              <div className="mb-1 font-medium">Stage Ask</div>
              <pre className="whitespace-pre-wrap rounded bg-slate-50 p-3">{payload?.stage_ask}</pre>
            </div>
          </div>
        ),
      });
    } catch (error: any) {
      message.error(error?.message || '预览失败');
    }
  };

  const archive = (row: PromptRecipeItem) => {
    if (row.locked) {
      message.warning('锁定配方不可归档');
      return;
    }
    Modal.confirm({
      title: `归档配方 ${row.code}？`,
      onOk: async () => {
        try {
          await promptOpsService.archiveRecipe(row.id);
          message.success('已归档');
          await load();
          onChanged?.();
        } catch (error: any) {
          message.error(error?.message || '归档失败');
        }
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Space wrap>
          <Select
            allowClear
            placeholder="场景"
            style={{ width: 120 }}
            options={SCENE_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
            value={filters.scene}
            onChange={(scene) => setFilters((prev) => ({ ...prev, scene }))}
          />
          <Select
            allowClear
            placeholder="阶段"
            style={{ width: 140 }}
            options={STAGE_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
            value={filters.stage}
            onChange={(stage) => setFilters((prev) => ({ ...prev, stage }))}
          />
          <Select
            allowClear
            placeholder="状态"
            style={{ width: 120 }}
            options={[
              { value: 'draft', label: '草稿' },
              { value: 'published', label: '已发布' },
            ]}
            value={filters.status}
            onChange={(status) => setFilters((prev) => ({ ...prev, status }))}
          />
          <Input.Search
            allowClear
            placeholder="搜索 code / 标题"
            style={{ width: 220 }}
            onSearch={(keyword) => setFilters((prev) => ({ ...prev, keyword: keyword || undefined }))}
          />
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => void load()}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建配方
          </Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        pagination={{ pageSize: 12 }}
        columns={[
          { title: 'Code', dataIndex: 'code', width: 260, ellipsis: true },
          { title: '标题', dataIndex: 'title', ellipsis: true },
          {
            title: '场景',
            dataIndex: 'scene',
            width: 90,
            render: (scene: string) => SCENE_LABEL[scene] || scene,
          },
          {
            title: '阶段',
            dataIndex: 'stage',
            width: 110,
            render: (stage: string) => STAGE_LABEL[stage] || stage,
          },
          {
            title: '条件',
            dataIndex: 'conditions',
            width: 120,
            render: (conditions: PromptRecipeItem['conditions']) => {
              if (typeof conditions?.hasStudents === 'boolean') {
                return conditions.hasStudents ? '有学情' : '无学情';
              }
              return '通用';
            },
          },
          {
            title: '片段数',
            width: 80,
            render: (_: unknown, row: PromptRecipeItem) => row.fragment_keys?.length || 0,
          },
          {
            title: '模型',
            dataIndex: 'model_hint',
            width: 140,
            ellipsis: true,
            render: (v?: string | null) => v || '—',
          },
          {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            render: (status: string) => (
              <Tag color={STATUS_COLOR[status]}>{STATUS_LABEL[status] || status}</Tag>
            ),
          },
          { title: '版本', dataIndex: 'version', width: 70 },
          {
            title: '操作',
            width: 280,
            render: (_: unknown, row: PromptRecipeItem) => (
              <Space>
                <Button type="link" size="small" onClick={() => openEdit(row)}>
                  编辑
                </Button>
                <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => void preview(row)}>
                  预览
                </Button>
                {row.status !== 'published' && (
                  <Button
                    type="link"
                    size="small"
                    icon={<CloudUploadOutlined />}
                    onClick={() => publish(row)}
                  >
                    发布
                  </Button>
                )}
                {!row.locked && (
                  <Button type="link" size="small" danger onClick={() => archive(row)}>
                    归档
                  </Button>
                )}
              </Space>
            ),
          },
        ]}
      />

      <RecipeEditor
        open={editorOpen}
        editing={editing}
        onClose={() => setEditorOpen(false)}
        onSaved={() => {
          setEditorOpen(false);
          void load();
          onChanged?.();
        }}
      />
    </div>
  );
};
