import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  message,
} from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { organizationsService, type AiModelCatalogAdminItem } from '@api/index';
import { extractPayload } from '@/utils/api';

type FormValues = {
  code: string;
  kind: 'generation' | 'grading';
  label: string;
  base_url: string;
  api_key?: string;
  thinking: boolean;
  note?: string;
  enabled: boolean;
  sort_order: number;
};

const KIND_LABEL: Record<string, string> = {
  generation: '生成',
  grading: '批改',
};

export const AiModelsPage = () => {
  const [items, setItems] = useState<AiModelCatalogAdminItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [kindFilter, setKindFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AiModelCatalogAdminItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<FormValues>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await organizationsService.listAiModelCatalog({
        kind: kindFilter,
        include_disabled: true,
      });
      const payload = extractPayload<{ items: AiModelCatalogAdminItem[]; total: number }>(res);
      setItems(payload?.items || []);
    } catch (error: any) {
      message.error(error?.message || '加载模型目录失败');
    } finally {
      setLoading(false);
    }
  }, [kindFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue({
      code: '',
      kind: 'generation',
      label: '',
      base_url: '',
      api_key: '',
      thinking: true,
      note: '',
      enabled: true,
      sort_order: items.length + 1,
    });
    setModalOpen(true);
  };

  const openEdit = (row: AiModelCatalogAdminItem) => {
    setEditing(row);
    form.setFieldsValue({
      code: row.code,
      kind: row.kind,
      label: row.label,
      base_url: row.base_url || '',
      api_key: '',
      thinking: row.thinking,
      note: row.note || '',
      enabled: row.enabled,
      sort_order: row.sort_order,
    });
    setModalOpen(true);
  };

  const persist = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = {
        ...values,
        base_url: values.base_url.trim(),
        // 编辑时留空不改密钥；新增时空则不写入
        api_key: values.api_key?.trim() || undefined,
      };
      if (editing) {
        await organizationsService.updateAiModelCatalog(editing.id, payload);
        message.success('已更新');
      } else {
        await organizationsService.createAiModelCatalog(payload);
        message.success('已新增');
      }
      setModalOpen(false);
      await load();
    } catch (error: any) {
      message.error(error?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (row: AiModelCatalogAdminItem, enabled: boolean) => {
    try {
      await organizationsService.updateAiModelCatalog(row.id, { enabled });
      message.success(enabled ? '已启用' : '已停用');
      await load();
    } catch (error: any) {
      message.error(error?.message || '更新失败');
    }
  };

  const remove = (row: AiModelCatalogAdminItem) => {
    Modal.confirm({
      title: `删除模型 ${row.code}？`,
      content: '已引用该 code 的套餐/学校不会级联删除，但下拉将不再出现；未重新配置前，教师端调用会报错。',
      okText: '确认删除',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          await organizationsService.deleteAiModelCatalog(row.id);
          message.success('已删除');
          await load();
        } catch (error: any) {
          message.error(error?.message || '删除失败');
        }
      },
    });
  };

  const columns = useMemo(
    () => [
      {
        title: '类型',
        dataIndex: 'kind',
        width: 90,
        render: (kind: string) => (
          <Tag color={kind === 'generation' ? 'blue' : 'purple'}>{KIND_LABEL[kind] || kind}</Tag>
        ),
      },
      { title: 'Code', dataIndex: 'code', width: 160 },
      { title: '显示名', dataIndex: 'label', width: 160 },
      {
        title: '访问地址',
        dataIndex: 'base_url',
        ellipsis: true,
        render: (v?: string) => v || <span className="text-gray-400">未配置</span>,
      },
      {
        title: '识别',
        dataIndex: 'provider',
        width: 110,
        render: (v: string) => v || '—',
      },
      {
        title: '密钥',
        dataIndex: 'has_api_key',
        width: 80,
        render: (v: boolean) => (v ? <Tag color="green">已配</Tag> : <Tag>平台</Tag>),
      },
      {
        title: '思考',
        dataIndex: 'thinking',
        width: 70,
        render: (v: boolean) => (v ? '是' : '否'),
      },
      {
        title: '启用',
        dataIndex: 'enabled',
        width: 80,
        render: (v: boolean, row: AiModelCatalogAdminItem) => (
          <Switch checked={v} onChange={(checked) => void toggleEnabled(row, checked)} />
        ),
      },
      { title: '排序', dataIndex: 'sort_order', width: 70 },
      {
        title: '操作',
        width: 140,
        render: (_: unknown, row: AiModelCatalogAdminItem) => (
          <Space>
            <Button type="link" onClick={() => openEdit(row)}>
              编辑
            </Button>
            <Button type="link" danger onClick={() => remove(row)}>
              删除
            </Button>
          </Space>
        ),
      },
    ],
    [items],
  );

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="m-0 text-xl font-semibold">模型目录</h1>
          <p className="mb-0 mt-1 text-sm text-gray-500">
            维护生成/批改可选模型。访问地址必填；Provider 由地址自动识别。套餐/学校下拉只选 code。
          </p>
        </div>
        <Space>
          <Select
            allowClear
            placeholder="按类型筛选"
            style={{ width: 140 }}
            value={kindFilter}
            onChange={(v) => setKindFilter(v)}
            options={[
              { value: 'generation', label: '生成' },
              { value: 'grading', label: '批改' },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={() => void load()}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新增模型
          </Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns as any}
        dataSource={items}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 1100 }}
      />

      <Modal
        title={editing ? '编辑模型' : '新增模型'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => void persist()}
        confirmLoading={saving}
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-2">
          <Form.Item name="kind" label="类型" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'generation', label: '生成（教案/课件/试卷）' },
                { value: 'grading', label: '批改（识别/阅卷）' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="code"
            label="模型 Code"
            rules={[{ required: true, message: '请输入模型 code' }]}
            extra="写入套餐/学校的标识，如 qwen3.7-plus"
          >
            <Input placeholder="qwen3.7-plus" />
          </Form.Item>
          <Form.Item name="label" label="显示名称" rules={[{ required: true }]}>
            <Input placeholder="千问 3.7 Plus（思考）" />
          </Form.Item>
          <Form.Item
            name="base_url"
            label="访问地址"
            rules={[
              { required: true, message: '请填写访问地址' },
              { type: 'url', message: '请输入合法 URL，如 https://...' },
            ]}
            extra="OpenAI 兼容地址，如 https://dashscope.aliyuncs.com/compatible-mode/v1"
          >
            <Input placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1" />
          </Form.Item>
          <Form.Item
            name="api_key"
            label="API Key"
            extra={
              editing?.has_api_key
                ? '已配置密钥，留空则保持不变'
                : '留空则按访问地址识别的 Provider 使用平台 .env 密钥'
            }
          >
            <Input.Password placeholder="sk-..." autoComplete="new-password" />
          </Form.Item>
          <Form.Item name="thinking" label="支持思考" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="sort_order" label="排序">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="note" label="说明">
            <Input.TextArea rows={3} placeholder="可选说明，会出现在下拉备注中" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AiModelsPage;
