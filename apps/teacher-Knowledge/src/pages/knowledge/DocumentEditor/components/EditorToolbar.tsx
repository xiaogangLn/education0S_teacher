// components/EditorToolbar.tsx
import React from 'react';
import { Tooltip } from 'antd';
import { TOOLBAR_GROUPS } from '../constants';

interface EditorToolbarProps {
  onAction: (actionId: string) => void;
  className?: string;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ onAction, className = '' }) => {
  return (
    <div className={`flex flex-wrap items-center gap-1 p-2 bg-white rounded-xl border border-gray-200 sticky top-14 z-50 shadow-sm ${className}`}>
      {TOOLBAR_GROUPS.map((group, groupIndex) => (
        <React.Fragment key={group.id}>
          {groupIndex > 0 && <div className="w-px h-6 bg-gray-200 mx-1" />}
          <div className="flex items-center gap-0.5">
            {group.items.map(item => (
              <Tooltip key={item.id} title={`${item.label} ${item.shortcut}`}>
                <button
                  className="px-2 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                  onClick={() => onAction(item.id)}
                >
                  <span className="font-medium">{item.icon}</span>
                  <span className="hidden sm:inline ml-0.5 text-xs">{item.label}</span>
                </button>
              </Tooltip>
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};