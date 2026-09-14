import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { message } from 'antd';
import { useDebounceFn } from 'ahooks';
import type { FileItem } from '../types';
import { knowledgeService, type DocumentItem } from '@api/index';
import { extractPayload, formatDateTime, normalizePermission } from '@/utils/knowledgeMapper';
import { useOrgContext } from '@/hooks/useOrgContext';
import { loadPersistedUser } from '@/utils/currentUser';
import { useAppSelector } from '@/store/hooks';

const SEARCH_DEBOUNCE_MS = 300;

const TEXTBOOK_TYPES = new Set(['textbook_book', 'textbook_chapter', 'textbook_catalog']);

function formatSize(bytes?: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function resolveTeacherSubjects(user?: { subjects?: string[] } | null): string[] {
  const list = (user?.subjects || [])
    .map((item) => String(item).trim())
    .filter(Boolean);
  return list.length ? list : ['数学'];
}

function mapDocument(item: DocumentItem): FileItem {
  const rawType = item.type || 'document';
  const type = (TEXTBOOK_TYPES.has(rawType) ? 'document' : rawType) as FileItem['type'];
  return {
    id: item.id,
    name: item.title,
    type,
    category: item.category || 'material',
    size: formatSize(item.file_size),
    updatedAt: formatDateTime(item.created_at),
    creator: item.creator_name || '',
    permission: (normalizePermission(item.permission) === 'research' ? 'school' : normalizePermission(item.permission)) as FileItem['permission'],
  };
}

function fileTypeFromName(name: string): FileItem['type'] {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'word';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'sheet';
  if (['ppt', 'pptx'].includes(ext)) return 'ppt';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image';
  if (['mp3', 'wav', 'm4a', 'aac'].includes(ext)) return 'audio';
  if (['mp4', 'mov', 'avi', 'webm'].includes(ext)) return 'video';
  return 'document';
}

function mergeFiles(...lists: FileItem[][]) {
  const map = new Map<string, FileItem>();
  lists.flat().forEach((file) => map.set(file.id, file));
  return Array.from(map.values());
}

export const useFileSelection = (initialPlannedFiles?: FileItem[]) => {
  const org = useOrgContext();
  const currentUser = useAppSelector((state) => state.user.current);
  const teacherSubjects = useMemo(
    () => resolveTeacherSubjects(currentUser || loadPersistedUser()),
    [currentUser],
  );
  const subjectParam = teacherSubjects.join(',');
  const scopeLabel = [org.gradeName, teacherSubjects.join('/')].filter(Boolean).join(' · ');

  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [searchResults, setSearchResults] = useState<FileItem[]>([]);
  const [tempSelectedIds, setTempSelectedIds] = useState<Set<string>>(new Set());
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);
  const [searchSelectedFiles, setSearchSelectedFiles] = useState<FileItem[]>([]);
  const [libraryFiles, setLibraryFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const searchSeqRef = useRef(0);

  useEffect(() => {
    const load = async () => {
      try {
        const listRes = await knowledgeService.getList({
          page: 1,
          page_size: 50,
          sort_by: 'created_at',
          sort_order: 'desc',
          grade_id: org.gradeId,
          subject: subjectParam,
          exclude_type: 'textbook_chapter',
        });
        const listPayload = extractPayload<{ items?: DocumentItem[] }>(listRes);
        setLibraryFiles((listPayload?.items || []).map(mapDocument));
      } catch {
        setLibraryFiles([]);
      }
    };
    load();
  }, [org.gradeId, subjectParam]);

  const restoreSig = (initialPlannedFiles || []).map((file) => file.id).join('|');
  useEffect(() => {
    if (initialPlannedFiles === undefined) return;
    setSearchSelectedFiles(initialPlannedFiles);
    setSelectedFileIds(new Set(initialPlannedFiles.map((file) => file.id)));
  }, [restoreSig]);

  const plannedFiles = useMemo(
    () => mergeFiles(searchSelectedFiles, uploadedFiles),
    [searchSelectedFiles, uploadedFiles],
  );

  const drawerFiles = useMemo(() => {
    if (searchKeyword.trim()) return searchResults;
    if (selectedCategory === 'all') return libraryFiles;
    return libraryFiles.filter((file) => file.category === selectedCategory);
  }, [searchKeyword, searchResults, selectedCategory, libraryFiles]);

  const fetchSearch = useCallback(async (value: string) => {
    const seq = ++searchSeqRef.current;
    setSearchKeyword(value);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const payload = extractPayload<{ items?: DocumentItem[] }>(
        await knowledgeService.getList({
          page: 1,
          page_size: 50,
          keyword: value,
          grade_id: org.gradeId,
          subject: subjectParam,
        }),
      );
      if (seq !== searchSeqRef.current) return;
      setSearchResults((payload?.items || []).map(mapDocument));
    } catch {
      if (seq !== searchSeqRef.current) return;
      const keyword = value.toLowerCase();
      setSearchResults(
        libraryFiles.filter(
          (file) =>
            file.name.toLowerCase().includes(keyword) ||
            file.creator.includes(value) ||
            file.type.includes(keyword),
        ),
      );
    }
  }, [libraryFiles, org.gradeId, subjectParam]);

  const { run: debouncedFetchSearch, cancel: cancelDebouncedFetch } = useDebounceFn(fetchSearch, {
    wait: SEARCH_DEBOUNCE_MS,
  });

  /** 输入变更：接口与列表筛选关键词均防抖，避免首字母立刻切到空结果 */
  const handleSearchChange = useCallback((value: string) => {
    if (!value.trim()) {
      cancelDebouncedFetch();
      searchSeqRef.current += 1;
      setSearchKeyword('');
      setSearchResults([]);
      return;
    }
    debouncedFetchSearch(value);
  }, [cancelDebouncedFetch, debouncedFetchSearch]);

  /** 回车 / 清空：立即请求 */
  const handleSearch = useCallback((value: string) => {
    cancelDebouncedFetch();
    void fetchSearch(value);
  }, [cancelDebouncedFetch, fetchSearch]);

  const openSearchDrawer = useCallback(() => {
    setSearchDrawerOpen(true);
    setTempSelectedIds(new Set(searchSelectedFiles.map((file) => file.id)));
  }, [searchSelectedFiles]);

  const closeSearchDrawer = useCallback(() => {
    setSearchDrawerOpen(false);
  }, []);

  const handleCategoryClick = useCallback((category: string) => {
    cancelDebouncedFetch();
    searchSeqRef.current += 1;
    setSelectedCategory(category);
    setSearchKeyword('');
    setSearchResults([]);
  }, [cancelDebouncedFetch]);

  const handleTempSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setTempSelectedIds(new Set(drawerFiles.map((file) => file.id)));
    } else {
      setTempSelectedIds(new Set());
    }
  }, [drawerFiles]);

  const handleTempFileCheck = useCallback((fileId: string, checked: boolean) => {
    setTempSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(fileId);
      else next.delete(fileId);
      return next;
    });
  }, []);

  const handleConfirm = useCallback((onFileSelect?: (ids: string[]) => void) => {
    const source = mergeFiles(libraryFiles, searchResults, searchSelectedFiles);
    const selected = source.filter((file) => tempSelectedIds.has(file.id));
    setSearchSelectedFiles(selected);
    setSelectedFileIds((prev) => {
      const next = new Set(uploadedFiles.map((file) => file.id).filter((id) => prev.has(id)));
      selected.forEach((file) => next.add(file.id));
      return next;
    });
    onFileSelect?.(Array.from(new Set([...selected.map((file) => file.id), ...uploadedFiles.map((file) => file.id)])));
    setSearchDrawerOpen(false);
  }, [tempSelectedIds, libraryFiles, searchResults, searchSelectedFiles, uploadedFiles]);

  const handlePlannedFileCheck = useCallback((fileId: string, checked: boolean) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(fileId);
      else next.delete(fileId);
      return next;
    });
  }, []);

  const handleMainSelectAll = useCallback((onFileSelect?: (ids: string[]) => void) => {
    const ids = plannedFiles.map((file) => file.id);
    const allChecked = ids.length > 0 && ids.every((id) => selectedFileIds.has(id));
    const next = allChecked ? new Set<string>() : new Set(ids);
    setSelectedFileIds(next);
    onFileSelect?.(Array.from(next));
  }, [plannedFiles, selectedFileIds]);

  const handleUpload = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    const user = currentUser || loadPersistedUser();
    const added: FileItem[] = [];
    try {
      for (const file of files) {
        const type = fileTypeFromName(file.name);
        let mapped: FileItem | null = null;
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('title', file.name.replace(/\.[^.]+$/, ''));
          formData.append('type', type);
          formData.append('permission', 'personal');
          formData.append('category', 'material');
          if (org.gradeId) formData.append('grade_id', org.gradeId);
          if (teacherSubjects[0]) formData.append('subject', teacherSubjects[0]);
          const created = extractPayload<any>(await knowledgeService.create(formData));
          const doc = created?.document || created;
          mapped = mapDocument({
            id: String(doc.id || `upload-${Date.now()}`),
            title: doc.title || file.name,
            type,
            permission: doc.permission || 'personal',
            category: doc.category || 'material',
            file_size: doc.file_size || file.size,
            file_url: doc.file_url || '',
            creator_name: doc.creator_name || user?.realName || '我',
            creator_id: doc.creator_id || user?.id || '',
            created_at: doc.created_at || new Date().toISOString(),
            view_count: 0,
            download_count: 0,
            is_favorited: false,
            status: 'active',
          });
        } catch {
          mapped = {
            id: `upload-${Date.now()}-${file.name}`,
            name: file.name,
            type,
            category: 'material',
            size: formatSize(file.size),
            updatedAt: formatDateTime(new Date().toISOString()),
            creator: user?.realName || '我',
            permission: 'personal',
          };
        }
        added.push(mapped);
      }
      setUploadedFiles((prev) => mergeFiles(prev, added));
      setLibraryFiles((prev) => mergeFiles(prev, added));
      setSelectedFileIds((prev) => {
        const next = new Set(prev);
        added.forEach((file) => next.add(file.id));
        return next;
      });
      message.success(`已加入计划使用（${added.length} 个文件）`);
    } catch (error: any) {
      message.error(error?.message || '上传失败');
    } finally {
      setUploading(false);
    }
  }, [org.gradeId, teacherSubjects, currentUser]);

  const getCategoryCount = useCallback((category: string) => {
    if (category === 'all') return libraryFiles.length;
    return libraryFiles.filter((file) => file.category === category).length;
  }, [libraryFiles]);

  const getSelectedFiles = useCallback(() => {
    return plannedFiles.filter((file) => selectedFileIds.has(file.id));
  }, [plannedFiles, selectedFileIds]);

  const allChecked = drawerFiles.length > 0 && drawerFiles.every((file) => tempSelectedIds.has(file.id));
  const indeterminate = drawerFiles.some((file) => tempSelectedIds.has(file.id)) && !allChecked;

  return {
    searchKeyword,
    selectedCategory,
    selectedFileIds,
    tempSelectedIds,
    searchDrawerOpen,
    plannedFiles,
    drawerFiles,
    allChecked,
    indeterminate,
    uploading,
    scopeLabel,
    handleSearch,
    handleSearchChange,
    cancelPendingSearch: cancelDebouncedFetch,
    openSearchDrawer,
    closeSearchDrawer,
    handleCategoryClick,
    handleTempSelectAll,
    handleTempFileCheck,
    handleConfirm,
    handlePlannedFileCheck,
    handleMainSelectAll,
    handleUpload,
    getCategoryCount,
    getSelectedFiles,
  };
};
