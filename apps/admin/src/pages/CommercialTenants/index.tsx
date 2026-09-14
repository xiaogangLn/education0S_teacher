import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Col, Input, Row, Select, Space, Statistic, Table, Tag, message } from 'antd';
import { ReloadOutlined, SearchOutlined, CrownOutlined } from '@ant-design/icons';
import { commercialService, PLAN_LABELS, type CommercialPlanCode, type CommercialPlanItem, type CommercialTenantItem } from '@api/index';
import { extractPayload, formatDate } from '@/utils/api';
import { GrantModal } from './components/GrantModal';
import { QuotaAdjustModal, type AdjustQuotasValues } from './components/QuotaAdjustModal';

const SUB_STATUS: Record<string, string> = {
  active: '有效',
  past_due: '待续费',
  canceled: '已取消',
};

function remainingLabel(iso: string | null | undefined) {
  if (!iso) return '-';
  const end = new Date(iso).getTime();
  const days = Math.ceil((end - Date.now()) / (24 * 60 * 60 * 1000));
  if (Number.isNaN(days)) return formatDate(iso);
  if (days < 0) return '已过期';
  return `剩余 ${days} 天`;
}

function quotaPair(quota?: { used: number; limit: number | null } | null) {
  if (!quota) return '0 / 不限';
  if (quota.limit == null) return `${quota.used ?? 0} / 不限`;
  return `${quota.used}/${quota.limit}`;
}

export const CommercialTenantsPage = () => {
  const [items, setItems] = useState<CommercialTenantItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [planCode, setPlanCode] = useState<string | undefined>();
  const [grantTarget, setGrantTarget] = useState<CommercialTenantItem | null>(null);
  const [quotaTarget, setQuotaTarget] = useState<CommercialTenantItem | null>(null);
  const [granting, setGranting] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [periodDaysByCode, setPeriodDaysByCode] = useState<Partial<Record<CommercialPlanCode, number>>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await commercialService.getTenants({
        keyword: appliedKeyword || undefined,
        plan_code: planCode,
      });
      const payload = extractPayload<{ items: CommercialTenantItem[] }>(response);
      setItems(payload?.items || []);
    } catch (error: any) {
      setItems([]);
      message.error(error?.message || '加载商业用户失败');
    } finally {
      setLoading(false);
    }
  }, [appliedKeyword, planCode]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    commercialService.getTenants().then((response) => {
      const payload = extractPayload<{ total?: number; items?: CommercialTenantItem[] }>(response);
      setTotalCount(payload?.total ?? payload?.items?.length ?? 0);
    }).catch(() => undefined);
    commercialService.getPlans().then((response) => {
      const payload = extractPayload<{ items: CommercialPlanItem[] }>(response);
      const map: Partial<Record<CommercialPlanCode, number>> = {};
      (payload?.items || []).forEach((plan) => {
        map[plan.code] = plan.period_days;
      });
      setPeriodDaysByCode(map);
    }).catch(() => undefined);
  }, []);

  const handleGrant = async (values: { plan_code: 'basic' | 'pro' | 'turbo'; period_days?: number }) => {
    if (!grantTarget) return;
    setGranting(true);
    try {
      await commercialService.grantPlan(grantTarget.school_id, values);
      message.success('已更新套餐');
      setGrantTarget(null);
      await loadData();
    } catch (error: any) {
      message.error(error?.message || '开通失败');
    } finally {
      setGranting(false);
    }
  };

  const handleAdjustQuotas = async (values: AdjustQuotasValues) => {
    if (!quotaTarget) return;
    setAdjusting(true);
    try {
      const payload: AdjustQuotasValues = {};
      (Object.keys(values) as Array<keyof AdjustQuotasValues>).forEach((key) => {
        const value = values[key];
        if (typeof value === 'number' && Number.isFinite(value)) {
          payload[key] = value;
        }
      });
      await commercialService.adjustQuotas(quotaTarget.school_id, payload);
      message.success('已更新能力剩余次数');
      setQuotaTarget(null);
      await loadData();
    } catch (error: any) {
      message.error(error?.message || '调整失败');
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="p-4">
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="商业空间" value={totalCount} prefix={<CrownOutlined />} />
          </Card>
        </Col>
      </Row>
      <Card className="mb-4">
        <Space wrap>
          <Input
            placeholder="搜索空间名 / 老师姓名 / 手机号"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => setAppliedKeyword(keyword.trim())}
            className="w-64"
            allowClear
          />
          <Select
            allowClear
            placeholder="套餐"
            className="w-36"
            value={planCode}
            onChange={setPlanCode}
            options={[
              { value: 'basic', label: '基础版' },
              { value: 'pro', label: 'Pro' },
              { value: 'turbo', label: 'Turbo' },
            ]}
          />
          <Button type="primary" onClick={() => setAppliedKeyword(keyword.trim())}>
            搜索
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setKeyword('');
              setAppliedKeyword('');
              setPlanCode(undefined);
            }}
          >
            重置
          </Button>
        </Space>
      </Card>
      <Card>
        <Table
          rowKey="school_id"
          loading={loading}
          dataSource={items}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 个商业用户` }}
          columns={[
            {
              title: '老师',
              key: 'owner',
              render: (_: unknown, record: CommercialTenantItem) => (
                <div>
                  <div className="font-medium">{record.owner?.name || '-'}</div>
                  <div className="text-xs text-gray-400">{record.owner?.phone || ''}</div>
                </div>
              ),
            },
            { title: '空间', dataIndex: 'school_name' },
            {
              title: '套餐',
              dataIndex: 'plan_code',
              render: (code: string) => <Tag color={code === 'turbo' ? 'gold' : code === 'pro' ? 'purple' : 'blue'}>{PLAN_LABELS[code] || code}</Tag>,
            },
            {
              title: '有效期',
              key: 'expire',
              render: (_: unknown, record: CommercialTenantItem) => remainingLabel(record.plan_expires_at || record.current_period_end),
            },
            {
              title: '学生 / 教案 / 课件 / 试卷 / 批改',
              key: 'quota',
              render: (_: unknown, record: CommercialTenantItem) => {
                const q = record.quotas;
                return `${quotaPair(q?.students)} 人 · 教案 ${quotaPair(q?.lesson_plan)} · 课件 ${quotaPair(q?.courseware)} · 试卷 ${quotaPair(q?.exam)} · 批改 ${quotaPair(q?.ai_grading)}`;
              },
            },
            {
              title: '状态',
              dataIndex: 'subscription_status',
              render: (status: string) => SUB_STATUS[status] || status || '-',
            },
            {
              title: '操作',
              key: 'action',
              render: (_: unknown, record: CommercialTenantItem) => (
                <Space size={0}>
                  <Button type="link" onClick={() => setQuotaTarget(record)}>
                    调整次数
                  </Button>
                  <Button type="link" onClick={() => setGrantTarget(record)}>
                    开通 / 续期
                  </Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>
      <GrantModal
        open={!!grantTarget}
        schoolName={grantTarget?.school_name || ''}
        loading={granting}
        initialPlanCode={grantTarget?.plan_code}
        periodDaysByCode={periodDaysByCode}
        onCancel={() => setGrantTarget(null)}
        onSubmit={handleGrant}
      />
      <QuotaAdjustModal
        open={!!quotaTarget}
        tenant={quotaTarget}
        loading={adjusting}
        onCancel={() => setQuotaTarget(null)}
        onSubmit={handleAdjustQuotas}
      />
    </div>
  );
};
