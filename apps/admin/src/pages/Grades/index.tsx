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
  BookOutlined,
} from '@ant-design/icons';
import { organizationsService } from '@api/index';
import { GradeModal } from '@/components/GradeModal';
import { useOrgOptions } from '@/hooks/useOrgOptions';
import { asList, extractPayload, formatDate } from '@/utils/api';

interface Grade {
  id: string;
  school_id: string;
  school_name: string;
  name: string;
  display_order: number;
  class_count: number;
  student_count: number;
  status: 'active' | 'inactive';
  created_at: string;
}

function mapGrade(item: any, schoolName?: string): Grade {
  return {
    id: String(item.id),
    school_id: String(item.school_id || item.schoolId || ''),
    school_name: item.school_name || item.schoolName || schoolName || '',
    name: item.name || '',
    display_order: Number(item.display_order ?? item.displayOrder ?? 0),
    class_count: item.class_count ?? item._count?.classes ?? 0,
    student_count: item.student_count ?? item._count?.students ?? 0,
    status: item.status === 'inactive' ? 'inactive' : 'active',
    created_at: formatDate(item.created_at || item.createdAt),
  };
}

export const GradesPage = () => {
  const { schools } = useOrgOptions();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const stats = useMemo(() => ({
    total: grades.length,
    active: grades.filter((g) => g.status === 'active').length,
    inactive: grades.filter((g) => g.status === 'inactive').length,
  }), [grades]);

  const filteredGrades = useMemo(() => {
    const keyword = appliedKeyword.toLowerCase();
    return grades.filter((g) => {
      if (!keyword) return true;
      return g.name.toLowerCase().includes(keyword) || g.school_name.toLowerCase().includes(keyword);
    });
  }, [grades, appliedKeyword]);

  const pagedGrades = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize;
    return filteredGrades.slice(start, start + pagination.pageSize);
  }, [filteredGrades, pagination.current, pagination.pageSize]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await organizationsService.getGrades({
        school_id: selectedSchool || undefined,
      });
      const schoolMap = Object.fromEntries(schools.map((s) => [s.id, s.name]));
      const items = asList(extractPayload(response)).map((item) =>
        mapGrade(item, schoolMap[String(item.school_id || item.schoolId)])
      );
      setGrades(items);
      setPagination((prev) => ({ ...prev, total: items.length }));
    } catch (error: any) {
      setGrades([]);
      message.error(error?.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [selectedSchool, schools]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, total: filteredGrades.length, current: 1 }));
  }, [appliedKeyword, selectedSchool]);

  const handleSearch = () => {
    setAppliedKeyword(searchKeyword.trim());
  };

  const handleReset = () => {
    setSearchKeyword('');
    setAppliedKeyword('');
    setSelectedSchool('');
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleAdd = () => {
    setEditingGrade(null);
    setModalVisible(true);
  };

  const handleEdit = (record: Grade) => {
    setEditingGrade(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await organizationsService.deleteGrade(id);
      message.success('删除成功');
      await loadData();
    } catch (error: any) {
      message.error(error?.message || '删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingGrade) {
        await organizationsService.updateGrade(editingGrade.id, values);
        message.success('更新成功');
      } else {
        await organizationsService.createGrade(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      setEditingGrade(null);
      await loadData();
    } catch (error: any) {
      message.error(error?.message || (editingGrade ? '更新失败' : '创建失败'));
      throw error;
    }
  };

  const columns = [
    {
      title: '年级名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <BookOutlined className="text-blue-500" />
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
      title: '排序',
      dataIndex: 'display_order',
      key: 'display_order',
      render: (value: number) => <Tag color="blue">第 {value} 顺序</Tag>,
    },
    {
      title: '班级数',
      dataIndex: 'class_count',
      key: 'class_count',
      render: (value: number) => <span className="font-medium">{value}</span>,
    },
    {
      title: '学生数',
      dataIndex: 'student_count',
      key: 'student_count',
      render: (value: number) => <span className="font-medium">{value}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '已激活' : '已停用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_: unknown, record: Grade) => (
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
            title="确定要删除这个年级吗？"
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
              title="年级总数"
              value={stats.total}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="已激活"
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
            <Input
              placeholder="搜索年级名称"
              prefix={<SearchOutlined />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              className="w-48"
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
            新增年级
          </Button>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={pagedGrades}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredGrades.length,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 个年级`,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({ ...prev, current: page, pageSize }));
            },
          }}
        />
      </Card>

      <GradeModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingGrade(null);
        }}
        editingGrade={editingGrade}
        schools={schools}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
