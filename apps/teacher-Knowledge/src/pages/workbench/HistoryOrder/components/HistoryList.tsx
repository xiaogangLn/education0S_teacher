import React, { useMemo } from 'react';
import { Button, Tag, Empty } from 'antd';
import { EditOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

export interface HistoryItem {
  id: string;
  title: string;
  type: string;
  status: string;
  subject: string;
  version: string;
  time: string;
  date: string;
  grade: string;
  class: string;
}

const TYPE_MAP: Record<string, string> = {
  lesson_plan: '教案',
  courseware: '课件',
  exam: '试卷',
  research: '查资料',
};

const STATUS_MAP: Record<string, string> = {
  draft: '草稿',
  generated: '已生成',
  pending_review: '审核中',
  approved: '已发布',
  published: '已发布',
  research: '查询中',
};

const HistoryList: React.FC<{ items: HistoryItem[] }> = ({ items }) => {
  const navigate = useNavigate();
  const typeColors: Record<string, string> = { 教案: 'blue', 课件: 'green', 试卷: 'orange', 查资料: 'purple' };

  const openWorkbench = (item: HistoryItem) => {
    if (item.type === '查资料') {
      navigate(`/workbench/instrument?mode=research&id=${item.id}`);
      return;
    }
    navigate(`/workbench/instrument?id=${item.id}`);
  };

  const openDetail = (item: HistoryItem) => {
    if (item.type === '查资料') {
      navigate(`/workbench/instrument?mode=research&id=${item.id}`);
      return;
    }
    if (item.type === '课件') navigate(`/workbench/coursewareDetail?id=${item.id}`);
    else if (item.type === '试卷') navigate(`/workbench/examDetail?id=${item.id}`);
    else navigate(`/workbench/lessonPlanDetail?id=${item.id}`);
  };
  const groupedData = useMemo(() => {
    return items.reduce((acc, item) => {
      const dateKey = item.date || '未分组';
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(item);
      return acc;
    }, {} as Record<string, HistoryItem[]>);
  }, [items]);

  if (!items.length) {
    return <Empty description="暂无加工记录" />;
  }

  return (
    <div className="h-full pr-1 history-scroll">
      <div className="space-y-5">
        {Object.keys(groupedData).map((dateKey) => {
          const groupItems = groupedData[dateKey];
          return (
            <div key={dateKey}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">{dateKey}</span>
                <div className="flex-1 min-w-0">
                  <div className="h-px bg-gray-200" />
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">{groupItems.length} 条</span>
              </div>
              <div className="space-y-3">
                {groupItems.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="text-base font-medium text-gray-800 truncate">{item.title}</span>
                          <Tag color={typeColors[item.type] || 'blue'}>{item.type}</Tag>
                          <span className="text-xs text-gray-500">{item.status}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>{item.subject}</span>
                          <span className="flex items-center gap-1">
                            <ClockCircleOutlined className="text-xs" />
                            {item.time}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                        {item.type !== '查资料' && (
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => openWorkbench(item)}
                          />
                        )}
                        <Button
                          type="text"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => openDetail(item)}
                        >
                          {item.type === '查资料' ? '详情' : null}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { TYPE_MAP, STATUS_MAP };
export default HistoryList;
