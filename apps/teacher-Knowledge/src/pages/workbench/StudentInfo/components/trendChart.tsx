// components/TrendChart.tsx
import React from 'react';
import { Card } from 'antd';

interface TrendDataPoint {
    label: string;
    score: number;
}

interface TrendChartProps {
    data: TrendDataPoint[];
    maxScore?: number;
    title?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({
    data,
    maxScore = 100,
    title = '数学成绩趋势',
}) => {
    const maxVal = Math.max(maxScore, ...data.map(d => d.score)) + 10;

    return (
        <Card size="small" className="mb-4">
        <div className="font-semibold text-sm mb-3">{title}</div>
        <div className="flex items-end justify-between h-32 gap-2 px-1">
            {data.map((item, index) => {
            const height = (item.score / maxVal) * 100;
            const isLast = index === data.length - 1;
            return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs font-bold text-gray-700">{item.score}</div>
                <div
                    className={`w-full rounded-t transition-all duration-500 ${
                    isLast ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ height: `${Math.max(height, 4)}%`, minHeight: '8px' }}
                />
                <div className="text-xs text-gray-400">{item.label}</div>
                </div>
            );
            })}
        </div>
        <div className="flex justify-center gap-4 mt-3 text-xs text-gray-400">
            <span><span className="inline-block w-3 h-3 bg-blue-500 rounded-sm mr-1"></span> 数学</span>
            <span><span className="inline-block w-3 h-3 bg-green-500 rounded-sm mr-1"></span> 期末</span>
        </div>
        </Card>
    );
};