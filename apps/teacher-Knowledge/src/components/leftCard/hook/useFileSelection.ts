// components/leftCard/hook/useFileSelection.ts
import { useState, useMemo, useCallback, useEffect } from 'react';
import type { FileItem } from '../types';

// 模拟数据 - 包含上传的文件和搜索选中的文件
const mockFiles: FileItem[] = [
  { id: '1', name: '2026届教学计划 · 数学', type: 'document', category: 'material', size: '2.4MB', updatedAt: '2026-08-30 14:20', creator: '张老师', permission: 'grade' },
  { id: '2', name: '月考成绩分析 · 1班', type: 'sheet', category: 'material', size: '1.8MB', updatedAt: '2026-08-29 16:00', creator: '李老师', permission: 'class' },
  { id: '3', name: '二次函数教案 · 草稿', type: 'document', category: 'draft', size: '856KB', updatedAt: '2026-08-28 22:10', creator: '张老师', permission: 'personal' },
  // ... 更多文件
];

// 搜索选中的文件（默认选中）
const defaultSelectedFiles: FileItem[] = [
  { id: 's1', name: '教案模板', type: 'document', category: 'template', size: '12KB', updatedAt: '2026-09-01 10:00', creator: '系统', permission: 'personal' },
  { id: 's2', name: '课件模板', type: 'document', category: 'template', size: '8KB', updatedAt: '2026-09-01 10:00', creator: '系统', permission: 'personal' },
];

export const useFileSelection = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [searchResults, setSearchResults] = useState<FileItem[]>([]);
  const [tempSelectedIds, setTempSelectedIds] = useState<Set<string>>(new Set());
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);  // 上传的文件
  const [searchSelectedFiles, setSearchSelectedFiles] = useState<FileItem[]>(defaultSelectedFiles);  // 搜索选中的文件

  // 合并文件列表：搜索选中的 + 上传的
  const allFiles = useMemo(() => {
    return [...searchSelectedFiles, ...uploadedFiles];
  }, [searchSelectedFiles, uploadedFiles]);

  // 根据分类获取文件列表
  const getFilesByCategory = useCallback((category: string): FileItem[] => {
    if (category === 'all') return allFiles;
    return allFiles.filter(file => file.category === category);
  }, [allFiles]);

  // 当前显示的文件列表
  const currentFiles = useMemo(() => {
    if (searchKeyword.trim()) {
      return searchResults;
    }
    return getFilesByCategory(selectedCategory);
  }, [searchKeyword, searchResults, selectedCategory, getFilesByCategory]);

  // 默认选中搜索选中的文件
  useEffect(() => {
    const ids = searchSelectedFiles.map(f => f.id);
    setSelectedFileIds(new Set(ids));
  }, [searchSelectedFiles]);

  // 处理搜索
  const handleSearch = useCallback((value: string) => {
    setSearchKeyword(value);
    if (value.trim()) {
      const results = allFiles.filter(file =>
        file.name.toLowerCase().includes(value.toLowerCase()) ||
        file.creator.includes(value) ||
        file.type.includes(value)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [allFiles]);

  // 打开搜索抽屉
  const openSearchDrawer = useCallback(() => {
    setSearchDrawerOpen(true);
    setTempSelectedIds(new Set(selectedFileIds));
  }, [selectedFileIds]);

  // 关闭搜索抽屉
  const closeSearchDrawer = useCallback(() => {
    setSearchDrawerOpen(false);
  }, []);

  // 点击分类Tab
  const handleCategoryClick = useCallback((category: string) => {
    setSelectedCategory(category);
    setSearchKeyword('');
    setSearchResults([]);
  }, []);

  // 全选/取消全选（临时状态）
  const handleTempSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const ids = currentFiles.map(f => f.id);
      setTempSelectedIds(new Set(ids));
    } else {
      setTempSelectedIds(new Set());
    }
  }, [currentFiles]);

  // 单个文件勾选（临时状态）
  const handleTempFileCheck = useCallback((fileId: string, checked: boolean) => {
    const newSet = new Set(tempSelectedIds);
    if (checked) {
      newSet.add(fileId);
    } else {
      newSet.delete(fileId);
    }
    setTempSelectedIds(newSet);
  }, [tempSelectedIds]);

  // 确认选择
  const handleConfirm = useCallback((onFileSelect?: (ids: string[]) => void) => {
    setSelectedFileIds(new Set(tempSelectedIds));
    onFileSelect?.(Array.from(tempSelectedIds));
    setSearchDrawerOpen(false);
  }, [tempSelectedIds]);

  // 主列表全选/取消全选
  const handleMainSelectAll = useCallback((onFileSelect?: (ids: string[]) => void) => {
    const allChecked = currentFiles.every(f => selectedFileIds.has(f.id));
    const ids = currentFiles.map(f => f.id);
    if (allChecked) {
      const newSet = new Set(selectedFileIds);
      ids.forEach(id => newSet.delete(id));
      setSelectedFileIds(newSet);
      onFileSelect?.(Array.from(newSet));
    } else {
      const newSet = new Set(selectedFileIds);
      ids.forEach(id => newSet.add(id));
      setSelectedFileIds(newSet);
      onFileSelect?.(Array.from(newSet));
    }
  }, [currentFiles, selectedFileIds]);

  // 获取分类数量
  const getCategoryCount = useCallback((category: string) => {
    if (category === 'all') return allFiles.length;
    return allFiles.filter(f => f.category === category).length;
  }, [allFiles]);

  // 获取选中的文件列表
  const getSelectedFiles = useCallback(() => {
    return allFiles.filter(f => selectedFileIds.has(f.id));
  }, [allFiles, selectedFileIds]);

  const allChecked = currentFiles.length > 0 && currentFiles.every(f => tempSelectedIds.has(f.id));
  const indeterminate = currentFiles.some(f => tempSelectedIds.has(f.id)) && !allChecked;

  return {
    searchKeyword,
    selectedCategory,
    selectedFileIds,
    tempSelectedIds,
    searchDrawerOpen,
    currentFiles,
    allFiles,
    allChecked,
    indeterminate,
    searchSelectedFiles,
    uploadedFiles,
    handleSearch,
    openSearchDrawer,
    closeSearchDrawer,
    handleCategoryClick,
    handleTempSelectAll,
    handleTempFileCheck,
    handleConfirm,
    handleMainSelectAll,
    getCategoryCount,
    getSelectedFiles,
    setUploadedFiles,
  };
};