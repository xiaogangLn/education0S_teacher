// pages/Students/StudentModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Radio,
} from 'antd';

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

interface Class {
  id: string;
  school_id: string;
  grade_id: string;
  name: string;
}

interface StudentModalProps {
  visible: boolean;
  onClose: () => void;
  editingStudent?: any;
  schools: School[];
  grades: Grade[];
  classes: Class[];
  onSubmit: (values: any) => Promise<void>;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  visible,
  onClose,
  editingStudent,
  schools,
  grades,
  classes,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<string | undefined>();
  const [selectedGrade, setSelectedGrade] = useState<string | undefined>();

  useEffect(() => {
    if (editingStudent) {
      form.setFieldsValue({
        ...editingStudent,
        school_id: editingStudent.school_id,
        grade_id: editingStudent.grade_id,
        class_id: editingStudent.class_id,
      });
      setSelectedSchool(editingStudent.school_id);
      setSelectedGrade(editingStudent.grade_id);
    } else {
      form.resetFields();
      setSelectedSchool(undefined);
      setSelectedGrade(undefined);
    }
  }, [editingStudent, form, visible]);

  const schoolGrades = grades.filter((g) =>
    selectedSchool ? g.school_id === selectedSchool : false
  );
  const gradeClasses = classes.filter((c) => {
    const matchSchool = selectedSchool ? c.school_id === selectedSchool : false;
    const matchGrade = selectedGrade ? c.grade_id === selectedGrade : false;
    return matchSchool && matchGrade;
  });

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

  return (
    <Modal
      title={editingStudent ? '编辑学生' : '新增学生'}
      open={visible}
      onCancel={onClose}
      width={640}
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
          {editingStudent ? '保存' : '创建'}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ gender: 'male', status: 'active' }}
      >
        {/* 基本信息 */}
        <div className="mb-3 font-medium text-gray-700">📋 基本信息</div>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="姓名"
              rules={[{ required: true, message: '请输入学生姓名' }]}
            >
              <Input placeholder="请输入学生姓名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="student_no"
              label="学号"
              rules={[{ required: true, message: '请输入学号' }]}
            >
              <Input placeholder="请输入学号" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="gender"
              label="性别"
              rules={[{ required: true, message: '请选择性别' }]}
            >
              <Radio.Group>
                <Radio value="male">男</Radio>
                <Radio value="female">女</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="enrollment_year"
              label="哪一届"
              rules={[{ required: true, message: '请选择哪一届' }]}
            >
              <Select placeholder="请选择哪一届">
                {Array.from({ length: 6 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <Select.Option key={year} value={String(year)}>
                      {year}届
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* 学校/年级/班级 关联 */}
        <div className="mb-3 mt-2 font-medium text-gray-700">🏫 学校/年级/班级</div>
        <Row gutter={16}>
          <Col span={24}>
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
                  setSelectedGrade(undefined);
                  form.setFieldsValue({ grade_id: undefined, class_id: undefined });
                }}
              >
                {schools.map((school) => (
                  <Select.Option key={school.id} value={school.id} label={school.name}>
                    {school.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
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
                onChange={(value) => {
                  setSelectedGrade(value);
                  form.setFieldsValue({ class_id: undefined });
                }}
              >
                {schoolGrades.map((grade) => (
                  <Select.Option key={grade.id} value={grade.id} label={grade.name}>
                    {grade.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="class_id"
              label="所属班级"
              rules={[{ required: true, message: '请选择所属班级' }]}
            >
              <Select
                placeholder={selectedGrade ? '请选择班级' : '请先选择年级'}
                disabled={!selectedGrade}
                showSearch
                optionFilterProp="label"
              >
                {gradeClasses.map((cls) => (
                  <Select.Option key={cls.id} value={cls.id} label={cls.name}>
                    {cls.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* 家长信息 */}
        <div className="mb-3 mt-2 font-medium text-gray-700">👨‍👩‍👦 家长信息</div>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="parent_name"
              label="家长姓名"
              rules={[{ required: true, message: '请输入家长姓名' }]}
            >
              <Input placeholder="请输入家长姓名" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="parent_phone"
              label="家长电话"
              rules={[
                { required: true, message: '请输入家长电话' },
                { pattern: /^[\d\-]+$/, message: '请输入正确的电话号码' },
              ]}
            >
              <Input placeholder="请输入家长电话" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="parent_email" label="家长邮箱">
              <Input placeholder="请输入家长邮箱" />
            </Form.Item>
          </Col>
        </Row>

        {/* 状态 */}
        <Form.Item name="status" label="状态">
          <Select>
            <Select.Option value="active">在读</Select.Option>
            <Select.Option value="transferred">已转班</Select.Option>
            <Select.Option value="graduated">已毕业</Select.Option>
            <Select.Option value="withdrawn">已退学</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};