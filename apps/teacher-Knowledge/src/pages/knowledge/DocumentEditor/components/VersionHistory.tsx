// components/VersionHistory.tsx
import React from 'react';
import { Drawer, Timeline, Tag, Button } from 'antd';

interface Version {
  id: string;
  version: number;
  author: string;
  time: string;
  message: string;
  changes: number;
}

interface VersionHistoryProps {
  open: boolean;
  onClose: () => void;
  versions: Version[];
  onRestore?: (version: Version) => void;
}

const mockVersions: Version[] = [
  { id: '1', version: 3, author: '张老师', time: '2026-09-02 14:35', message: '添加例题精讲', changes: 12 },
  { id: '2', version: 2, author: '张老师', time: '2026-09-02 13:20', message: '完善教学重难点', changes: 8 },
  { id: '3', version: 1, author: '张老师', time: '2026-09-02 11:00', message: '创建文档', changes: 45 },
];

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  open,
  onClose,
  versions = mockVersions,
  onRestore,
}) => {
  return (
    <Drawer
      title="📜 版本历史"
      placement="right"
      width={400}
      open={open}
      onClose={onClose}
      bodyStyle={{ padding: '16px 20px' }}
    >
      <Timeline>
        {versions.map((v, index) => (
          <Timeline.Item key={v.id} color={index === 0 ? 'blue' : 'gray'}>
            <div className="flex-shrink-0 flex justify-between items-start">
              <div>
                <div className="font-medium">
                  v{v.version} · {v.author}
                  {index === 0 && <Tag color="blue" className="ml-2">当前</Tag>}
                </div>
                <div className="text-sm text-gray-500">{v.message}</div>
                <div className="text-xs text-gray-400">{v.time} · {v.changes} 处修改</div>
              </div>
              {index > 0 && (
                <Button size="small" onClick={() => onRestore?.(v)}>
                  恢复
                </Button>
              )}
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </Drawer>
  );
};