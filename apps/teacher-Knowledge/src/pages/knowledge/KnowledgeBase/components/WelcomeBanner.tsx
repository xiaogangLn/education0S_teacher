// components/WelcomeBanner.tsx
import React from 'react';

interface WelcomeBannerProps {
  userName: string;
  subtitle?: string;
  stats?: { total: number; myCreated: number; pending: number };
  className?: string;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  userName = '老师',
  subtitle,
  stats,
  className = '',
}) => {
  return (
    <div className={`bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white ${className}`}>
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold">📚 欢迎回来，{userName}</h1>
          <p className="opacity-80 text-sm mt-1">
            {subtitle || '知识库'}
          </p>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <div className="text-2xl font-bold">{stats?.total ?? 0}</div>
            <div className="text-xs opacity-70">文档</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats?.myCreated ?? 0}</div>
            <div className="text-xs opacity-70">我创建的</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats?.pending ?? 0}</div>
            <div className="text-xs opacity-70">待处理</div>
          </div>
        </div>
      </div>
    </div>
  );
};