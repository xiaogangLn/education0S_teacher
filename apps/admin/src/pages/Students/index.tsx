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
  Upload,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  PhoneOutlined,
  UploadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { studentsService } from '@api/index';
import { StudentModal } from '@/components/StudentModal';
import { useOrgOptions } from '@/hooks/useOrgOptions';
import { downloadAuthedFile, extractPayload, formatDate } from '@/utils/api';

interface Student {
  id: string;
  user_id: string;
  student_no: string;
  name: string;
  gender: 'male' | 'female';
  school_id: string;
  school_name: string;
  grade_id: string;
  grade_name: string;
  class_id: string;
  class_name: string;
  enrollment_year: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  status: 'active' | 'transferred' | 'graduated' | 'withdrawn';
  created_at: string;
}

function mapStudent(item: any): Student {
  const status = ['transferred', 'graduated', 'withdrawn'].includes(item.status) ? item.status : 'active';
  return {
    id: String(item.id),
    user_id: String(item.user_id || item.userId || item.id),
    student_no: item.student_no || item.studentNo || '',
    name: item.name || '',
    gender: item.gender === 'female' ? 'female' : 'male',
    school_id: String(item.school_id || item.schoolId || ''),
    school_name: item.school_name || item.schoolName || '',
    grade_id: String(item.grade_id || item.gradeId || ''),
    grade_name: item.grade_name || item.gradeName || '',
    class_id: String(item.class_id || item.classId || ''),
    class_name: item.class_name || item.className || '',
    enrollment_year: String(item.enrollment_year || item.enrollmentYear || ''),
    parent_name: item.parent_name || item.parentName || '',
    parent_phone: item.parent_phone || item.parentPhone || '',
    parent_email: item.parent_email || item.parentEmail || '',
    status,
    created_at: formatDate(item.created_at || item.createdAt),
  };
}

