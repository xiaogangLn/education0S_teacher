import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  message,
  Select,
  Avatar,
  Tooltip,
  Switch,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  KeyOutlined,
  UploadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { usersService } from '@api/index';
import { TeacherModal } from '@/components/TeacherModal';
import { useOrgOptions } from '@/hooks/useOrgOptions';
import { downloadAuthedFile, extractPayload, formatDate } from '@/utils/api';

interface Teacher {
  id: string;
  user_id: string;
  username: string;
  name: string;
  phone: string;
  email: string;
  school_id: string;
  school_name: string;
  grade_id: string;
  grade_name: string;
  class_id: string;
  class_ids: string[];
  class_names: string[];
  role: string;
  is_grade_admin: boolean;
  tenant_type: 'education' | 'commercial';
  plan_code: string;
  source: string;
  subjects: string[];
  status: 'active' | 'inactive';
  created_at: string;
}

const TEACHER_ROLES = new Set(['teacher', 'grade_admin', 'is_grade_admin']);
const MAX_CLASS_COUNT = 3;

function isGradeAdminUser(item: any): boolean {
  if (item?.is_grade_admin === true || item?.isGradeAdmin === true) return true;
  const role = String(item?.role || '');
  if (role === 'grade_admin' || role === 'is_grade_admin') return true;
  const roles = Array.isArray(item?.roles)
    ? item.roles.map((r: unknown) => String(r || '').trim()).filter(Boolean)
    : String(item?.roles || '')
        .split(/[,，、]+/)
        .flatMap((part) => part.split('/'))
        .map((r) => r.trim())
        .filter(Boolean);
  return roles.includes('grade_admin') || roles.includes('is_grade_admin');
}

function normalizeClassIds(item: any): string[] {
  const fromArray = item.class_ids || item.classIds;
  if (Array.isArray(fromArray) && fromArray.length) {
    return fromArray.map((id: any) => String(id)).filter(Boolean).slice(0, MAX_CLASS_COUNT);
  }
  const single = item.class_id || item.classId;
  return single ? [String(single)] : [];
}

const subjectOptions = [
  '语文',
  '数学',
  '英语',
  '物理',
  '化学',
  '生物',
  '历史',
  '地理',
  '政治',
  '音乐',
  '美术',
  '体育',
  '信息技术',
  '心理',
];

function mapTeacher(
  item: any,
  schoolName?: string,
  gradeName?: string,
  classNameMap?: Record<string, string>,
): Teacher {
  const role = String(item.role || 'teacher');
  const classIds = normalizeClassIds(item);
  const classNames = classIds
    .map((id) => classNameMap?.[id] || '')
    .filter(Boolean);
  if (!classNames.length && (item.class_name || item.className)) {
    classNames.push(String(item.class_name || item.className));
  }
  return {
    id: String(item.id),
    user_id: String(item.id),
    username: item.username || '',
    name: item.real_name || item.name || item.username || '',
    phone: item.phone || '',
    email: item.email || '',
    school_id: String(item.school_id || item.schoolId || ''),
    school_name: item.school_name || item.schoolName || schoolName || '',
    grade_id: String(item.grade_id || item.gradeId || ''),
    grade_name: item.grade_name || item.gradeName || gradeName || '',
    class_id: classIds[0] || '',
    class_ids: classIds,
    class_names: classNames,
    role,
    is_grade_admin: isGradeAdminUser(item),
    tenant_type: item.tenant_type === 'commercial' || item.tenantType === 'commercial' ? 'commercial' : 'education',
    plan_code: item.plan_code || item.planCode || 'exempt',
    source: item.source || 'imported',
    subjects: Array.isArray(item.subjects) ? item.subjects : (item.subject ? [item.subject] : []),
    status: item.is_active === false || item.status === 'inactive' ? 'inactive' : 'active',
    created_at: formatDate(item.created_at || item.createdAt),
  };
}

