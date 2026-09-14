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
  BankOutlined,
  UserOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { organizationsService } from '@api/index';
import { SchoolModal } from '@/components/SchoolModal';
import { asList, extractPayload, formatDate } from '@/utils/api';

interface School {
  id: string;
  name: string;
  code: string;
  type: 'education' | 'commercial';
  plan_code: string;
  source: string;
  owner_name: string;
  owner_phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  contact_phone: string;
  contact_person: string;
  status: 'active' | 'inactive';
  student_count: number;
  teacher_count: number;
  created_at: string;
  generation_model: string;
  grading_model: string;
  generation_base_url: string;
  has_generation_api_key: boolean;
}

function mapSchool(item: any): School {
  return {
    id: String(item.id),
    name: item.name || '',
    code: item.code || '',
    type: item.type === 'commercial' ? 'commercial' : 'education',
    plan_code: item.plan_code || item.planCode || 'exempt',
    source: item.source || 'import',
    owner_name: item.owner?.name || item.owner_name || '',
    owner_phone: item.owner?.phone || item.owner_phone || '',
    province: item.province || '',
    city: item.city || '',
    district: item.district || '',
    address: item.address || '',
    contact_phone: item.contact_phone || item.contactPhone || '',
    contact_person: item.contact_person || item.contactPerson || '',
    status: item.status === 'inactive' ? 'inactive' : 'active',
    student_count: item.student_count ?? item._count?.students ?? 0,
    teacher_count: item.teacher_count ?? item._count?.teachers ?? 0,
    created_at: formatDate(item.created_at || item.createdAt),
    generation_model: item.generation_model || item.generationModel || '',
    grading_model: item.grading_model || item.gradingModel || '',
    generation_base_url: item.generation_base_url || item.generationBaseUrl || '',
    has_generation_api_key: Boolean(item.has_generation_api_key),
  };
}

export const SchoolsPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [appliedKeyword, setAppliedKeyword] = useState('');
  const [tenantType, setTenantType] = useState<string | undefined>();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const stats = useMemo(() => ({
    total: schools.length,
    active: schools.filter((s) => s.status === 'active').length,
    inactive: schools.filter((s) => s.status === 'inactive').length,
  }), [schools]);

  const pagedSchools = useMemo(() => {
    const start = (pagination.current - 1) * pagination.pageSize;
    return schools.slice(start, start + pagination.pageSize);
  }, [schools, pagination.current, pagination.pageSize]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await organizationsService.getSchools({
        keyword: appliedKeyword || undefined,
        type: tenantType,
      });
      let items = asList(extractPayload(response)).map(mapSchool);
      if (appliedKeyword) {
        const keyword = appliedKeyword.toLowerCase();
        items = items.filter(
          (item) =>
            item.name.toLowerCase().includes(keyword) ||
            item.code.toLowerCase().includes(keyword)
        );
      }
      setSchools(items);
      setPagination((prev) => ({ ...prev, total: items.length }));
    } catch (error: any) {
      setSchools([]);
      message.error(error?.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [appliedKeyword, tenantType]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    setAppliedKeyword(searchKeyword.trim());
  };

  const handleReset = () => {
    setSearchKeyword('');
    setAppliedKeyword('');
    setTenantType(undefined);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleAdd = () => {
    setEditingSchool(null);
    setModalVisible(true);
  };

  const handleEdit = (record: School) => {
    setEditingSchool(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await organizationsService.deleteSchool(id);
      message.success('删除成功');
      await loadData();
    } catch (error: any) {
      message.error(error?.message || '删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    const payload = {
      name: values.name,
      code: values.code,
      province: values.province || '',
      city: values.city || '',
      district: values.district || '',
      address: values.address || '',
      contact_person: values.contact_person || '',
      contact_phone: values.contact_phone || '',
      status: values.status || 'active',
      generation_model: values.generation_model,
      grading_model: values.grading_model,
      generation_base_url: values.generation_base_url || undefined,
      generation_api_key: values.generation_api_key || undefined,
    };
    try {
      if (editingSchool) {
        await organizationsService.updateSchool(editingSchool.id, payload);
        message.success('更新成功');
      } else {
        await organizationsService.createSchool(payload);
        message.success('创建成功');
      }
      setModalVisible(false);
      setEditingSchool(null);
      await loadData();
    } catch (error: any) {
      message.error(error?.message || (editingSchool ? '更新失败' : '创建失败'));
      throw error;
    }
  };

  const columns = [
    {
      title: '学校名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <BankOutlined className="text-blue-500" />
          <span className="font-medium">{text}</span>
        </Space>
      ),
    },
    {
      title: '学校编码',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => text ? <Tag color="blue">{text}</Tag> : '-',
    },
    {
      title: '版本',
      key: 'type',
      render: (_: unknown, record: School) => (
        <Space size={4}>
          <Tag color={record.type === 'commercial' ? 'gold' : 'blue'}>
            {record.type === 'commercial' ? '商业' : '教育'}
          </Tag>
          {record.type === 'commercial' ? <Tag>{record.plan_code}</Tag> : null}
        </Space>
      ),
    },
    {
      title: '注册老师',
      key: 'owner',
      render: (_: unknown, record: School) =>
        record.type === 'commercial' ? `${record.owner_name || '-'} ${record.owner_phone || ''}`.trim() : '-',
    },
    {
      title: '模型',
      key: 'models',
      render: (_: unknown, record: School) =>
        record.type === 'education' ? (
          <span className="text-xs text-gray-600">
            {record.generation_model && record.grading_model
              ? `${record.generation_model} / ${record.grading_model}`
              : (
                <span className="text-red-500">未配置模型</span>
              )}
          </span>
        ) : (
          <span className="text-xs text-gray-400">由套餐决定</span>
        ),
    },
    {
      title: '所在地',
      key: 'location',
      render: (_: unknown, record: School) =>
        `${record.province} ${record.city} ${record.district}`.trim() || '-',
    },
    {
      title: '联系电话',
      dataIndex: 'contact_phone',
      key: 'contact_phone',
    },
    {
      title: '联系人',
      dataIndex: 'contact_person',
      key: 'contact_person',
    },
    {
      title: '师生数',
      key: 'count',
      render: (_: unknown, record: School) => (
        <Space size={8}>
          <span className="text-sm">
            <TeamOutlined className="mr-1 text-blue-400" />
            {record.student_count || 0}
          </span>
          <span className="text-sm">
            <UserOutlined className="mr-1 text-green-400" />
            {record.teacher_count || 0}
          </span>
        </Space>
      ),
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
      width: 180,
      render: (_: unknown, record: School) => (
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
            title="确定要删除这所学校吗？"
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
              title="学校总数"
              value={stats.total}
              prefix={<BankOutlined />}
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
            <Input
              placeholder="搜索学校名称或编码"
              prefix={<SearchOutlined />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onPressEnter={handleSearch}
              className="w-56"
              allowClear
            />
            <Select
              allowClear
              placeholder="版本"
              className="w-36"
              value={tenantType}
              onChange={setTenantType}
              options={[
                { value: 'education', label: '教育版' },
                { value: 'commercial', label: '商业版' },
              ]}
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
            新增学校
          </Button>
        </div>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={pagedSchools}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 所学校`,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({ ...prev, current: page, pageSize }));
            },
          }}
        />
      </Card>

      <SchoolModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingSchool(null);
        }}
        editingSchool={editingSchool}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
