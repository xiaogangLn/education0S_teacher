// components/PredictionHeader.tsx
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PredictionHeader: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className='flex item-cneter justify-between'>
            <div className='flex-shrink-0'>
                <h1 className="text-2xl font-bold text-gray-800">📈 趋势预测</h1>
                <p className="text-sm text-gray-500">基于历史数据预测未来趋势 · SSE 流式展示预测过程</p>
            </div>
            <div>
                <Button onClick={() => navigate('/leaderWindow')} icon={<ArrowLeftOutlined />} className="rounded-full">返回</Button>
            </div>
        </div>
    );
};