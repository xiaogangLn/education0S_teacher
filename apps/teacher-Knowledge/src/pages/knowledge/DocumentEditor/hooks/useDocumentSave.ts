// hooks/useDocumentSave.ts
import { useState, useCallback } from 'react';
import type { DocumentMetadata, DocumentContent } from '../types';
import { knowledgeService } from '@api/index';

export const useDocumentSave = (docId: string, initialMetadata: DocumentMetadata) => {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialMetadata.updatedAt);
  const [error, setError] = useState<string | null>(null);

  const saveDocument = useCallback(async (content: DocumentContent, metadata: DocumentMetadata) => {
    if (!docId) return;
    setIsSaving(true);
    setError(null);
    try {
      await knowledgeService.update(docId, {
        title: metadata.title,
        content: content.html,
        permission: metadata.permission,
      } as any);
      const now = new Date().toLocaleString('zh-CN');
      setLastSavedAt(now);
    } catch (err) {
      setError('保存失败，请重试');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [docId]);

  const autoSave = useCallback(async (content: DocumentContent, metadata: DocumentMetadata) => {
    if (!docId) return;
    try {
      await knowledgeService.update(docId, {
        title: metadata.title,
        content: content.html,
        permission: metadata.permission,
      } as any);
      setLastSavedAt(new Date().toLocaleString('zh-CN'));
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
