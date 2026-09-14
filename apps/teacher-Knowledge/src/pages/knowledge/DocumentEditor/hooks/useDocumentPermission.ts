// hooks/useDocumentPermission.ts
import { useState, useCallback } from 'react';
import { message } from 'antd';
import { type PermissionType, PERMISSION_CONFIG } from '../types';
import { knowledgeService } from '@api/index';

export const useDocumentPermission = (initialPermission: PermissionType, docId?: string) => {
  const [permission, setPermission] = useState<PermissionType>(initialPermission);
  const [showDropdown, setShowDropdown] = useState(false);

  const changePermission = useCallback(async (newPermission: PermissionType) => {
    const previous = permission;
    setPermission(newPermission);
    setShowDropdown(false);
    if (!docId) return;
    try {
      await knowledgeService.updatePermission(docId, newPermission);
      message.success(`权限已更新为${PERMISSION_CONFIG[newPermission].label}`);
    } catch (error: any) {
      setPermission(previous);
      message.error(error?.message || '权限更新失败');
    }
  }, [docId, permission]);

  const toggleDropdown = useCallback(() => {
    setShowDropdown(prev => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setShowDropdown(false);
  }, []);

  const getPermissionLabel = useCallback(() => {
    return PERMISSION_CONFIG[permission].label;
  }, [permission]);

  const getPermissionIcon = useCallback(() => {
    return PERMISSION_CONFIG[permission].icon;
  }, [permission]);

  return {
    permission,
    setPermission,
    showDropdown,
    changePermission,
    toggleDropdown,
    closeDropdown,
    getPermissionLabel,
    getPermissionIcon,
  };
};
