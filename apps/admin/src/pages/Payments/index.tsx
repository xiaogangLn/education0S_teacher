import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd';
import { PayCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  paymentsService,
  type PaymentChannelConfigItem,
  type PaymentOrderItem,
} from '@api/index';
import { extractPayload, formatDate } from '@/utils/api';

const { TextArea } = Input;
const { Text } = Typography;

const CHANNEL_LABEL: Record<string, string> = {
  wechat: '微信支付',
  alipay: '支付宝',
  manual: '线下/对公（人工确认）',
};

const PAY_TYPE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  wechat: [
    { value: 'wechat_native', label: '扫码支付 Native' },
    { value: 'wechat_jsapi', label: 'JSAPI（公众号/小程序，预留）' },
  ],
  alipay: [{ value: 'alipay_wap', label: '手机网站支付（预留）' }],
  manual: [{ value: 'manual', label: '人工确认到账' }],
};

/** 各渠道可编辑的字符串参数；敏感项只写不读 */
const PARAM_FIELDS: Record<
  string,
  { key: string; label: string; sensitive?: boolean; multiline?: boolean; placeholder?: string; optional?: boolean }[]
> = {
  wechat: [
    { key: 'mch_id', label: '商户号 mch_id' },
    { key: 'app_id', label: 'AppId' },
    { key: 'api_v3_key', label: 'APIv3 密钥', sensitive: true },
    { key: 'serial_no', label: '商户证书序列号' },
    {
      key: 'private_key_pem',
      label: '商户私钥 PEM',
      sensitive: true,
      multiline: true,
      placeholder: '-----BEGIN PRIVATE KEY----- ...',
    },
    {
      key: 'wechatpay_public_key_pem',
      label: '微信平台公钥 PEM（可选，用于回调验签）',
      sensitive: true,
      multiline: true,
      optional: true,
    },
  ],
  alipay: [
    { key: 'app_id', label: 'AppId' },
    { key: 'alipay_private_key', label: '应用私钥', sensitive: true, multiline: true },
    { key: 'alipay_public_key', label: '支付宝公钥', sensitive: true, multiline: true },
  ],
  manual: [],
};

const ORDER_STATUS_LABEL: Record<string, { text: string; color: string }> = {
  pending: { text: '待处理', color: 'default' },
  paying: { text: '待支付', color: 'processing' },
  paid: { text: '已支付', color: 'warning' },
  fulfilled: { text: '已履约', color: 'success' },
  closed: { text: '已关闭', color: 'default' },
  refunded: { text: '已退款', color: 'error' },
};

type ChannelFormValues = {
  enabled: boolean;
  pay_types: string[];
  notify_url?: string;
  remark?: string;
  params: Record<string, string>;
};

function fenToYuan(fen: number) {
  return (Number(fen || 0) / 100).toFixed(2);
}

