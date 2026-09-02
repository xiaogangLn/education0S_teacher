// hooks/useDocumentSave.ts
import { useState, useCallback } from 'react';
import type { DocumentMetadata, DocumentContent } from '../types';

export const useDocumentSave = (docId: string, initialMetadata: DocumentMetadata) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialMetadata.updatedAt);
  const [error, setError] = useState<string | null>(null);

  const saveDocument = useCallback(async (content: DocumentContent, metadata: DocumentMetadata) => {
    setIsSaving(true);
    setError(null);
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 500));
      const now = new Date().toLocaleString('zh-CN');
      setLastSavedAt(now);
      console.log('文档已保存:', { docId, content, metadata, savedAt: now });
    } catch (err) {
      setError('保存失败，请重试');
      console.error('保存失败:', err);
    } finally {
      setIsSaving(false);
    }
  }, [docId]);

  const autoSave = useCallback(async (content: DocumentContent, metadata: DocumentMetadata) => {
    // 自动保存（静默）
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const now = new Date().toLocaleString('zh-CN');
      setLastSavedAt(now);
      console.log('自动保存:', { docId, savedAt: now });
    } catch (err) {
      console.warn('自动保存失败:', err);
    }
  }, [docId]);

  return {
    isSaving,
    lastSavedAt,
    error,
    saveDocument,
    autoSave,
  };
};