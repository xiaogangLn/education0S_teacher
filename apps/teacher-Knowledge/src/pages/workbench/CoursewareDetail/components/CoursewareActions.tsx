// components/CoursewareActions.tsx
import React from 'react';
import { Button, Card, Space } from 'antd';
import {
  DownloadOutlined,
  EyeOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';

interface CoursewareActionsProps {
  onDownload: () => void;
  onPreview: () => void;
  onShare: () => void;
  loading?: boolean;
}

export const CoursewareActions: React.FC<CoursewareActionsProps> = ({
  onDownload,
  onPreview,
  onShare,
  loading = false,
}) => {
  return (
    <Card size="small" className="mb-4 flex-shrink-0">
      <Space size="middle" wrap>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={onDownload}
          loading={loading}
          className="rounded-full"
        >
          下载课件
        </Button>
        {/* <Button
          icon={<EyeOutlined />}
          onClick={onPreview}
          className="rounded-full"
        >
          在线预览
        </Button>
        <Button
          icon={<ShareAltOutlined />}
          onClick={onShare}
          className="rounded-full"
        >
          分享
        </Button> */}
      </Space>
    </Card>
  );
};