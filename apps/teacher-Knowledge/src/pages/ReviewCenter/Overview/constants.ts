// constants.ts
import type { ReviewItem, ReviewStats, FilterState } from './types';

export const mockReviews: ReviewItem[] = [
  {
    id: '1',
    title: '导数的几何意义教案',
    author: '张老师',
    grade: '高二',
    className: '高二(3)班',
    subject: '数学',
    课时: 3,
    status: 'pending',
    submittedAt: '2026-09-02 14:35',
    description: '包含学情分析、五阶段完整生成内容，已标注AI生成部分',
    aiGenerated: true,
  },
  {
    id: '2',
    title: '二次函数单元教案',
    author: '李老师',
    grade: '高二',
    className: '高二(1)班',
    subject: '数学',
    课时: 2,
    status: 'reviewing',
    submittedAt: '2026-09-02 10:20',
    description: '已审阅，等待最终确认',
    aiGenerated: false,
  },
  {
    id: '3',
    title: '英语阅读理解专项计划',
    author: '赵老师',
    grade: '高二',
    className: '高二(3)班',
    subject: '英语',
    课时: 4,
    status: 'rejected',
    submittedAt: '2026-09-01 16:30',
    description: '教学目标不够具体，建议增加分层设计',
    rejectReason: '教学目标不够具体，建议增加分层设计',
    aiGenerated: false,
  },
  {
    id: '4',
    title: '三角函数单元教学计划',
    author: '王老师',
    grade: '高二',
    className: '高二(2)班',
    subject: '数学',
    课时: 3,
    status: 'approved',
    submittedAt: '2026-09-01 14:00',
    description: '教学设计完整，目标清晰',
    aiGenerated: true,
  },
  {
    id: '5',
    title: '英语写作专项训练',
    author: '刘老师',
    grade: '高二',
    className: '高二(4)班',
    subject: '英语',
    课时: 2,
    status: 'pending',
    submittedAt: '2026-09-01 11:30',
    description: '写作训练计划，含范文和评分标准',
    aiGenerated: false,
  },
];

export const mockStats: ReviewStats = {
  pending: 23,
  approved: 12,
  rejected: 3,
  reviewing: 8,
  passRate: 92,
  avgDuration: 4.2,
};

export const subjectOptions = ['全部学科', '数学', '语文', '英语', '物理', '化学'];
export const classOptions = ['全部班级', '高二(1)班', '高二(2)班', '高二(3)班', '高二(4)班'];
export const sortOptions = ['提交时间', '学科', '状态'];

export const PAGE_SIZE = 3;

export const statusColorMap: Record<ReviewItem['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  reviewing: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  modified: 'bg-orange-100 text-orange-700',
};

export const statusLabelMap: Record<ReviewItem['status'], string> = {
  pending: '待审核',
  reviewing: '审核中',
  approved: '已通过',
  rejected: '需修改',
  modified: '已修改',
};