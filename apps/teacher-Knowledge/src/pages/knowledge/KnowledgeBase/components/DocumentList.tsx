// components/DocumentList.tsx
import React from 'react';
import type { Document } from '../types';
import { permissionLabels } from '../constants';
import { useNavigate } from 'react-router-dom';

interface DocumentListProps {
  documents: Document[];
  onDocumentClick?: (doc: Document) => void;
  onDocumentEdit?: (doc: Document) => void;
  title?: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDocumentClick,
  onDocumentEdit,
  title = '📂 最近文档',
}) => {

    const navigate = useNavigate();
    const getFileIcon = (type: Document['type']) => {
        const icons = {
        document: '📄',
        sheet: '📊',
        video: '📹',
        audio: '🎵',
        pdf: '📎',
        link: '🔗',
        };
        return icons[type] || '📄';
    };

    return (
        <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-base">{title}</h3>
            <span className="text-sm text-blue-500 cursor-default cursor-pointer" onClick={() => navigate('/knowledge/allDocuments')}>查看全部文档 →</span>
        </div>
        <div className="space-y-0">
            {documents.map(doc => {
            const permission = permissionLabels[doc.permission];
            return (
                <div
                key={doc.id}
                className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0 cursor-default hover:bg-gray-50 px-2 rounded-lg transition-colors"
                onClick={() => onDocumentClick?.(doc)}
                >
                <span className="text-lg">{getFileIcon(doc.type)}</span>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800 truncate">{doc.title}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span>{doc.author}</span>
                    <span>·</span>
                    <span>{doc.updatedAt}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${permission.color}`}>
                        {permission.label}
                    </span>
                    </div>
                </div>
                <span
                    className="text-sm text-blue-500 cursor-default hover:text-blue-700"
                    onClick={(e) => { e.stopPropagation(); onDocumentEdit?.(doc); }}
                >
                    ✏️ 编辑
                </span>
                </div>
            );
            })}
        </div>
        </div>
    );
};