export const StudentsPage = () => {
  const { schools, grades, classes } = useOrgOptions();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [stats, setStats] = useState({ total: 0, active: 0, transferred: 0, graduated: 0 });

  const filteredGrades = useMemo(
    () => grades.filter((g) => (selectedSchool ? g.school_id === selectedSchool : true)),
    [grades, selectedSchool]
  );

  const filteredClasses = useMemo(
    () => classes.filter((c) => {
      const matchSchool = selectedSchool ? c.school_id === selectedSchool : true;
      const matchGrade = selectedGrade ? c.grade_id === selectedGrade : true;
      return matchSchool && matchGrade;
    }),
    [classes, selectedSchool, selectedGrade]
  );

  const loadStats = useCallback(async () => {
    try {
      const base = {
        school_id: selectedSchool || undefined,
        grade_id: selectedGrade || undefined,
        class_id: selectedClass || undefined,
        page: 1,
        page_size: 1,
      };
      const [allRes, activeRes, transferredRes, graduatedRes] = await Promise.all([
        studentsService.getList(base),
        studentsService.getList({ ...base, status: 'active' }),
        studentsService.getList({ ...base, status: 'transferred' }),
        studentsService.getList({ ...base, status: 'graduated' }),
      ]);
      setStats({
        total: extractPayload<any>(allRes)?.total ?? 0,
        active: extractPayload<any>(activeRes)?.total ?? 0,
        transferred: extractPayload<any>(transferredRes)?.total ?? 0,
        graduated: extractPayload<any>(graduatedRes)?.total ?? 0,
      });
    } catch {
      setStats({ total: 0, active: 0, transferred: 0, graduated: 0 });
    }
  }, [selectedSchool, selectedGrade, selectedClass]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await studentsService.getList({
        page: pagination.current,
        page_size: pagination.pageSize,
        keyword: appliedKeyword || undefined,
        school_id: selectedSchool || undefined,
        grade_id: selectedGrade || undefined,
        class_id: selectedClass || undefined,
      });
      const payload = extractPayload<{ items?: any[]; total?: number }>(response);
      const items = (payload?.items || []).map(mapStudent);
      setStudents(items);
      setPagination((prev) => ({ ...prev, total: payload?.total ?? items.length }));
    } catch (error: any) {
      setStudents([]);
      message.error(error?.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, appliedKeyword, selectedSchool, selectedGrade, selectedClass]);

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
    setSelectedGrade('');
    setSelectedClass('');
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadAuthedFile('/api/v1/students/import/template', '学生导入模板.xlsx');
    } catch (error: any) {
      message.error(error?.message || '模板下载失败');
    }
  };

  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const payload = extractPayload<{ success?: number; failed?: number; errors?: Array<{ row: number; reason: string }> }>(
        await studentsService.import(formData),
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

  const handleAdd = () => {
    setEditingStudent(null);
    setModalVisible(true);
  };

  const handleEdit = (record: Student) => {
    setEditingStudent(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await studentsService.delete(id);
      message.success('删除成功');
      await loadData();
      await loadStats();
    } catch (error: any) {
      message.error(error?.message || '删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        student_no: values.student_no,
        name: values.name,
        gender: values.gender,
        school_id: values.school_id,
        grade_id: values.grade_id,
        class_id: values.class_id,
        enrollment_year: values.enrollment_year,
        parent_name: values.parent_name,
        parent_phone: values.parent_phone,
        parent_email: values.parent_email,
        status: values.status,
      };
      if (editingStudent) {
        await studentsService.update(editingStudent.id, payload);
        message.success('更新成功');
      } else {
        await studentsService.create(payload);
        message.success('创建成功');
      }
      setModalVisible(false);
      setEditingStudent(null);
      await loadData();
      await loadStats();
    } catch (error: any) {
      message.error(error?.message || (editingStudent ? '更新失败' : '创建失败'));
      throw error;
    }
  };

  const columns = [
    {
      title: '学生信息',
      key: 'student',
      width: 180,
      render: (_: unknown, record: Student) => (
        <Space>
          <Avatar
            size={36}
            style={{
              backgroundColor: record.gender === 'male' ? '#4f46e5' : '#ec4899',
            }}
            icon={<UserOutlined />}
          />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-xs text-gray-400">学号: {record.student_no}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '所属学校',
      dataIndex: 'school_name',
      key: 'school_name',
      render: (text: string) => (
        <Space>
          <SearchOutlined className="text-gray-400" />
          <span>{text || '-'}</span>
        </Space>
      ),
    },
    {
      title: '哪一届',
      dataIndex: 'enrollment_year',
      key: 'enrollment_year',
      width: 160,
      render: (year: string) => {
        if (!year) return '-';
        const value = String(year).replace(/届$/, '');
        return `${value}届`;
      },
    },
    {
      title: '年级/班级',
      key: 'grade_class',
      render: (_: unknown, record: Student) => (
        <Space direction="vertical" size={0}>
          <span>
            <BookOutlined className="text-purple-400 mr-1" />
            {record.grade_name || '-'}
          </span>
          <span className="text-sm text-gray-500">
            <TeamOutlined className="text-blue-400 mr-1" />
            {record.class_name || '-'}
          </span>
        </Space>
      ),
    },
    {
      title: '家长信息',
      key: 'parent',
      render: (_: unknown, record: Student) => (
        <Space direction="vertical" size={0}>
          <span>{record.parent_name || '-'}</span>
          <span className="text-sm text-gray-500">
            <PhoneOutlined className="mr-1" />
            {record.parent_phone || '-'}
          </span>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          active: { color: 'green', label: '在读' },
          transferred: { color: 'orange', label: '已转班' },
          graduated: { color: 'purple', label: '已毕业' },
          withdrawn: { color: 'red', label: '已退学' },
        };
        const info = statusMap[status as keyof typeof statusMap] || statusMap.active;
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: unknown, record: Student) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个学生吗？"
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
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="学生总数"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="在读"
              value={stats.active}
              prefix={<Tag color="green">●</Tag>}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="已转班"
              value={stats.transferred}
              prefix={<Tag color="orange">●</Tag>}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="已毕业"
              value={stats.graduated}
              prefix={<Tag color="purple">●</Tag>}
              valueStyle={{ color: '#8b5cf6' }}
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
                setSelectedGrade('');
                setSelectedClass('');
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              className="w-44"
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
              placeholder="选择年级"
              value={selectedGrade || undefined}
              onChange={(value) => {
                setSelectedGrade(value || '');
                setSelectedClass('');
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              className="w-36"
              allowClear
              disabled={!selectedSchool}
              showSearch
              optionFilterProp="label"
            >
              {filteredGrades.map((grade) => (
                <Select.Option key={grade.id} value={grade.id} label={grade.name}>
                  {grade.name}
                </Select.Option>
              ))}
            </Select>

            <Select
              placeholder="选择班级"
              value={selectedClass || undefined}
              onChange={(value) => {
                setSelectedClass(value || '');
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
              className="w-36"
              allowClear
              disabled={!selectedGrade}
              showSearch
              optionFilterProp="label"
            >
              {filteredClasses.map((cls) => (
                <Select.Option key={cls.id} value={cls.id} label={cls.name}>
                  {cls.name}
                </Select.Option>
              ))}
            </Select>

            <Input
              placeholder="搜索姓名/学号"
              prefix={<SearchOutlined />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              className="w-44"
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
              新增学生
            </Button>
          </Space>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={students}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 名学生`,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({ ...prev, current: page, pageSize }));
            },
          }}
        />
      </Card>

      <StudentModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingStudent(null);
        }}
        editingStudent={editingStudent}
        schools={schools}
        grades={grades}
        classes={classes}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
