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
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  TeamOutlined,
  BookOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { organizationsService } from '@api/index';
import { ClassModal } from '@/components/ClassModal';
import { useOrgOptions } from '@/hooks/useOrgOptions';
import { asList, extractPayload, formatDate } from '@/utils/api';

interface ClassItem {
  id: string;
  school_id: string;
  school_name: string;
  grade_id: string;
  grade_name: string;
  name: string;
  academic_year: string;
  display_order: number;
  student_count: number;
  teacher_count: number;
  status: 'active' | 'inactive' | 'graduated';
  created_at: string;
}

function mapClass(item: any, schoolName?: string, gradeName?: string): ClassItem {
  const status = item.status === 'inactive' || item.status === 'graduated' ? item.status : 'active';
  return {
    id: String(item.id),
    school_id: String(item.school_id || item.schoolId || ''),
    school_name: item.school_name || item.schoolName || schoolName || '',
    grade_id: String(item.grade_id || item.gradeId || ''),
    grade_name: item.grade_name || item.gradeName || gradeName || '',
    name: item.name || '',
    academic_year: item.academic_year || item.academicYear || '',
    display_order: Number(item.display_order ?? item.displayOrder ?? 0),
    student_count: item.student_count ?? item._count?.students ?? 0,
    teacher_count: item.teacher_count ?? item._count?.teachers ?? 0,
    status,
    created_at: formatDate(item.created_at || item.createdAt),
  };
}

export const ClassesPage = () => {
  const { schools, grades, loadGrades } = useOrgOptions();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const filteredGrades = useMemo(
    () => grades.filter((g) => (selectedSchool ? g.school_id === selectedSchool : true)),
    [grades, selectedSchool]
  );

  const stats = useMemo(() => ({
    total: classes.length,
    active: classes.filter((c) => c.status === 'active').length,
    inactive: classes.filter((c) => c.status === 'inactive').length,
    graduated: classes.filter((c) => c.status === 'graduated').length,
  }), [classes]);

  const filteredClasses = useMemo(() => {
    const keyword = appliedKeyword.toLowerCase();
    return classes.filter((c) => {
      if (!keyword) return true;
      return (
        c.name.toLowerCase().includes(keyword) ||
        c.school_name.toLowerCase().includes(keyword) ||
        c.grade_name.toLowerCase().includes(keyword)
      );
    });
  }, [classes, appliedKeyword]);

  const pagedClasses = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize;
    return filteredClasses.slice(start, start + pagination.pageSize);
  }, [filteredClasses, pagination.current, pagination.pageSize]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await organizationsService.getClasses({
        school_id: selectedSchool || undefined,
        grade_id: selectedGrade || undefined,
      });
      const schoolMap = Object.fromEntries(schools.map((s) => [s.id, s.name]));
      const gradeMap = Object.fromEntries(grades.map((g) => [g.id, g.name]));
      const items = asList(extractPayload(response)).map((item) =>
        mapClass(
          item,
          schoolMap[String(item.school_id || item.schoolId)],
          gradeMap[String(item.grade_id || item.gradeId)]
        )
      );
      setClasses(items);
      setPagination((prev) => ({ ...prev, total: items.length }));
    } catch (error: any) {
      setClasses([]);
      message.error(error?.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [selectedSchool, selectedGrade, schools, grades]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [appliedKeyword, selectedSchool, selectedGrade]);

  const handleSearch = () => {
    setAppliedKeyword(searchKeyword.trim());
  };

  const handleReset = () => {
    setSearchKeyword('');
    setAppliedKeyword('');
    setSelectedSchool('');
    setSelectedGrade('');
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleAdd = () => {
    setEditingClass(null);
    setModalVisible(true);
  };

  const handleEdit = (record: ClassItem) => {
    setEditingClass(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await organizationsService.deleteClass(id);
      message.success('删除成功');
      await loadData();
    } catch (error: any) {
      message.error(error?.message || '删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingClass) {
        await organizationsService.updateClass(editingClass.id, {
          name: values.name,
          academic_year: values.academic_year,
          display_order: values.display_order,
          status: values.status,
        });
        message.success('更新成功');
      } else {
        await organizationsService.createClass(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      setEditingClass(null);
      await loadGrades();
      await loadData();
    } catch (error: any) {
      message.error(error?.message || (editingClass ? '更新失败' : '创建失败'));
      throw error;
    }
  };

  const columns = [
    {
      title: '班级名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <TeamOutlined className="text-blue-500" />
          <span className="font-medium">{text}</span>
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
      title: '年级',
      dataIndex: 'grade_name',
      key: 'grade_name',
      render: (text: string) => (
        <Space>
          <BookOutlined className="text-purple-400" />
          <span>{text || '-'}</span>
        </Space>
      ),
    },
    {
      title: '学年',
      dataIndex: 'academic_year',
      key: 'academic_year',
      render: (text: string) => text ? <Tag color="cyan">{text}</Tag> : '-',
    },
    {
      title: '学生数',
      dataIndex: 'student_count',
      key: 'student_count',
      render: (value: number) => (
        <span className="font-medium">
          <UserOutlined className="mr-1 text-green-400" />
          {value}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          active: { color: 'green', label: '在读' },
          inactive: { color: 'red', label: '已停用' },
          graduated: { color: 'purple', label: '已毕业' },
        };
        const info = statusMap[status as keyof typeof statusMap] || statusMap.active;
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: unknown, record: ClassItem) => (
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
            title="确定要删除这个班级吗？"
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
              title="班级总数"
              value={stats.total}
              prefix={<TeamOutlined />}
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
              title="已停用"
              value={stats.inactive}
              prefix={<Tag color="red">●</Tag>}
              valueStyle={{ color: '#ef4444' }}
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
              onChange={(value) => setSelectedGrade(value || '')}
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

            <Input
              placeholder="搜索班级名称"
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
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增班级
          </Button>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={pagedClasses}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredClasses.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个班级`,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({ ...prev, current: page, pageSize }));
            },
          }}
        />
      </Card>

      <ClassModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingClass(null);
        }}
        editingClass={editingClass}
        schools={schools}
        grades={grades}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
