// components/QuickCreate.tsx
import React from 'react';
import {
  FileTextOutlined,
  FileOutlined,
  PlusOutlined,
  SnippetsOutlined,
  HighlightOutlined,
} from '@ant-design/icons';

export interface CreateItem {
  key: string;
  icon: React.ReactNode;
  name: string;
  desc: string;
  color?: string;
  onClick?: () => void;
}

interface QuickCreateProps {
  items?: CreateItem[];
  onItemClick?: (key: string) => void;
  className?: string;
}

const defaultItems: CreateItem[] = [
  {
    key: 'document',
    icon: <FileTextOutlined className="text-2xl text-blue-500" />,
    name: '新建文档',
    desc: 'Markdown / 富文本',
    color: 'hover:border-blue-400 hover:bg-blue-50',
  },
  {
    key: 'video',
    icon: <HighlightOutlined className="text-2xl text-purple-500" />,
    name: '上传试卷',
    desc: 'PDF / PPT / Word',
    color: 'hover:border-purple-400 hover:bg-purple-50',
  },
  {
    key: 'file_j',
    icon: <FileOutlined className="text-2xl text-orange-500" />,
    name: '上传教案',
    desc: 'PDF / PPT / Word',
    color: 'hover:border-orange-400 hover:bg-orange-50',
  },
  {
    key: 'file_k',
    icon: <SnippetsOutlined className="text-2xl text-red-500" />,
    name: '上传课件',
    desc: 'PDF / PPT / Word',
    color: 'hover:border-red-400 hover:bg-red-50',
  },
];

export const QuickCreate: React.FC<QuickCreateProps> = ({
  items = defaultItems,
  onItemClick,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-2xl p-5 border border-gray-100 ${className}`}>
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-4">
        <PlusOutlined className="text-blue-500 text-lg" />
        <span className="font-semibold text-base text-gray-800">快速创建</span>
        <span className="text-xs text-gray-400 ml-2">选择类型开始创作</span>
      </div>

      {/* 创建项网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item) => (
          <div
            key={item.key}
            className={`
              flex flex-col items-center justify-center p-4 rounded-xl
              border-2 border-dashed border-gray-200
              transition-all duration-200 cursor-default
              ${item.color || 'hover:border-blue-400 hover:bg-blue-50'}
            `}
            onClick={() => onItemClick?.(item.key)}
          >
            {/* 图标 */}
            <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-2 group-hover:bg-white transition-colors">
              {item.icon}
            </div>
            {/* 名称 */}
            <span className="text-sm font-medium text-gray-800 text-center">
              {item.name}
            </span>
            {/* 描述 */}
            <span className="text-xs text-gray-400 text-center mt-0.5">
              {item.desc}
            </span>
          </div>
        ))}
      </div>

      {/* 底部快捷操作 */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>📌 支持批量上传</span>
          <span className="w-px h-3 bg-gray-200" />
          <span>📎 拖拽文件到此处</span>
        </div>
      </div>
    </div>
  );
};

export default QuickCreate;