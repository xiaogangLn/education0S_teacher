// hooks/useDocumentSelection.ts
import { useState, useCallback } from 'react';

export const useDocumentSelection = (documentIds: string[]) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isAllSelected = documentIds.length > 0 && documentIds.every(id => selectedIds.has(id));
  const isIndeterminate = documentIds.some(id => selectedIds.has(id)) && !isAllSelected;

  const toggleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(documentIds));
    } else {
      setSelectedIds(new Set());
    }
  }, [documentIds]);

  const toggleSelect = useCallback((id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  }, [selectedIds]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const getSelectedCount = useCallback(() => selectedIds.size, [selectedIds]);

  return {
    selectedIds,
    isAllSelected,
    isIndeterminate,
    toggleSelectAll,
    toggleSelect,
    clearSelection,
    getSelectedCount,
  };
};