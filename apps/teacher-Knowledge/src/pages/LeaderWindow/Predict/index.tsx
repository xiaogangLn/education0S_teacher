// index.tsx - 主页面
import React from 'react';
import { Spin, Space, Button } from 'antd';
import { useReportData } from './hooks/useReportData';
import { useReportPagination } from './hooks/useReportPagination';
import { ReportStats } from './components/ReportStats';
import { ReportFilter } from './components/ReportFilter';
import { ReportTable } from './components/ReportTable';
import { ReportPagination } from './components/ReportPagination';
import { dimensionOptions, PAGE_SIZE } from './constants';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useOrgContext } from '@/hooks/useOrgContext';

function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  const headers = ['班级', '年级', '学科', '掌握度', '优秀率', '待提升率', '趋势'];
  const lines = [
    headers.join(','),
    ...rows.map((item) =>
      [item.className, item.grade, item.subject, item.masteryRate, item.excellentRate, item.improvementRate, item.trend]
        .map((value) => `"${String(value ?? '')}"`)
        .join(','),
    ),
  ];
  const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

interface DetailedReportPageProps {
  onRowClick?: (record: any) => void;
}

export const DetailedReportPage: React.FC<DetailedReportPageProps> = ({
  onRowClick,
}) => {
  const {
    loading,
    filteredData,
    filter,
    stats,
    updateFilter,
    resetFilter,
    reload,
    classOptions,
    subjectOptions,
  } = useReportData();
  const org = useOrgContext();
  const cohortLabel = org.enrollmentYear
    ? (String(org.enrollmentYear).match(/^(\d{4})-(\d{4})$/) ? `${org.enrollmentYear.match(/^(\d{4})/)?.[1]}届` : `${org.enrollmentYear}届`)
    : '未选择届别';

  const {
    currentPage,
    totalPages,
    pageSize,
    paginatedData,
    startIndex,
    endIndex,
    totalCount,
    goToPage,
    nextPage,
    prevPage,
  } = useReportPagination(filteredData, PAGE_SIZE);
  const navigate = useNavigate();

  const handleExport = () => {
    downloadCsv(`学情报表-${cohortLabel}.csv`, filteredData as any);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="加载数据中..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full mx-auto">
      {/* 页面标题 */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📊 查看详细报表</h1>
          <p className="text-sm text-gray-500">
            全年级各班级详细数据 · 学科对比 · 趋势明细 · {cohortLabel}
            
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>📅 2026-09-02</span>
            <span className="w-px h-4 bg-gray-200 ml-2" />
            <span className="cursor-default hover:text-blue-500 ml-2" onClick={reload}>
                🔄 刷新
            </span>
            <Button 
                icon={<ArrowLeftOutlined />}  
                onClick={() => navigate('/leaderWindow')}
            >
                返回
            </Button>
        </div>
      </div>

      {/* 统计概览 */}
      <ReportStats stats={stats} loading={loading}  />

      {/* 主卡片 */}
      <div className="lex flex-col h-full bg-white rounded-xl border border-gray-100 overflow-hidden flex-1">
        {/* 标题栏 */}
        <div className="flex-shrink-0 p-4 border-b border-gray-100 flex justify-between items-center flex-wrap gap-2">
          <div>
            <span className="font-semibold text-base">📋 年级详细报表 · {cohortLabel}</span>
            <span className="text-sm text-gray-400 ml-3">
              共 {totalCount} 条记录
            </span>
          </div>
          <Space>
            <span className="text-xs text-gray-400">📅 2026-08-30</span>
            <span className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">
              📊 数据实时
            </span>
          </Space>
        </div>

        {/* 筛选栏 */}
        <div className="px-4 pt-4 flex-shrink-0">
          <ReportFilter
            filter={filter}
            onFilterChange={updateFilter}
            onReset={resetFilter}
            onExport={handleExport}
            gradeOptions={classOptions}
            subjectOptions={subjectOptions}
            dimensionOptions={dimensionOptions}
            loading={loading}
          />
        </div>

        {/* 表格 */}
        <div className="px-4 max-h-[420px] flex-1 overflow-y-auto">
          <ReportTable
            data={paginatedData}
            loading={loading}
            onRowClick={onRowClick}
          />
        </div>

        {/* 分页 */}
        <div className="px-4 pb-4 flex-shrink-0">
          <ReportPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            startIndex={startIndex}
            endIndex={endIndex}
            onPrev={prevPage}
            onNext={nextPage}
            onPageChange={goToPage}
          />
        </div>
      </div>

      {/* 底部 */}
      <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
        EducationOS V8.0 · 详细报表 · 数据每周日 03:00 自动更新
      </div>
    </div>
  );
};

export default DetailedReportPage;