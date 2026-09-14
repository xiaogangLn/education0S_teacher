// index.tsx - 主页面
import React from 'react';
import { Drawer, Spin } from 'antd';
import { useDashboardData } from './hooks/useDashboardData';
import { useExport } from './hooks/useExport';
import { useExportCenter } from './components/ExportCenter/hooks/useExportCenter';
import { GradeTrendCards } from './components/GradeTrendCards';
import { ActionButtons } from './components/ActionButtons';
import { Label } from '@ui';
import { ExportCenterPage } from './components/ExportCenter';
import { ExportActions } from './components/ExportCenter/components/ExportActions';
import { useNavigate } from 'react-router-dom';

export const LeaderDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    loading,
    gradeTrends,
    classDetails,
    isExportDrawer,
    setIsExportDrawer,
    reload,
    highlights,
  } = useDashboardData();

  const {
    selectedCount,
    exportProgress,
    batchExport,
    generateExportRecord,
    resetSelection,
  } = useExportCenter();


  const { exporting, exportData } = useExport();

  const handleExport = async (format: 'excel' | 'pdf' | 'csv') => {
    await exportData(classDetails, format);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="加载数据中..." />
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 space-y-4">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🏫 校领导全局视图</h1>
          <p className="text-sm text-gray-500">跨年级数据对比 · 趋势分析 · 决策支持</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>📅 2026-09-02</span>
          <span className="w-px h-4 bg-gray-200" />
          <span>🔄 数据实时</span>
          <span className="w-px h-4 bg-gray-200" />
          <span className="cursor-default hover:text-blue-500" onClick={reload}>
            🔄 刷新
          </span>
        </div>
      </div>

        {/* 年级趋势卡片 */}
        <GradeTrendCards trends={gradeTrends} />
        <div className='pt-2'>
          <Label className=''>
            📈 年级概览
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
              <div className="text-sm text-gray-500">📊 年级平均掌握度</div>
              <div className="text-4xl font-bold text-blue-500 mt-2">{highlights.average}%</div>
              <div className="text-sm text-green-500 mt-1">本届班级平均掌握度</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
              <div className="text-sm text-gray-500">📈 最高掌握度</div>
              <div className="text-4xl font-bold text-green-500 mt-2">{highlights.best ? `${highlights.best.masteryRate}%` : '--'}</div>
              <div className="text-sm text-gray-400 mt-1">{highlights.best?.className || '暂无班级'}</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
              <div className="text-sm text-gray-500">⚠️ 需重点关注</div>
              <div className="text-4xl font-bold text-red-500 mt-2">{highlights.worst ? `${highlights.worst.masteryRate}%` : '--'}</div>
              <div className="text-sm text-gray-400 mt-1">{highlights.worst?.className || '暂无班级'}</div>
            </div>
          </div>
        </div>
        

      {/* 操作按钮 */}
      <ActionButtons
        onExport={() => setIsExportDrawer(true)}
        onViewDetail={() => navigate('/leaderWindow/detailedReport')}
        onTrendPredict={() => navigate('/leaderWindow/trendPrediction')}
        exporting={exporting}
      />

      <Drawer
        title={
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">📋 数据导出中心</h1>
              <p className="text-sm text-gray-500">
                选择数据范围与格式 · 一键导出 
                <span className='text-sm text-gray-400 ml-4'>更新时间 {new Date().toLocaleDateString('zh-CN')}</span>
              </p>
              
            </div>
            <div>
              {/* 操作按钮 */}
              <ExportActions
                  onBatchExport={batchExport}
                  onGenerateRecord={generateExportRecord}
                  onReset={resetSelection}
                  exporting={exporting}
                  progress={exportProgress}
                  selectedCount={selectedCount}
                  disabled={selectedCount === 0}
              />
            </div>
          </div>
        }
        placement={'right'}
        width="50%"
        closable={false}
        onClose={() => setIsExportDrawer(false)}
        open={isExportDrawer}
      >
        <ExportCenterPage />
      </Drawer> 


      {/* 底部 */}
      <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
        EducationOS V8.0 · 校领导全局视图 · 数据每周日 03:00 自动更新
      </div>
    </div>
  );
};

export default LeaderDashboardPage;