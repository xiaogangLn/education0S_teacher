import { Alert, Button, Form, InputNumber, Modal, Space } from 'antd';
import { useEffect } from 'react';
import type { CommercialTenantItem } from '@api/index';

type QuotaKey = 'students' | 'lesson_plan' | 'courseware' | 'exam' | 'ai_grading';

const QUOTA_FIELDS: Array<{ key: QuotaKey; formName: string; label: string }> = [
  { key: 'students', formName: 'students_remaining', label: '学生剩余名额' },
  { key: 'lesson_plan', formName: 'lesson_plan_remaining', label: '教案剩余次数' },
  { key: 'courseware', formName: 'courseware_remaining', label: '课件剩余次数' },
  { key: 'exam', formName: 'exam_remaining', label: '试卷剩余次数' },
  { key: 'ai_grading', formName: 'ai_grading_remaining', label: '批改剩余次数' },
];

export type AdjustQuotasValues = {
  students_remaining?: number;
  lesson_plan_remaining?: number;
  courseware_remaining?: number;
  exam_remaining?: number;
  ai_grading_remaining?: number;
};

interface QuotaAdjustModalProps {
  open: boolean;
  tenant: CommercialTenantItem | null;
  loading: boolean;
  onCancel: () => void;
  onSubmit: (values: AdjustQuotasValues) => Promise<void>;
}

function remainingOf(quota?: { used: number; limit: number | null } | null) {
  if (!quota || quota.limit == null) return null;
  return Math.max(0, quota.limit - (quota.used || 0));
}

export function QuotaAdjustModal({ open, tenant, loading, onCancel, onSubmit }: QuotaAdjustModalProps) {
  const [form] = Form.useForm<AdjustQuotasValues>();

  useEffect(() => {
    if (!open || !tenant) return;
    const q = tenant.quotas;
    form.setFieldsValue({
      students_remaining: remainingOf(q?.students) ?? undefined,
      lesson_plan_remaining: remainingOf(q?.lesson_plan) ?? undefined,
      courseware_remaining: remainingOf(q?.courseware) ?? undefined,
      exam_remaining: remainingOf(q?.exam) ?? undefined,
      ai_grading_remaining: remainingOf(q?.ai_grading) ?? undefined,
    });
  }, [open, tenant, form]);

  return (
    <Modal
      title={`调整能力次数 · ${tenant?.school_name || ''}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={560}
    >
      <Alert
        type="info"
        showIcon
        className="mb-4"
        message="在现有剩余次数上直接改大或改小；已用次数不变，仅影响本月可用额度。"
      />
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          {QUOTA_FIELDS.map(({ key, formName, label }) => {
            const quota = tenant?.quotas?.[key];
            const unlimited = !quota || quota.limit == null;
            return (
              <Form.Item
                key={formName}
                name={formName}
                label={label}
                extra={
                  unlimited
                    ? '当前套餐为不限次数'
                    : `已用 ${quota?.used ?? 0} / 额度 ${quota?.limit ?? 0}`
                }
              >
                <InputNumber
                  min={0}
                  disabled={unlimited}
                  style={{ width: '100%' }}
                  placeholder={unlimited ? '不限' : '剩余次数'}
                  addonAfter="次"
                />
              </Form.Item>
            );
          })}
        </div>
        <Space className="w-full justify-end">
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存
          </Button>
        </Space>
      </Form>
    </Modal>
  );
}
