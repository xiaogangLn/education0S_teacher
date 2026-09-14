import { Button, Form, InputNumber, Modal, Select } from 'antd';
import { useEffect } from 'react';
import type { CommercialPlanCode } from '@api/index';

interface GrantModalProps {
  open: boolean;
  schoolName: string;
  loading: boolean;
  initialPlanCode?: CommercialPlanCode | string;
  periodDaysByCode?: Partial<Record<CommercialPlanCode, number>>;
  onCancel: () => void;
  onSubmit: (values: { plan_code: CommercialPlanCode; period_days?: number }) => Promise<void>;
}

export function GrantModal({
  open,
  schoolName,
  loading,
  initialPlanCode,
  periodDaysByCode,
  onCancel,
  onSubmit,
}: GrantModalProps) {
  const [form] = Form.useForm<{ plan_code: CommercialPlanCode; period_days?: number }>();

  useEffect(() => {
    if (!open) return;
    const code: CommercialPlanCode =
      initialPlanCode === 'turbo' || initialPlanCode === 'pro' || initialPlanCode === 'basic'
        ? initialPlanCode
        : 'pro';
    form.setFieldsValue({
      plan_code: code,
      period_days: periodDaysByCode?.[code] || 30,
    });
  }, [open, form, initialPlanCode, periodDaysByCode]);

  return (
    <Modal
      title={`开通 / 续期 · ${schoolName}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={{ plan_code: 'pro', period_days: 30 }}
      >
        <Form.Item name="plan_code" label="套餐" rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'basic', label: '基础版（月订，含可配置学生体验）' },
              { value: 'pro', label: 'Pro' },
              { value: 'turbo', label: 'Turbo' },
            ]}
            onChange={(code: CommercialPlanCode) => {
              form.setFieldValue('period_days', periodDaysByCode?.[code] || 30);
            }}
          />
        </Form.Item>
        <Form.Item name="period_days" label="订阅天数" rules={[{ required: true, message: '请填写天数' }]}>
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            确认开通
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
