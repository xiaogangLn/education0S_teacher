// hooks/useDocumentPermission.ts
import { useState, useCallback } from 'react';
import { type PermissionType, PERMISSION_CONFIG } from '../types';

export const useDocumentPermission = (initialPermission: PermissionType) => {
  const [permission, setPermission] = useState<PermissionType>(initialPermission);
  const [showDropdown, setShowDropdown] = useState(false);

  const changePermission = useCallback((newPermission: PermissionType) => {
    setPermission(newPermission);
    setShowDropdown(false);
    console.log('权限已更新:', newPermission, PERMISSION_CONFIG[newPermission].label);
  }, []);

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
    showDropdown,
    changePermission,
    toggleDropdown,
    closeDropdown,
    getPermissionLabel,
    getPermissionIcon,
  };
};