export const PaymentsPage = () => {
  const [tab, setTab] = useState('channels');
  const [channels, setChannels] = useState<PaymentChannelConfigItem[]>([]);
  const [orders, setOrders] = useState<PaymentOrderItem[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [editing, setEditing] = useState<PaymentChannelConfigItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [orderKeyword, setOrderKeyword] = useState('');
  const [orderStatus, setOrderStatus] = useState<string | undefined>();
  const [form] = Form.useForm<ChannelFormValues>();

  const loadChannels = useCallback(async () => {
    setLoadingChannels(true);
    try {
      const res = await paymentsService.listChannels();
      const payload = extractPayload<{ items: PaymentChannelConfigItem[] }>(res);
      setChannels(payload?.items || []);
    } catch (error: any) {
      message.error(error?.message || '加载支付渠道失败');
      setChannels([]);
    } finally {
      setLoadingChannels(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await paymentsService.listOrders({
        keyword: orderKeyword.trim() || undefined,
        status: orderStatus,
        limit: 100,
      });
      const payload = extractPayload<{ items: PaymentOrderItem[] }>(res);
      setOrders(payload?.items || []);
    } catch (error: any) {
      message.error(error?.message || '加载订单失败');
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, [orderKeyword, orderStatus]);

  useEffect(() => {
    void loadChannels();
  }, [loadChannels]);

  useEffect(() => {
    if (tab === 'orders') void loadOrders();
  }, [tab, loadOrders]);

  const enabledSummary = useMemo(() => {
    const enabled = channels.filter((c) => c.enabled);
    const types = enabled.flatMap((c) => c.pay_types || []);
    return { channelCount: enabled.length, types };
  }, [channels]);

  const openEdit = (row: PaymentChannelConfigItem) => {
    setEditing(row);
    const paramDefaults: Record<string, string> = {};
    (PARAM_FIELDS[row.code] || []).forEach((field) => {
      paramDefaults[field.key] = '';
    });
    form.setFieldsValue({
      enabled: row.enabled,
      pay_types: row.pay_types?.length ? [...row.pay_types] : [],
      notify_url: row.notify_url || '',
      remark: row.remark || '',
      params: paramDefaults,
    });
  };

  const persistChannel = async () => {
    if (!editing) return;
    const values = await form.validateFields();
    if (values.enabled && (!values.pay_types || values.pay_types.length === 0)) {
      message.error('启用渠道时至少勾选一种支付类型，否则租户下单会失败');
      return;
    }

    const paramsPatch: Record<string, string | null> = {};
    const fields = PARAM_FIELDS[editing.code] || [];
    for (const field of fields) {
      const raw = values.params?.[field.key];
      const trimmed = String(raw ?? '').trim();
      if (!trimmed) continue; // 留空 = 不改已有密钥
      paramsPatch[field.key] = trimmed;
    }

    // 启用微信/支付宝时，必须保证每个必填参数「已有或本次写入」，避免租户空表单下单报错
    if (values.enabled && fields.length > 0) {
      const missing = fields.filter((field) => {
        if (field.optional) return false;
        const hasNew = Boolean(String(paramsPatch[field.key] || '').trim());
        const hasOld = Boolean(editing.params_configured?.[field.key]);
        return !hasNew && !hasOld;
      });
      if (missing.length) {
        message.error(`启用前请填写：${missing.map((m) => m.label).join('、')}`);
        return;
      }
    }

    setSaving(true);
    try {
      await paymentsService.updateChannel(editing.code, {
        enabled: values.enabled,
        pay_types: values.pay_types,
        notify_url: values.notify_url?.trim() || null,
        remark: values.remark?.trim() || null,
        params: Object.keys(paramsPatch).length ? paramsPatch : undefined,
      });
      message.success('支付渠道已保存');
      setEditing(null);
      await loadChannels();
    } catch (error: any) {
      message.error(error?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const runOrderAction = async (
    action: 'confirm' | 'fulfill' | 'close',
    row: PaymentOrderItem,
  ) => {
    try {
      if (action === 'confirm') {
        await paymentsService.confirmOrder(row.id);
        message.success('已确认到账并履约');
      } else if (action === 'fulfill') {
        await paymentsService.fulfillOrder(row.id);
        message.success('已补履约');
      } else {
        await paymentsService.closeOrder(row.id, { reason: 'admin_closed' });
        message.success('订单已关闭');
      }
      await loadOrders();
    } catch (error: any) {
      message.error(error?.message || '操作失败');
    }
  };

  const channelColumns = [
    {
      title: '渠道',
      dataIndex: 'code',
      render: (code: string) => CHANNEL_LABEL[code] || code,
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      width: 100,
      render: (enabled: boolean) =>
        enabled ? <Tag color="success">已启用</Tag> : <Tag>未启用</Tag>,
    },
    {
      title: '支付类型',
      dataIndex: 'pay_types',
      render: (types: string[]) =>
        types?.length ? (
          <Space wrap size={[4, 4]}>
            {types.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">未配置</Text>
        ),
    },
    {
      title: '参数',
      key: 'params',
      render: (_: unknown, row: PaymentChannelConfigItem) => {
        const fields = PARAM_FIELDS[row.code] || [];
        if (!fields.length) return <Text type="secondary">无需密钥</Text>;
        const ok = fields.filter((f) => row.params_configured?.[f.key]).length;
        return (
          <Tag color={ok === fields.length ? 'success' : ok > 0 ? 'warning' : 'error'}>
            {ok}/{fields.length} 已配置
          </Tag>
        );
      },
    },
    {
      title: '回调 URL',
      dataIndex: 'notify_url',
      ellipsis: true,
      render: (v: string | null) => v || <Text type="secondary">用环境变量默认</Text>,
    },
    {
      title: '操作',
      width: 100,
      render: (_: unknown, row: PaymentChannelConfigItem) => (
        <Button type="link" onClick={() => openEdit(row)}>
          配置
        </Button>
      ),
    },
  ];

  const orderColumns = [
    {
      title: '单号',
      dataIndex: 'out_trade_no',
      width: 200,
      ellipsis: true,
    },
    {
      title: '套餐',
      dataIndex: 'plan_code',
      width: 80,
      render: (v: string | null) => v || '-',
    },
    {
      title: '金额',
      dataIndex: 'amount_fen',
      width: 100,
      render: (fen: number) => `¥${fenToYuan(fen)}`,
    },
    {
      title: '渠道',
      dataIndex: 'channel',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const meta = ORDER_STATUS_LABEL[status] || { text: status, color: 'default' };
        return <Tag color={meta.color}>{meta.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 170,
      render: (v: string) => formatDate(v),
    },
    {
      title: '操作',
      width: 220,
      render: (_: unknown, row: PaymentOrderItem) => (
        <Space size={0}>
          {(row.status === 'paying' || row.status === 'pending') && (
            <>
              <Button type="link" onClick={() => void runOrderAction('confirm', row)}>
                确认到账
              </Button>
              <Button type="link" danger onClick={() => void runOrderAction('close', row)}>
                关单
              </Button>
            </>
          )}
          {row.status === 'paid' && (
            <Button type="link" onClick={() => void runOrderAction('fulfill', row)}>
              补履约
            </Button>
          )}
          {row.status === 'fulfilled' && <Text type="secondary">已完成</Text>}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-lg font-medium flex items-center gap-2">
            <PayCircleOutlined />
            支付配置
          </div>
          <Text type="secondary">
            在此启用渠道并填写商户参数；未配置完整时租户侧无法下单，避免空表单报错。
          </Text>
        </div>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            void loadChannels();
            if (tab === 'orders') void loadOrders();
          }}
        >
          刷新
        </Button>
      </div>

      <Alert
        className="mb-4"
        type={enabledSummary.channelCount ? 'success' : 'warning'}
        showIcon
        message={
          enabledSummary.channelCount
            ? `已启用 ${enabledSummary.channelCount} 个渠道；可用支付类型：${
                enabledSummary.types.join('、') || '无'
              }`
            : '当前没有启用任何支付渠道。请先配置并启用至少一种（建议先开「线下/对公」做人工确认）。'
        }
      />

      <Card>
        <Tabs
          activeKey={tab}
          onChange={setTab}
          items={[
            {
              key: 'channels',
              label: '支付渠道',
              children: (
                <Table
                  rowKey="code"
                  loading={loadingChannels}
                  dataSource={channels}
                  columns={channelColumns}
                  pagination={false}
                />
              ),
            },
            {
              key: 'orders',
              label: '订单台',
              children: (
                <div>
                  <Space className="mb-3" wrap>
                    <Input.Search
                      allowClear
                      placeholder="单号 / 交易号"
                      style={{ width: 240 }}
                      onSearch={(v) => {
                        setOrderKeyword(v);
                      }}
                    />
                    <Select
                      allowClear
                      placeholder="状态"
                      style={{ width: 140 }}
                      value={orderStatus}
                      onChange={setOrderStatus}
                      options={Object.entries(ORDER_STATUS_LABEL).map(([value, meta]) => ({
                        value,
                        label: meta.text,
                      }))}
                    />
                    <Button onClick={() => void loadOrders()}>查询</Button>
                  </Space>
                  <Table
                    rowKey="id"
                    loading={loadingOrders}
                    dataSource={orders}
                    columns={orderColumns}
                    pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 单` }}
                    scroll={{ x: 960 }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title={editing ? `配置 · ${CHANNEL_LABEL[editing.code] || editing.code}` : '配置渠道'}
        open={Boolean(editing)}
        onCancel={() => setEditing(null)}
        onOk={() => void persistChannel()}
        confirmLoading={saving}
        width={640}
        destroyOnClose
        okText="保存"
      >
        {editing && (
          <Form form={form} layout="vertical" className="mt-2">
            <Form.Item
              name="enabled"
              label="启用渠道"
              valuePropName="checked"
              extra="关闭后租户下单不可选该渠道下的支付类型"
            >
              <Switch checkedChildren="开" unCheckedChildren="关" />
            </Form.Item>

            <Form.Item
              name="pay_types"
              label="支付类型"
              rules={[
                {
                  validator: async (_, value) => {
                    const enabled = form.getFieldValue('enabled');
                    if (enabled && (!value || value.length === 0)) {
                      throw new Error('启用时请至少选择一种支付类型');
                    }
                  },
                },
              ]}
            >
              <Checkbox.Group
                options={PAY_TYPE_OPTIONS[editing.code] || []}
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="notify_url"
              label="回调 URL"
              extra="可留空，使用服务端 PAYMENT_NOTIFY_BASE_URL；正式环境建议填公网 HTTPS 地址"
            >
              <Input placeholder="https://your-domain/api/v1/payments/notify/wechat" />
            </Form.Item>

            <Form.Item name="remark" label="备注">
              <Input placeholder="内部说明，可选" />
            </Form.Item>

            {(PARAM_FIELDS[editing.code] || []).length > 0 && (
              <>
                <Text strong className="block mb-2">
                  商户参数
                </Text>
                <Alert
                  className="mb-3"
                  type="info"
                  showIcon
                  message="密钥只写不读：已配置的敏感项留空表示保持不变；填写新值则覆盖。"
                />
                {(PARAM_FIELDS[editing.code] || []).map((field) => {
                  const configured = Boolean(editing.params_configured?.[field.key]);
                  return (
                    <Form.Item
                      key={field.key}
                      name={['params', field.key]}
                      label={
                        <Space>
                          {field.label}
                          {configured ? <Tag color="success">已配置</Tag> : <Tag>未配置</Tag>}
                        </Space>
                      }
                    >
                      {field.multiline ? (
                        <TextArea
                          rows={4}
                          placeholder={
                            configured
                              ? '已配置，留空不修改'
                              : field.placeholder || '请输入'
                          }
                        />
                      ) : (
                        <Input
                          placeholder={configured ? '已配置，留空不修改' : '请输入'}
                        />
                      )}
                    </Form.Item>
                  );
                })}
              </>
            )}
          </Form>
        )}
      </Modal>
    </div>
  );
};
