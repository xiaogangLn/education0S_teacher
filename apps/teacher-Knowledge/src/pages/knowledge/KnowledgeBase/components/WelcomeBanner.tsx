// components/WelcomeBanner.tsx
import React from 'react';

interface WelcomeBannerProps {
  userName: string;
  className?: string;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  userName = '张老师',
  className = '',
}) => {
  return (
    <div className={`bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white ${className}`}>
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold">📚 欢迎回来，{userName}</h1>
          <p className="opacity-80 text-sm mt-1">
            知识库 · 2025届 · 九年级1班 · 今日已更新 12 个文件
          </p>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <div className="text-2xl font-bold">128</div>
            <div className="text-xs opacity-70">文档</div>
          </div>
          <div>
            <div className="text-2xl font-bold">34</div>
            <div className="text-xs opacity-70">我创建的</div>
          </div>
          <div>
            <div className="text-2xl font-bold">8</div>
            <div className="text-xs opacity-70">待处理</div>
          </div>
        </div>
      </div>
    </div>
  );
};