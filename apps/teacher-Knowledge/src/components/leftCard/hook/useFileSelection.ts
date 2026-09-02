import { useState, useMemo, useCallback } from 'react';
import type { FileItem } from '../types';
import { mockFiles } from '../constants';

export const useFileSelection = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [searchResults, setSearchResults] = useState<FileItem[]>([]);
  const [tempSelectedIds, setTempSelectedIds] = useState<Set<string>>(new Set());
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);

  // 根据分类获取文件列表
  const getFilesByCategory = useCallback((category: string): FileItem[] => {
    if (category === 'all') return mockFiles;
    return mockFiles.filter(file => file.category === category);
  }, []);

  // 当前显示的文件列表
  const currentFiles = useMemo(() => {
    if (searchKeyword.trim()) {
      return searchResults;
    }
    return getFilesByCategory(selectedCategory);
  }, [searchKeyword, searchResults, selectedCategory, getFilesByCategory]);

  // 处理搜索
  const handleSearch = useCallback((value: string) => {
    setSearchKeyword(value);
    if (value.trim()) {
      const results = mockFiles.filter(file =>
        file.name.toLowerCase().includes(value.toLowerCase()) ||
        file.creator.includes(value) ||
        file.type.includes(value)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, []);

  // 清除搜索
  const clearSearch = useCallback(() => {
    setSearchKeyword('');
    setSearchResults([]);
    setSearchDrawerOpen(false);
  }, []);

  // 打开搜索抽屉
  const openSearchDrawer = useCallback(() => {
    setSearchDrawerOpen(true);
    setTempSelectedIds(new Set(selectedFileIds));
  }, [selectedFileIds]);

  // 关闭搜索抽屉（不保存）
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
    if (category === 'all') return mockFiles.length;
    return mockFiles.filter(f => f.category === category).length;
  }, []);

  const allChecked = currentFiles.length > 0 && currentFiles.every(f => tempSelectedIds.has(f.id));
  const indeterminate = currentFiles.some(f => tempSelectedIds.has(f.id)) && !allChecked;

  return {
    // 状态
    searchKeyword,
    selectedCategory,
    selectedFileIds,
    searchResults,
    tempSelectedIds,
    searchDrawerOpen,
    currentFiles,
    allChecked,
    indeterminate,
    // 方法
    handleSearch,
    clearSearch,
    openSearchDrawer,
    closeSearchDrawer,
    handleCategoryClick,
    handleTempSelectAll,
    handleTempFileCheck,
    handleConfirm,
    handleMainSelectAll,
    getCategoryCount,
    getFilesByCategory,
  };
};