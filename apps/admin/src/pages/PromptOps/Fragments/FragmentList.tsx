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
import { PlusOutlined, ReloadOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { promptOpsService, type PromptFragmentItem } from '@api/index';
import { extractPayload } from '@/utils/api';
import { KIND_LABEL, KIND_OPTIONS, STATUS_COLOR, STATUS_LABEL } from '../constants';
import { FragmentModal } from './FragmentModal';

type Filters = {
  kind?: string;
  status?: string;
  keyword?: string;
};

export const FragmentList = () => {
  const [items, setItems] = useState<PromptFragmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PromptFragmentItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await promptOpsService.listFragments(filters);
      const payload = extractPayload<{ items: PromptFragmentItem[]; total: number }>(res);
      setItems(payload?.items || []);
    } catch (error: any) {
      message.error(error?.message || '加载片段失败');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row: PromptFragmentItem) => {
    setEditing(row);
    setModalOpen(true);
  };

  const publish = (row: PromptFragmentItem) => {
    Modal.confirm({
      title: `发布片段 ${row.key}？`,
      content: '发布后新生成任务将使用该片段正文（需配方仍引用此 key）。',
      onOk: async () => {
        try {
          await promptOpsService.publishFragment(row.id);
          message.success('已发布');
          await load();
        } catch (error: any) {
          message.error(error?.message || '发布失败');
        }
      },
    });
  };

  const archive = (row: PromptFragmentItem) => {
    if (row.locked) {
      message.warning('锁定片段不可归档');
      return;
    }
    Modal.confirm({
      title: `归档片段 ${row.key}？`,
      onOk: async () => {
        try {
          await promptOpsService.archiveFragment(row.id);
          message.success('已归档');
          await load();
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
            placeholder="类型"
            style={{ width: 140 }}
            options={KIND_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
            value={filters.kind}
            onChange={(kind) => setFilters((prev) => ({ ...prev, kind }))}
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
            placeholder="搜索 key / 标题"
            style={{ width: 220 }}
            onSearch={(keyword) => setFilters((prev) => ({ ...prev, keyword: keyword || undefined }))}
          />
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => void load()}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建片段
          </Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        dataSource={items}
        pagination={{ pageSize: 12 }}
        columns={[
          { title: 'Key', dataIndex: 'key', width: 260, ellipsis: true },
          { title: '标题', dataIndex: 'title', ellipsis: true },
          {
            title: '类型',
            dataIndex: 'kind',
            width: 110,
            render: (kind: string) => KIND_LABEL[kind] || kind,
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
            title: '锁定',
            dataIndex: 'locked',
            width: 70,
            render: (locked: boolean) => (locked ? '是' : '—'),
          },
          {
            title: '操作',
            width: 220,
            render: (_: unknown, row: PromptFragmentItem) => (
              <Space>
                <Button type="link" size="small" onClick={() => openEdit(row)}>
                  编辑
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

      <FragmentModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          void load();
        }}
      />
    </div>
  );
};
