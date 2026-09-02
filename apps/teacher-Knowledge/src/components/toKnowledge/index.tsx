import { Button } from 'antd';
import React, { useState } from 'react';

interface KnowledgeBaseTagProps {
  /** 文档总数，用于显示在标签上 */
  documentCount?: number;
  /** 点击标签的回调函数 */
  onClick?: () => void;
  /** 自定义类名 */
  className?: string;
  /** 是否显示统计数字 */
  showStats?: boolean;
}

/**
 * 前往知识库标签组件（方案D - 胶囊式带统计数字）
 * 
 * 使用示例：
 * <KnowledgeBaseTag documentCount={128} onClick={() => navigate('/knowledge')} />
 */
export const KnowledgeBaseTag: React.FC<KnowledgeBaseTagProps> = ({
  documentCount = 128,
  onClick,
  className = '',
  showStats = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Button
      className={`
        inline-flex items-center gap-2 px-4 py-1.5 
        !rounded-[60px] 
        bg-white text-gray-800 
        border border-gray-200 
        shadow-sm
        transition-all duration-200 ease-out
        hover:border-indigo-600 hover:shadow-md
        ${className}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 图标 */}
      <span className="text-base leading-none" aria-hidden="true">
        📁
      </span>

      {/* 文字 */}
      <span className="text-sm font-medium text-gray-700">前往知识库</span>

      {/* 统计数字 */}
      {showStats && (
        <span
          className={`
            text-xs font-medium px-2.5 py-0.5 rounded-full
            bg-gray-100 text-gray-500
            transition-colors duration-200
            ${isHovered ? 'bg-indigo-100 text-indigo-700' : ''}
          `}
        >
          {documentCount}
        </span>
      )}

      {/* 箭头 */}
      <span
        className={`
          text-sm text-gray-300
          transition-all duration-200
          ${isHovered ? 'text-indigo-500 translate-x-0.5' : ''}
        `}
        aria-hidden="true"
      >
        →
      </span>
    </Button>
  );
};

export default KnowledgeBaseTag;