export const TeachersPage = () => {
  const { schools, grades, classes } = useOrgOptions();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [tenantType, setTenantType] = useState<'education' | 'commercial' | ''>('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  const schoolMap = useMemo(
    () => Object.fromEntries(schools.map((s) => [s.id, s.name])),
    [schools]
  );
  const gradeMap = useMemo(
    () => Object.fromEntries(grades.map((g) => [g.id, g.name])),
    [grades]
  );
  const classMap = useMemo(
    () => Object.fromEntries(classes.map((c) => [c.id, c.name])),
    [classes]
  );

  const loadTeacherRoleLists = useCallback(async (params: {
    page?: number;
    page_size?: number;
    keyword?: string;
    status?: 'active' | 'inactive';
    school_id?: string;
    tenant_type?: 'education' | 'commercial';
  }) => {
    const res = await usersService.getList({ ...params, role: 'teacher,grade_admin' });
    const payload = extractPayload<{ items?: any[]; total?: number }>(res);
    const items = (payload?.items || []).filter((item) =>
      TEACHER_ROLES.has(String(item.role || 'teacher'))
      || (Array.isArray(item.roles) && item.roles.some((r: string) => TEACHER_ROLES.has(String(r))))
      || item.is_grade_admin,
    );
    return {
      items,
      total: payload?.total ?? items.length,
    };
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const base = { page: 1, page_size: 1, school_id: selectedSchool || undefined, tenant_type: tenantType || undefined };
      const [all, active, inactive] = await Promise.all([
        loadTeacherRoleLists(base),
        loadTeacherRoleLists({ ...base, status: 'active' }),
        loadTeacherRoleLists({ ...base, status: 'inactive' }),
      ]);
      setStats({
        total: all.total,
        active: active.total,
        inactive: inactive.total,
      });
    } catch {
      setStats({ total: 0, active: 0, inactive: 0 });
    }
  }, [selectedSchool, tenantType, loadTeacherRoleLists]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { items: merged, total } = await loadTeacherRoleLists({
        page: pagination.current,
        page_size: pagination.pageSize,
        keyword: appliedKeyword || undefined,
        school_id: selectedSchool || undefined,
        tenant_type: tenantType || undefined,
      });
      const items = merged.map((item) =>
        mapTeacher(
          item,
          schoolMap[String(item.school_id || item.schoolId)],
          gradeMap[String(item.grade_id || item.gradeId)],
          classMap,
        ),
      );
      setTeachers(items);
      setPagination((prev) => ({ ...prev, total }));
    } catch (error: any) {
      setTeachers([]);
      message.error(error?.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, appliedKeyword, selectedSchool, tenantType, schoolMap, gradeMap, classMap, loadTeacherRoleLists]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    setAppliedKeyword(searchKeyword.trim());
  };

  const handleReset = () => {
    setSearchKeyword('');
    setAppliedKeyword('');
    setSelectedSchool('');
    setTenantType('');
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleAdd = () => {
    setEditingTeacher(null);
    setModalVisible(true);
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadAuthedFile('/api/v1/users/import/template', '教师导入模板.xlsx');
    } catch (error: any) {
      message.error(error?.message || '模板下载失败');
    }
  };

  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const payload = extractPayload<{ success?: number; failed?: number; errors?: Array<{ row: number; reason: string }> }>(
        await usersService.import(formData),
      );
      const failed = payload?.failed || 0;
      message.success(`导入完成：成功 ${payload?.success || 0} 条${failed ? `，失败 ${failed} 条` : ''}`);
      if (failed && payload?.errors?.length) {
        message.warning(payload.errors.slice(0, 3).map((item) => `第${item.row}行：${item.reason}`).join('；'));
      }
      await loadData();
      await loadStats();
    } catch (error: any) {
      message.error(error?.message || '导入失败');
    }
    return false;
  };

  const handleEdit = (record: Teacher) => {
    setEditingTeacher(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await usersService.delete(id);
      message.success('删除成功');
      await loadData();
      await loadStats();
    } catch (error: any) {
      message.error(error?.message || '删除失败');
    }
  };

  const handleToggleStatus = async (record: Teacher) => {
    try {
      if (record.status === 'active') {
        await usersService.deactivate(record.id);
        message.success('教师停用成功');
      } else {
        await usersService.activate(record.id);
        message.success('教师启用成功');
      }
      await loadData();
      await loadStats();
    } catch (error: any) {
      message.error(error?.message || '操作失败');
    }
  };

  const handleSubmit = async (values: any) => {
    // 科任老师兼年级主任：role 固定 teacher，用 is_grade_admin 写入 roles=['grade_admin']
    const isGradeAdmin = Boolean(values.is_grade_admin);
    const classIds = (Array.isArray(values.class_ids) ? values.class_ids : [])
      .map((id: string) => String(id))
      .filter(Boolean)
      .slice(0, MAX_CLASS_COUNT);
    const payload = {
      real_name: values.name,
      phone: values.phone,
      email: values.email,
      role: 'teacher' as const,
      is_grade_admin: isGradeAdmin,
      school_id: values.school_id,
      grade_id: values.grade_id,
      class_id: classIds[0],
      class_ids: classIds,
      subjects: values.subjects,
    };
    try {
      if (editingTeacher) {
        await usersService.update(editingTeacher.id, payload);
        message.success('更新成功');
      } else {
        await usersService.create({
          username: values.username,
          password: values.password,
          ...payload,
        });
        message.success('创建成功');
      }
      setModalVisible(false);
      setEditingTeacher(null);
      await loadData();
      await loadStats();
    } catch (error: any) {
      message.error(error?.message || (editingTeacher ? '更新失败' : '创建失败'));
      throw error;
    }
  };

  const handleResetPassword = async (record: Teacher) => {
    try {
      await usersService.resetPassword(record.id, '123456');
      message.success('密码已重置为: 123456');
    } catch (error: any) {
      message.error(error?.message || '重置密码失败');
    }
  };

  const columns = [
    {
      title: '教师信息',
      key: 'teacher',
      width: 200,
      render: (_: unknown, record: Teacher) => (
        <Space>
          <Avatar
            size={36}
            style={{ backgroundColor: '#4f46e5' }}
            icon={<UserOutlined />}
          />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-xs text-gray-400">@{record.username}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '所属学校',
      dataIndex: 'school_name',
      key: 'school_name',
      render: (text: string, record: Teacher) => (
        <Space>
          <span>{text || '-'}</span>
          <Tag color={record.tenant_type === 'commercial' ? 'gold' : 'blue'}>
            {record.tenant_type === 'commercial' ? '商业' : '教育'}
          </Tag>
        </Space>
      ),
    },
    {
      title: '任教年级',
      dataIndex: 'grade_name',
      key: 'grade_name',
      render: (text: string) => text || '-',
    },
    {
      title: '任教班级',
      key: 'class_names',
      render: (_: unknown, record: Teacher) =>
        record.class_names?.length ? (
          <Space size={4} wrap>
            {record.class_names.map((name) => (
              <Tag key={name}>{name}</Tag>
            ))}
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: '身份',
      key: 'role',
      width: 110,
      render: (_: unknown, record: Teacher) =>
        record.is_grade_admin ? <Tag color="purple">年级主任</Tag> : <Tag>教师</Tag>,
    },
    {
      title: '来源 / 套餐',
      key: 'edition',
      render: (_: unknown, record: Teacher) => (
        <Space size={4}>
          <Tag>{record.source === 'self_registered' ? '自助注册' : '导入'}</Tag>
          {record.tenant_type === 'commercial' ? <Tag color="purple">{record.plan_code}</Tag> : null}
        </Space>
      ),
    },
    {
      title: '任教科目',
      dataIndex: 'subjects',
      key: 'subjects',
      render: (subjects: string[]) => (
        <Space size={4} wrap>
          {(subjects || []).map((subject) => (
            <Tag key={subject} color="blue" className="text-xs">
              {subject}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '联系方式',
      key: 'contact',
      render: (_: unknown, record: Teacher) => (
        <Space direction="vertical" size={0}>
          <span>
            <PhoneOutlined className="text-gray-400 mr-1" />
            {record.phone}
          </span>
          <span className="text-sm text-gray-500">
            <MailOutlined className="text-gray-400 mr-1" />
            {record.email}
          </span>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Teacher) => (
        <Switch
          checked={status === 'active'}
          checkedChildren="启用"
          unCheckedChildren="停用"
          onChange={() => handleToggleStatus(record)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: Teacher) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Tooltip title="重置密码">
            <Button
              type="link"
              size="small"
              icon={<KeyOutlined />}
              onClick={() => handleResetPassword(record)}
            >
              重置密码
            </Button>
          </Tooltip>
          <Popconfirm
            title="确定要删除这个教师吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="教师总数"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="已启用"
              value={stats.active}
              prefix={<Tag color="green">●</Tag>}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="已停用"
              value={stats.inactive}
              prefix={<Tag color="red">●</Tag>}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              placeholder="选择学校"
              value={selectedSchool || undefined}
              onChange={(value) => {
                setSelectedSchool(value || '');
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              className="w-48"
              allowClear
              showSearch
              optionFilterProp="label"
            >
              {schools.map((school) => (
                <Select.Option key={school.id} value={school.id} label={school.name}>
                  {school.name}
                </Select.Option>
              ))}
            </Select>

            <Select
              placeholder="版本"
              value={tenantType || undefined}
              onChange={(value) => {
                setTenantType(value || '');
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              className="w-36"
              allowClear
              options={[
                { value: 'education', label: '教育版' },
                { value: 'commercial', label: '商业版' },
              ]}
            />
            <Input
              placeholder="搜索姓名/用户名/手机号"
              prefix={<SearchOutlined />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              className="w-52"
              allowClear
            />
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>
            <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
              刷新
            </Button>
          </div>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
              下载模板
            </Button>
            <Upload accept=".xlsx,.xls,.csv" showUploadList={false} beforeUpload={handleImport}>
              <Button icon={<UploadOutlined />}>Excel 导入</Button>
            </Upload>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增教师
            </Button>
          </Space>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={teachers}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 位教师`,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({ ...prev, current: page, pageSize }));
            },
          }}
        />
      </Card>

      <TeacherModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingTeacher(null);
        }}
        editingTeacher={editingTeacher}
        schools={schools}
        grades={grades}
        classes={classes}
        subjectOptions={subjectOptions}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
