import React, { useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { studentsService } from '@api/index';
import { loadPersistedUser } from '@/utils/currentUser';

interface AddStudentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    const values = await form.validateFields();
    const user = loadPersistedUser();
    setLoading(true);
    try {
      await studentsService.create({
        student_no: values.student_no,
        name: values.name,
        gender: values.gender,
        class_id: values.class_id || user?.classId,
        school_id: user?.schoolId,
        grade_id: user?.gradeId,
        parent_name: values.parent_name,
        parent_phone: values.parent_phone,
      });
      message.success('学生已添加');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error?.message || '添加学生失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="添加学生" open={open} onCancel={onClose} onOk={handleOk} confirmLoading={loading} destroyOnClose>
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="student_no" label="学号" rules={[{ required: true, message: '请输入学号' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="gender" label="性别" initialValue="male">
          <Select options={[{ value: 'male', label: '男' }, { value: 'female', label: '女' }]} />
        </Form.Item>
        <Form.Item name="parent_name" label="家长姓名">
          <Input />
        </Form.Item>
        <Form.Item name="parent_phone" label="家长电话">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddStudentModal;
