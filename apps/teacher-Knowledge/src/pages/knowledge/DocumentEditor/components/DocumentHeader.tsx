// components/DocumentHeader.tsx
import React from 'react';
import { Button, Input, Tag } from 'antd';
import { PermissionDropdown } from './PermissionDropdown';
import { useDocumentPermission } from '../hooks/useDocumentPermission';
import { DEFAULT_DOCUMENT } from '../constants';
import { useNavigate } from 'react-router-dom';

interface DocumentHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  metadata: {
    author: string;
    date: string;
    source: string;
    difficulty: string;
    knowledgePoints: string[];
    permissionLabel: string;
    permissionIcon: string;
    isConnected: boolean,
    isSaving: boolean
  };
  handleSave: () => void;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  title,
  onTitleChange,
  handleSave,
  metadata,
}) => {
    const navigate = useNavigate();
    const { permission, changePermission } = useDocumentPermission(
        DEFAULT_DOCUMENT.permission
    );
    return (
        <div className="mb-6 pb-4 border-b border-gray-200 flex-shrink-0">
        <div className='flex item-center gap-[10px]'>
            <Input
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                className="!text-[30px] font-bold border-none shadow-none p-0 focus:shadow-none h-[50px]"
                placeholder="输入文档标题..."
            />
            <PermissionDropdown
                currentPermission={permission}
                onChange={changePermission}
                trigger={
                <button className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-lg hover:bg-gray-100 min-w-[100px]">
                    🔐 {permission === 'school' ? '学校' : permission === 'grade' ? '年级' : permission === 'class' ? '班级' : '个人'} ▼
                </button>
                }
            />
            <Button
                className="!h-[50px] px-4 py-1.5 rounded-lg min-w-[120px]"
                onClick={() => {
                    navigate('/knowledge')
                }}
            >
                取消并返回
            </Button>
            <Button
                type="primary"
                className="!h-[50px] rounded-lg  min-w-[100px]"
                onClick={handleSave}
            >
                {metadata.isSaving ? '保存中...' : '📤 发布'}
            </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {metadata.author}
            </span>
            <span>·</span>
            <span>{metadata.date}</span>
            <span>·</span>
            <span className="text-gray-600">📚 {metadata.source}</span>
            <span>·</span>
            <Tag color="blue">{metadata.difficulty}</Tag>
            <span>·</span>
            <Tag color="purple">
            {metadata.permissionIcon} {metadata.permissionLabel}
            </Tag>
            <span className={`text-xs px-2 py-0.5 rounded-full ${metadata.isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {metadata.isConnected ? '● 在线协作' : '○ 离线'}
            </span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
            {metadata.knowledgePoints.map((point, idx) => (
            <Tag key={idx} color="geekblue" className="text-xs">
                {point}
            </Tag>
            ))}
        </div>
        </div>
    );
};