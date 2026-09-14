// pages/Classes/ClassModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Row, Col, InputNumber } from 'antd';

interface School {
  id: string;
  name: string;
  code: string;
}

interface Grade {
  id: string;
  school_id: string;
  name: string;
}

interface ClassModalProps {
  visible: boolean;
  onClose: () => void;
  editingClass?: any;
  schools: School[];
  grades: Grade[];
  onSubmit: (values: any) => Promise<void>;
}

export const ClassModal: React.FC<ClassModalProps> = ({
  visible,
  onClose,
  editingClass,
  schools,
  grades,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<string | undefined>();

  useEffect(() => {
    if (editingClass) {
      form.setFieldsValue({
        ...editingClass,
        school_id: editingClass.school_id,
        grade_id: editingClass.grade_id,
      });
      setSelectedSchool(editingClass.school_id);
    } else {
      form.resetFields();
      setSelectedSchool(undefined);
    }
  }, [editingClass, form, visible]);

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

  const schoolGrades = grades.filter((g) =>
    selectedSchool ? g.school_id === selectedSchool : false
  );

  // 学年选项
  const academicYearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return {
      label: `${year}-${year + 1}`,
      value: `${year}-${year + 1}`,
    };
  });

  return (
    <Modal
      title={editingClass ? '编辑班级' : '新增班级'}
      open={visible}
      onCancel={onClose}
      width={580}
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
          {editingClass ? '保存' : '创建'}
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
            onChange={(value) => {
              setSelectedSchool(value);
              form.setFieldsValue({ grade_id: undefined });
            }}
          >
            {schools.map((school) => (
              <Select.Option key={school.id} value={school.id} label={school.name}>
                {school.name} ({school.code})
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* 关联年级 */}
        <Form.Item
          name="grade_id"
          label="所属年级"
          rules={[{ required: true, message: '请选择所属年级' }]}
        >
          <Select
            placeholder={selectedSchool ? '请选择年级' : '请先选择学校'}
            disabled={!selectedSchool}
            showSearch
            optionFilterProp="label"
          >
            {schoolGrades.map((grade) => (
              <Select.Option key={grade.id} value={grade.id} label={grade.name}>
                {grade.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {/* 班级名称 */}
        <Form.Item
          name="name"
          label="班级名称"
          rules={[{ required: true, message: '请输入班级名称' }]}
        >
          <Input placeholder="例如：七年级1班" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="academic_year"
              label="学年"
              rules={[{ required: true, message: '请选择学年' }]}
            >
              <Select placeholder="请选择学年" options={academicYearOptions} />
            </Form.Item>
          </Col>
          <Col span={12}>
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
          </Col>
        </Row>

        {/* 状态 */}
        <Form.Item name="status" label="状态">
          <Select>
            <Select.Option value="active">在读</Select.Option>
            <Select.Option value="inactive">已停用</Select.Option>
            <Select.Option value="graduated">已毕业</Select.Option>
          </Select>
        </Form.Item>

        {/* 提示信息 */}
        {selectedSchool && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-600">
            💡 班级将关联到{' '}
            <strong>{schools.find((s) => s.id === selectedSchool)?.name}</strong>
          </div>
        )}
      </Form>
    </Modal>
  );
};