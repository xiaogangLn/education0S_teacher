import { useState } from 'react';
import { 
    Input, 
    Select, 
    Space, 
    Button, 
    Tag, 
    Spin,
    message
} from 'antd';
import { 
    SearchOutlined, 
    FilterOutlined, 
    ArrowLeftOutlined,
} from '@ant-design/icons';
import HistoryList from './components/HistoryList';
import { useNavigate } from 'react-router-dom';

// ✅ 正确：从 Select 中解构 Option
const { Option } = Select;

const HistoryOrderComponent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');

    const handleSearch = () => {
        setLoading(true);
        // 模拟搜索
        setTimeout(() => {
            setLoading(false);
            message.success('搜索完成');
        }, 1000);
    };

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            message.success('刷新成功');
        }, 800);
    };

    const handleCancel = () => {
        navigate(-1);
    };

    return (
        <div className="history-page h-full flex flex-col overflow-hidden">
            {/* 页面头部 */}
            <div className="flex-shrink-0 pb-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">历史记录</h2>
                    <Space>
                        <Button 
                            icon={<ArrowLeftOutlined />} 
                            onClick={handleCancel}
                            loading={loading}
                        >
                            返回
                        </Button>
                        <Button 
                            type="primary" 
                            icon={<FilterOutlined />}
                            onClick={handleRefresh}
                        >
                             刷新
                        </Button>
                    </Space>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                    按届别/班级/类型筛选 · 所有生成内容
                </div>
            </div>
            <div className='bg-white rounded-[16px] flex flex-col'>
                {/* 搜索和筛选栏 */}
                <div className="flex-shrink-0 px-6 py-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                            <Input
                                placeholder="搜索历史记录..."
                                prefix={<SearchOutlined className="text-gray-400" />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onPressEnter={handleSearch}
                                className="rounded-lg"
                                allowClear
                            />
                        </div>
                        <Select defaultValue="lesson" className="w-32" size="middle">
                            <Option value="all">全部类型</Option>
                            <Option value="lesson">教案</Option>
                            <Option value="course">课件</Option>
                            <Option value="exam">试卷</Option>
                        </Select>
                        <Button type="primary" onClick={handleSearch} loading={loading}>
                            搜索
                        </Button>
                    </div>
                </div>

                {/* 统计信息 */}
                <div className="flex-shrink-0 px-6 py-3 border-b">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                            <span className="text-gray-500">共 <span className="font-semibold text-gray-700">24</span> 条记录</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-gray-500">最近更新：</span>
                            <span className="text-gray-700">2026-08-30 14:30</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Tag color="blue">2026届 · 九年级1班</Tag>
                            <span className="text-gray-400 text-xs">筛选当前</span>
                        </div>
                    </div>
                </div>


                <div 
                    className="overflow-auto px-6 pb-6 pt-4"
                    style={{ height: 'calc(100vh - 320px)' }}
                >
                    <Spin spinning={loading}>
                        {/* ✅ 滚动容器 - h-full + overflow-y-auto */}
                        <HistoryList />
                    </Spin>
                </div>
            </div>
        </div>
    );
}

export {
    HistoryOrderComponent
}