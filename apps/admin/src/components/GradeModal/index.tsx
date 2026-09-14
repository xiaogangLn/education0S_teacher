// pages/Grades/GradeModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Select, Button, InputNumber, AutoComplete } from 'antd';


interface School {
  id: string;
  name: string;
  code: string;
}

interface GradeModalProps {
  visible: boolean;
  onClose: () => void;
  editingGrade?: any;
  schools: School[];
  onSubmit: (values: any) => Promise<void>;
}

export const GradeModal: React.FC<GradeModalProps> = ({
  visible,
  onClose,
  editingGrade,
  schools,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<string | undefined>();

  useEffect(() => {
    if (editingGrade) {
      form.setFieldsValue({
        ...editingGrade,
        school_id: editingGrade.school_id,
      });
      setSelectedSchool(editingGrade.school_id);
    } else {
      form.resetFields();
      setSelectedSchool(undefined);
    }
  }, [editingGrade, form, visible]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onSubmit(values);
    } catch (error) {
      // 表单验证失败
    } finally {
      setLoading(false);
    }
  };

  // 年级选项
  const gradeOptions = [
    { label: '七年级', value: '七年级' },
    { label: '八年级', value: '八年级' },
    { label: '九年级', value: '九年级' },
    { label: '高一', value: '高一' },
    { label: '高二', value: '高二' },
    { label: '高三', value: '高三' },
  ];

  return (
    <Modal
      title={editingGrade ? '编辑年级' : '新增年级'}
      open={visible}
      onCancel={onClose}
      width={560}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {editingGrade ? '保存' : '创建'}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ status: 'active', display_order: 1 }}>
        {/* 关联学校 */}
        <Form.Item
          name="school_id"
          label="所属学校"
          rules={[{ required: true, message: '请选择所属学校' }]}
        >
          <Select
            placeholder="请选择学校"
            showSearch
            optionFilterProp="label"
            onChange={(value) => setSelectedSchool(value)}
          >
            {schools.map((school) => (
              <Select.Option key={school.id} value={school.id} label={school.name}>
                {school.name} ({school.code})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* 年级名称 */}
        <Form.Item
          name="name"
          label="年级名称"
          rules={[{ required: true, message: '请选择或输入年级名称' }]}
        >
          <AutoComplete
            placeholder="请选择或输入年级"
            options={gradeOptions}
            filterOption={(input, option) =>
              String(option?.label ?? '').includes(input)
            }
          />
        </Form.Item>

        {/* 排序 */}
        <Form.Item
          name="display_order"
          label="显示顺序"
          rules={[{ required: true, message: '请输入显示顺序' }]}
        >
          <InputNumber
            min={1}
            max={99}
            className="w-full"
            placeholder="数字越小越靠前"
          />
        </Form.Item>

        {/* 状态 */}
        <Form.Item name="status" label="状态">
          <Select>
            <Select.Option value="active">已激活</Select.Option>
            <Select.Option value="inactive">已停用</Select.Option>
          </Select>
        </Form.Item>

        {/* 提示信息 */}
        {selectedSchool && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-600">
            💡 年级将关联到 <strong>{schools.find((s) => s.id === selectedSchool)?.name}</strong>
          </div>
        )}
      </Form>
    </Modal>
  );
};