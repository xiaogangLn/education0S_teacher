// index.tsx - 主页面
import React from 'react';
import { useExportCenter } from './hooks/useExportCenter';
import { ExportScope } from './components/ExportScope';
import { ExportFormat } from './components/ExportFormat';
import { ExportTimeRange } from './components/ExportTimeRange';
import { ExportOptions } from './components/ExportOptions';
import { formatOptions, timeRangeOptions, exportOptions } from './constants';

const ExportCenterPage: React.FC = () => {
  const {
    scopes,
    selectedFormat,
    selectedTimeRange,
    selectedScopes,
    selectedCount,
    exporting,
    exportProgress,
    exportTasks,
    toggleScope,
    toggleAllScopes,
    updateFormat,
    updateTimeRange,
    batchExport,
    exportOption,
    generateExportRecord,
    resetSelection,
  } = useExportCenter();

  return (
    <div className="mx-auto p-4 space-y-4">      

      {/* 主布局 */}
        {/* 左侧：导出范围 + 格式 + 时间 */}
        <div className="lg:col-span-2 space-y-4">
          <ExportScope
            scopes={scopes}
            onToggle={toggleScope}
            onToggleAll={toggleAllScopes}
            selectedCount={selectedCount}
            totalCount={scopes.length}
          />

          <ExportFormat
            formats={formatOptions}
            selectedFormat={selectedFormat}
            onSelect={updateFormat}
          />

          <ExportTimeRange
            options={timeRangeOptions}
            selectedRange={selectedTimeRange}
            onSelect={updateTimeRange}
          />
        </div>

        {/* 右侧：导出选项 */}
        <div className="space-y-4">
          <ExportOptions
            options={exportOptions}
            onExport={exportOption}
            format={selectedFormat}
            exporting={exporting}
            disabled={selectedCount === 0}
          />
        </div>

        {/* 底部 */}
        <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
            EducationOS V8.0 · 数据导出中心 · 支持多格式导出
        </div>
    </div>
  );
};

export {
    ExportCenterPage
};