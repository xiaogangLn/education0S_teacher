// components/TodoReminder.tsx
import React from 'react';
import type { Todo } from '../types';

interface TodoReminderProps {
  todos: Todo[];
  onTodoClick?: (todo: Todo) => void;
}

export const TodoReminder: React.FC<TodoReminderProps> = ({
  todos,
  onTodoClick,
}) => {
  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-gray-100 text-gray-600',
  };

  const typeLabels = {
    approve: '待审批',
    confirm: '待确认',
    import: '待处理',
  };

  return (
    <div className="bg-white rounded-xl p-4 border-l-4 border-red-500 border border-gray-100">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-base">📋 待办提醒</h3>
        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          {todos.length}
        </span>
      </div>
      <div className="space-y-2">
        {todos.map(todo => (
          <div
            key={todo.id}
            className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 cursor-default hover:bg-gray-50 px-2 rounded-lg transition-colors"
            onClick={() => onTodoClick?.(todo)}
          >
            <span className="text-sm text-gray-700">{todo.title}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[todo.priority]}`}>
              {typeLabels[todo.type]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};