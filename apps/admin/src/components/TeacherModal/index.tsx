// pages/Teachers/TeacherModal.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Space,
  Tag,
  Switch,
} from 'antd';

interface School {
  id: string;
  name: string;
  code: string;
  type?: 'education' | 'commercial';
}

interface Grade {
  id: string;
  school_id: string;
  name: string;
}

interface ClassItem {
  id: string;
  school_id: string;
  grade_id: string;
  name: string;
}

interface TeacherModalProps {
  visible: boolean;
  onClose: () => void;
  editingTeacher?: any;
  schools: School[];
  grades: Grade[];
  classes: ClassItem[];
  subjectOptions: string[];
  onSubmit: (values: any) => Promise<void>;
}

const MAX_CLASS_COUNT = 3;

export const TeacherModal: React.FC<TeacherModalProps> = ({
  visible,
  onClose,
  editingTeacher,
  schools,
  grades,
  classes,
  subjectOptions,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const selectedSchool = Form.useWatch('school_id', form);
  const selectedGrade = Form.useWatch('grade_id', form);
  const selectedSchoolMeta = schools.find((s) => s.id === selectedSchool);
  const isEducationSchool = selectedSchoolMeta?.type !== 'commercial';

  useEffect(() => {
    if (editingTeacher) {
      form.setFieldsValue({
        ...editingTeacher,
        school_id: editingTeacher.school_id,
        grade_id: editingTeacher.grade_id || undefined,
        class_ids: editingTeacher.class_ids?.length
          ? editingTeacher.class_ids
          : editingTeacher.class_id
            ? [editingTeacher.class_id]
            : [],
        is_grade_admin: Boolean(editingTeacher.is_grade_admin),
      });
    } else {
      form.resetFields();
    }
  }, [editingTeacher, form, visible]);

  useEffect(() => {
    if (!isEducationSchool) {
      form.setFieldsValue({ grade_id: undefined, class_ids: [], is_grade_admin: false });
    }
  }, [isEducationSchool, form]);

  const schoolGrades = useMemo(
    () => grades.filter((g) => (selectedSchool ? g.school_id === selectedSchool : false)),
    [grades, selectedSchool],
  );

  const gradeClasses = useMemo(
    () =>
      classes.filter((c) => {
        if (!selectedSchool || !selectedGrade) return false;
        return c.school_id === selectedSchool && c.grade_id === selectedGrade;
      }),
    [classes, selectedSchool, selectedGrade],
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const classIds = isEducationSchool
        ? (Array.isArray(values.class_ids) ? values.class_ids : []).slice(0, MAX_CLASS_COUNT)
        : [];
      await onSubmit({
        ...values,
        is_grade_admin: isEducationSchool ? Boolean(values.is_grade_admin) : false,
        grade_id: isEducationSchool ? values.grade_id : undefined,
        class_ids: classIds,
        class_id: classIds[0],
      });
    } catch (error) {
      // 表单验证失败
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editingTeacher ? '编辑教师' : '新增教师'}
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
          {editingTeacher ? '保存' : '创建'}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: 'active', is_grade_admin: false, class_ids: [] }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="教师姓名"
              rules={[{ required: true, message: '请输入教师姓名' }]}
            >
              <Input placeholder="请输入教师姓名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="username"
              label="用户名"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' },
              ]}
            >
              <Input placeholder="请输入用户名（用于登录）" disabled={Boolean(editingTeacher)} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="手机号"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^[\d\-]+$/, message: '请输入正确的手机号' },
              ]}
            >
              <Input placeholder="请输入手机号" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="邮箱"
              rules={[{ type: 'email', message: '请输入正确的邮箱格式' }]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="school_id"
          label="所属学校"
          rules={[{ required: true, message: '请选择所属学校' }]}
        >
          <Select
            placeholder="请选择学校（必选）"
            showSearch
            optionFilterProp="label"
            onChange={() => {
              form.setFieldsValue({ grade_id: undefined, class_ids: [] });
            }}
          >
            {schools.map((school) => (
              <Select.Option key={school.id} value={school.id} label={school.name}>
                <Space>
                  <span className="font-medium">{school.name}</span>
                  <Tag color="default" className="text-xs">
                    {school.code}
                  </Tag>
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {isEducationSchool ? (
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="grade_id"
                  label="任教年级"
                  rules={[{ required: true, message: '请选择任教年级' }]}
                >
                  <Select
                    placeholder={selectedSchool ? '请选择任教年级' : '请先选择学校'}
                    disabled={!selectedSchool}
                    showSearch
                    optionFilterProp="label"
                    onChange={() => {
                      form.setFieldValue('class_ids', []);
                    }}
                    options={schoolGrades.map((grade) => ({
                      value: grade.id,
                      label: grade.name,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="is_grade_admin"
                  label="是否年级主任"
                  valuePropName="checked"
                  extra="开启后可进入教师端审核中心"
                >
                  <Switch checkedChildren="是" unCheckedChildren="否" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="class_ids"
              label="任教班级"
              rules={[
                { required: true, message: '请选择任教班级' },
                {
                  validator: async (_, value) => {
                    const list = Array.isArray(value) ? value : [];
                    if (list.length === 0) {
                      throw new Error('请至少选择一个班级');
                    }
                    if (list.length > MAX_CLASS_COUNT) {
                      throw new Error(`最多选择 ${MAX_CLASS_COUNT} 个班级`);
                    }
                  },
                },
              ]}
              extra={`同一年级下最多选择 ${MAX_CLASS_COUNT} 个班级`}
            >
              <Select
                mode="multiple"
                placeholder={selectedGrade ? '请选择任教班级（最多3个）' : '请先选择年级'}
                disabled={!selectedGrade}
                showSearch
                optionFilterProp="label"
                maxTagCount={MAX_CLASS_COUNT}
                options={gradeClasses.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                onChange={(value) => {
                  const next = (Array.isArray(value) ? value : []).slice(0, MAX_CLASS_COUNT);
                  form.setFieldValue('class_ids', next);
                }}
              />
            </Form.Item>
          </>
        ) : null}

        <Form.Item
          name="subjects"
          label="任教科目"
          rules={[{ required: true, message: '请选择至少一个任教科目' }]}
        >
          <Select
            mode="multiple"
            placeholder="请选择任教科目"
            optionFilterProp="label"
            maxTagCount={3}
          >
            {subjectOptions.map((subject) => (
              <Select.Option key={subject} value={subject} label={subject}>
                {subject}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {!editingTeacher && (
          <Form.Item
            name="password"
            label="初始密码"
            rules={[
              { required: true, message: '请设置初始密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password placeholder="请设置初始密码（至少6位）" />
          </Form.Item>
        )}

        <Form.Item name="status" label="状态">
          <Select>
            <Select.Option value="active">已启用</Select.Option>
            <Select.Option value="inactive">已停用</Select.Option>
          </Select>
        </Form.Item>

        {selectedSchool && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-600">
            💡 教师将关联到{' '}
            <strong>
              {schools.find((s) => s.id === selectedSchool)?.name}
            </strong>
          </div>
        )}
      </Form>
    </Modal>
  );
};
