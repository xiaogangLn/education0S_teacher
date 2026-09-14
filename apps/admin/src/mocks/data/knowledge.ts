// src/mocks/data/knowledge.ts
export interface Document {
    id: string;
    title: string;
    type: string;
    permission: 'school' | 'grade' | 'class' | 'personal';
    category: string;
    creator_name: string;
    created_at: string;
    file_size: number;
    view_count: number;
  }
  
  export const mockDocuments: Document[] = [
    { id: 'd1', title: '2026届教学计划 · 数学', type: 'document', permission: 'grade', category: '教学计划', creator_name: '张老师', created_at: '2026-08-30 14:20', file_size: 2400, view_count: 45 },
    { id: 'd2', title: '月考成绩分析 · 九年级1班', type: 'sheet', permission: 'class', category: '成绩分析', creator_name: '李老师', created_at: '2026-08-29 16:00', file_size: 1800, view_count: 32 },
    { id: 'd3', title: '二次函数教案 · 个人草稿', type: 'document', permission: 'personal', category: '教案', creator_name: '张老师', created_at: '2026-08-28 22:10', file_size: 856, view_count: 5 },
    { id: 'd4', title: '函数图像动态演示', type: 'video', permission: 'school', category: '教学视频', creator_name: '教研组', created_at: '2026-08-27 10:30', file_size: 45000, view_count: 128 },
    { id: 'd5', title: '英语听力训练音频', type: 'audio', permission: 'grade', category: '听力材料', creator_name: '赵老师', created_at: '2026-08-26 15:40', file_size: 12000, view_count: 67 },
  ];