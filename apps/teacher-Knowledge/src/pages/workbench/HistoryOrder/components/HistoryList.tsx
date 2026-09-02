import React from 'react';
import { Button, Tag, Dropdown, Tooltip, message } from 'antd';
import { 
    EditOutlined, 
    EyeOutlined, 
    DeleteOutlined,
    MoreOutlined,
    FilePdfOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';

interface HistoryItem {
    id: number;
    title: string;
    type: '教案' | '课件' | '试卷';
    status: '已发布' | '审核中' | '草稿';
    subject: string;
    version: string;
    time: string;
    date: string;
    grade: string;
    class: string;
}

const HistoryList: React.FC = () => {
    // 模拟数据
    const historyData: HistoryItem[] = [
        {
            id: 1,
            title: '二次函数图像与性质',
            type: '教案',
            status: '已发布',
            subject: '九年级数学',
            version: 'v3',
            time: '14:30',
            date: '今天',
            grade: '2026届',
            class: '九年级1班',
        },
        {
            id: 2,
            title: '函数图像课件',
            type: '课件',
            status: '审核中',
            subject: '九年级数学',
            version: 'V1',
            time: '14:15',
            date: '今天',
            grade: '2026届',
            class: '九年级1班',
        },
        {
            id: 3,
            title: '一元二次方程',
            type: '教案',
            status: '已发布',
            subject: '九年级数学',
            version: 'v2',
            time: '16:00',
            date: '昨天',
            grade: '2026届',
            class: '九年级1班',
        },
        {
            id: 4,
            title: '函数单元复习卷',
            type: '试卷',
            status: '审核中',
            subject: '九年级数学',
            version: 'v3',
            time: '10:00',
            date: '昨天',
            grade: '2026届',
            class: '九年级1班',
        },
        {
            id: 5,
            title: '三角函数专题练习',
            type: '试卷',
            status: '已发布',
            subject: '九年级数学',
            version: 'v1',
            time: '09:30',
            date: '2026-08-28',
            grade: '2026届',
            class: '九年级2班',
        },
        {
            id: 6,
            title: '统计与概率复习',
            type: '课件',
            status: '草稿',
            subject: '九年级数学',
            version: 'v2',
            time: '15:20',
            date: '2026-08-27',
            grade: '2026届',
            class: '九年级1班',
        },
    ];

    // 类型标签颜色
    const typeColors = {
        '教案': 'blue',
        '课件': 'green',
        '试卷': 'orange',
    };

    // 状态图标
    const statusIcons = {
        '已发布': '✅',
        '审核中': '⏳',
        '草稿': '📝',
    };

    const getStatusDot = (status: string) => {
        const colors = {
            '已发布': 'bg-green-500',
            '审核中': 'bg-yellow-500',
            '草稿': 'bg-gray-400',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-400';
    };

    // 分组数据 - 按日期
    const groupedData = historyData.reduce((acc, item) => {
        const dateKey = item.date;
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(item);
        return acc;
    }, {} as Record<string, HistoryItem[]>);

    const dateOrder = ['今天', '昨天', '2026-08-28', '2026-08-27'];

    // 更多操作菜单
    const getMoreMenu = (item: HistoryItem) => ({
        items: [
            { key: 'edit', label: '编辑', icon: <EditOutlined /> },
            { key: 'view', label: '预览', icon: <EyeOutlined /> },
            { key: 'export', label: '导出', icon: <FilePdfOutlined /> },
            { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true },
        ],
        onClick: ({ key }: { key: string }) => {
            console.log(`对 ${item.title} 执行操作: ${key}`);
        },
    });

    return (
        <div className="h-full pr-1 history-scroll">
            <div className="space-y-5">
                {dateOrder.map(dateKey => {
                    const items = groupedData[dateKey];
                    if (!items) return null;

                    return (
                        <div key={dateKey}>
                            {/* 日期标题 */}
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">{dateKey}</span>
                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                    {dateKey === '今天' ? '2026-08-30' : 
                                    dateKey === '昨天' ? '2026-08-29' : dateKey}
                                </span>
                                {/* 自定义分割线 - 自适应宽度 */}
                                <div className="flex-1 min-w-0">
                                    <div className="h-px bg-gray-200" />
                                </div>
                                <span className="text-xs text-gray-400 whitespace-nowrap">{items.length} 条</span>
                            </div>

                            {/* 卡片列表 */}
                            <div className="space-y-3">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-4"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-base font-medium text-gray-800 truncate">
                                                        {item.title}
                                                    </span>
                                                    <Tag color={typeColors[item.type as keyof typeof typeColors]}>
                                                        {item.type}
                                                    </Tag>
                                                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(item.status)}`} />
                                                        <span className="text-xs text-gray-500">
                                                            {statusIcons[item.status as keyof typeof statusIcons]} {item.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 whitespace-nowrap overflow-x-auto">
                                                    <span>{item.subject}</span>
                                                    <span className="text-gray-300">|</span>
                                                    <span className="text-xs text-gray-400">{item.version}</span>
                                                    <span className="text-gray-300">|</span>
                                                    <span className="flex items-center gap-1">
                                                        <ClockCircleOutlined className="text-xs" />
                                                        {item.time}
                                                    </span>
                                                    <span className="text-gray-300">|</span>
                                                    <span className="text-xs text-gray-400">
                                                        {item.grade} · {item.class}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                                                <Tooltip title="编辑">
                                                    <Button 
                                                        type="text" 
                                                        size="small" 
                                                        icon={<EditOutlined />}
                                                        className="hover:text-blue-500"
                                                    />
                                                </Tooltip>
                                                <Tooltip title="预览">
                                                    <Button 
                                                        type="text" 
                                                        size="small" 
                                                        icon={<EyeOutlined />}
                                                        className="hover:text-green-500"
                                                    />
                                                </Tooltip>
                                                <Dropdown menu={getMoreMenu(item)} trigger={['click']} placement="bottomRight">
                                                    <Button 
                                                        type="text" 
                                                        size="small" 
                                                        icon={<MoreOutlined />}
                                                        className="hover:text-gray-700"
                                                    />
                                                </Dropdown>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
                {/* 加载更多 */}
                <div className="flex justify-center pt-2 pb-4">
                    <Button 
                        type="text" 
                        className="text-blue-500 hover:text-blue-600"
                        onClick={() => message.info('加载更多...')}
                    >
                        加载更多
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default HistoryList;