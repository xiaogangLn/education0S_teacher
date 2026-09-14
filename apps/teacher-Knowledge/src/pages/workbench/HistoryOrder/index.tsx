import { useEffect, useState } from 'react';
import { Input, Select, Space, Button, Tag, Spin, message } from 'antd';
import { SearchOutlined, FilterOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import HistoryList, { STATUS_MAP, TYPE_MAP } from './components/HistoryList';
import { useNavigate } from 'react-router-dom';
import { processingService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { useOrgContext } from '@/hooks/useOrgContext';
import { artifactDisplayName } from '@/utils/artifactName';
import { isCommercialTenant, loadPersistedUser } from '@/utils/currentUser';

const { Option } = Select;

const HistoryOrderComponent = () => {
  const navigate = useNavigate();
  const org = useOrgContext();
  const commercial = isCommercialTenant(loadPersistedUser());
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [type, setType] = useState('all');
  const [items, setItems] = useState<any[]>([]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const payload = extractPayload<{ items: any[]; total: number }>(
        await processingService.getList({
          page: 1,
          page_size: 50,
          type: type === 'all' ? undefined : type,
          ...(commercial ? {} : { class_id: org.classId }),
        }),
      );
      const mapped = (payload?.items || [])
        .filter((item) => !searchText || String(item.topic || item.title || '').includes(searchText))
        .map((item) => ({
          id: item.id,
          title: artifactDisplayName(item.title || item.topic, item.type),
          type: TYPE_MAP[item.type] || '教案',
          status: item.type === 'research' ? '查询中' : (STATUS_MAP[item.status] || item.status),
          subject: item.subject,
          version: `v${item.version || 1}`,
          time: item.updated_at ? new Date(item.updated_at).toLocaleString('zh-CN') : '',
          date: item.updated_at ? new Date(item.updated_at).toLocaleDateString('zh-CN') : '',
          grade: org.gradeName || '',
          class: org.className || '',
        }));
      setItems(mapped);
    } catch {
      setItems([]);
      message.error('加载历史记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [type, org.classId]);

  return (
    <div className="history-page h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">历史记录</h2>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              返回
            </Button>
            <Button type="primary" icon={<FilterOutlined />} onClick={fetchList}>
              刷新
            </Button>
          </Space>
        </div>
      </div>
      <div className="bg-white rounded-[16px] flex flex-col">
        <div className="flex-shrink-0 px-6 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="搜索历史记录..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={fetchList}
                className="rounded-lg"
                allowClear
              />
            </div>
            <Select value={type} className="w-32" size="middle" onChange={setType}>
              <Option value="all">全部类型</Option>
              <Option value="lesson_plan">教案</Option>
              <Option value="courseware">课件</Option>
              <Option value="exam">试卷</Option>
              <Option value="research">查资料</Option>
            </Select>
            <Button type="primary" onClick={fetchList} loading={loading}>
              搜索
            </Button>
          </div>
        </div>
        <div className="flex-shrink-0 px-6 py-3 border-b">
          <span className="text-gray-500">
            共 <span className="font-semibold text-gray-700">{items.length}</span> 条记录
          </span>
        </div>
        <div className="overflow-auto px-6 pb-6 pt-4" style={{ height: 'calc(100vh - 320px)' }}>
          <Spin spinning={loading}>
            <HistoryList items={items} />
          </Spin>
        </div>
      </div>
    </div>
  );
};

export { HistoryOrderComponent };
