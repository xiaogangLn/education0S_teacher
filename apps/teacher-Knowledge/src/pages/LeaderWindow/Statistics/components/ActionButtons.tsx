// components/ActionButtons.tsx
import React from 'react';
import { Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';

interface ActionButtonsProps {
  onExport: () => void;
  onViewDetail: () => void;
  onTrendPredict: () => void;
  exporting?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onExport,
  onViewDetail,
  onTrendPredict,
}) => {

  return (
    <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
      <Button
        type="primary"
        className="rounded-full"
        onClick={onViewDetail}
      >
        📊 查看详细报表
      </Button>

      <Button className="rounded-full" onClick={ () => onExport()}>
        📋 导出全校数据
      </Button>

      <Button className="rounded-full" onClick={onTrendPredict}>
        📈 趋势预测
      </Button>
    </div>
  );
};