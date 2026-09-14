import React from 'react';
import { Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

interface UploadAreaProps {
  uploading?: boolean;
  onUpload: (files: File[]) => Promise<void> | void;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ uploading, onUpload }) => {
  // .webp,.mp3,.wav,.mp4,.mov
  const uploadProps: UploadProps = {
    multiple: true,
    showUploadList: false,
    disabled: uploading,
    accept: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif',
    beforeUpload: (file) => {
      void onUpload([file as File]);
      return Upload.LIST_IGNORE;
    },
  };

  return (
    <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
      <Upload.Dragger {...uploadProps} className="bg-transparent">
        <UploadOutlined className="text-gray-400 text-xl" />
        <div className="text-xs text-gray-500 mt-1">
          {uploading ? '正在上传...' : '点击上传'}
        </div>
        <div className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-2 flex-wrap">
          <span>📄 PDF</span>
          <span>📝 Word</span>
          <span>📊 Excel</span>
          <span>🖼️ 图片</span>
          {/* <span>🎵 音频</span>
          <span>🎬 视频</span> */}
        </div>
      </Upload.Dragger>
    </div>
  );
};
