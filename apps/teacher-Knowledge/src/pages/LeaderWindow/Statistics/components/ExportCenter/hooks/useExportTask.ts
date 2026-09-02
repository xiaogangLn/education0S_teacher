import { useState, useCallback } from 'react';
import type { ExportTask } from '../types';

export const useExportTask = () => {
  const [tasks, setTasks] = useState<ExportTask[]>([]);

  const addTask = useCallback((task: ExportTask) => {
    setTasks(prev => [task, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<ExportTask>) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, ...updates } : task
    ));
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks(prev => prev.filter(task => task.status === 'pending' || task.status === 'processing'));
  }, []);

  const getTaskStatus = useCallback((task: ExportTask) => {
    const statusMap = {
      pending: { color: 'text-yellow-500', label: '等待中' },
      processing: { color: 'text-blue-500', label: '处理中' },
      completed: { color: 'text-green-500', label: '已完成' },
      failed: { color: 'text-red-500', label: '失败' },
    };
    return statusMap[task.status];
  }, []);

  return {
    tasks,
    addTask,
    updateTask,
    removeTask,
    clearCompleted,
    getTaskStatus,
  };
};