import React, { useEffect } from 'react';
import { Form, Input, Modal } from 'antd';

interface RejectReasonModalProps {
  open: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
}

export const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  open,
  loading = false,
  onCancel,
  onConfirm,
}) => {
  const [form] = Form.useForm<{ reason: string }>();

  useEffect(() => {
    if (open) form.resetFields();
  }, [open, form]);

  const handleOk = async () => {
    const values = await form.validateFields();
    await onConfirm(values.reason.trim());
  };

  return (
    <Modal
      title="驳回审核"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      okText="确认驳回"
      cancelText="取消"
      okButtonProps={{ danger: true }}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="reason"
          label="驳回原因"
          rules={[{ required: true, whitespace: true, message: '请输入驳回原因' }]}
        >
          <Input.TextArea rows={4} maxLength={200} showCount placeholder="请说明需要修改的内容，便于教师调整后重新提交" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default RejectReasonModal;
