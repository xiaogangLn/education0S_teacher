// components/StudentHeader.tsx
import React from 'react';
import { Tag, Badge } from 'antd';
import type { StudentInfo } from '../types';

interface StudentHeaderProps {
  student: StudentInfo;
}

const statusMap = {
  excellent: { color: 'success', text: '优秀' },
  good: { color: 'processing', text: '良好' },
  warning: { color: 'warning', text: '需关注' },
  danger: { color: 'error', text: '需补习' },
};

export const StudentHeader: React.FC<StudentHeaderProps> = ({ student }) => {
  const status = statusMap[student.status] || statusMap.good;

  return (
    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl mb-4">
      <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
        {student.name.charAt(0)}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold">{student.name}</span>
          <Tag color={status.color}>{status.text}</Tag>
          <Badge count={`排名 ${student.rank}/${student.totalStudents}`} style={{ backgroundColor: '#6b7280' }} />
        </div>
        <div className="text-gray-500 text-sm">
          {student.grade} · {student.class} · 学号 {student.studentNo}
        </div>
      </div>
      <div className="flex gap-2">
        <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600 cursor-default">
          📂 当前班级
        </span>
      </div>
    </div>
  );
};