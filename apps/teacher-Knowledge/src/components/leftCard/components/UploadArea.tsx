import React from 'react';
import { UploadOutlined } from '@ant-design/icons';

export const UploadArea: React.FC = () => {
  return (
    <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 transition-colors cursor-pointer">
        <UploadOutlined className="text-gray-400 text-xl" />
        <div className="text-xs text-gray-400 mt-1">拖拽上传</div>
        <div className="text-xs text-gray-400 mt-0.5 flex items-center justify-center gap-2">
          <span>📄 PDF</span>
          <span>📝 Word</span>
          <span>📊 Excel</span>
          <span>🖼️ 图片</span>
          <span>🎵 音频</span>
          <span>🎬 视频</span>
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-2 text-center">
        历史记录 <span className="mx-1">·</span> 今天 2条 <span className="mx-1">·</span> 昨天 5条
      </div>
    </div>
  );
};