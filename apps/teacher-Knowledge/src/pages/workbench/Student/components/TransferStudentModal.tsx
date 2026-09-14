import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { studentsService, organizationsService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { loadPersistedUser } from '@/utils/currentUser';
import type { Student } from '../types';

interface TransferStudentModalProps {
  open: boolean;
  student: Student | null;
  onClose: () => void;
  onSuccess: () => void;
}

const TransferStudentModal: React.FC<TransferStudentModalProps> = ({
  open,
  student,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (!open) return;
    const user = loadPersistedUser();
    organizationsService
      .getClasses({ school_id: user?.schoolId, grade_id: user?.gradeId })
      .then((response) => {
        const payload = extractPayload<any>(response);
        const items = Array.isArray(payload)
          ? payload
          : payload?.items || payload?.data || [];
        setClasses(
          (items || []).map((item: any) => ({
            id: String(item.id),
            name: item.name || item.class_name || item.title,
          })),
        );
      })
      .catch(() => setClasses([]));
  }, [open]);

  const handleOk = async () => {
    if (!student) return;
    const values = await form.validateFields();
    setLoading(true);
    try {
      await studentsService.transfer(student.id, values.target_class_id, values.reason);
      message.success('换班成功');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error?.message || '换班失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`换班 · ${student?.name || ''}`}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item label="当前班级">
          <Input disabled value={student?.currentClass} />
        </Form.Item>
        <Form.Item
          name="target_class_id"
          label="目标班级"
          rules={[{ required: true, message: '请选择目标班级' }]}
        >
          <Select
            options={classes
              .filter((item) => item.id !== student?.classId)
              .map((item) => ({ value: item.id, label: item.name }))}
            placeholder="请选择班级"
          />
        </Form.Item>
        <Form.Item name="reason" label="换班原因" rules={[{ required: true, message: '请填写原因' }]}>
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TransferStudentModal;
