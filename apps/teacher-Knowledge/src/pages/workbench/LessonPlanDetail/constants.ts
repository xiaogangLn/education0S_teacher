// constants.ts
import type { LessonPlanDetail } from './types';

export const mockLessonPlan: LessonPlanDetail = {
  id: 'lp-001',
  title: '导数的几何意义',
  subject: '数学',
  grade: '高二',
  className: '高二(3)班',
  课时: 2,
  status: 'published',
  createdAt: '2026-09-02 14:30',
  updatedAt: '2026-09-03 10:30',
  publishedAt: '2026-09-03 10:30',
  version: 3,
  content: {
    objectives: [
      '理解导数的几何意义——切线斜率',
      '掌握切线方程的求法（点斜式）',
      '体会极限思想在导数中的应用',
    ],
    keyPoints: ['导数几何意义的理解', '极限思想的建立'],
    difficulties: ['极限思想的建立', '切线方程的综合应用'],
    schedule: ['第1课时：概念引入（45min）', '第2课时：应用与练习（45min）'],
    notes: '🤖 AI生成内容已标注 · 教师想法已整合',
  },
  resources: [
    { id: 'r1', name: '导数的几何意义 · 课件', type: 'ppt', size: '2.4MB' },
    { id: 'r2', name: '切线动态演示', type: 'video', size: '45MB' },
    { id: 'r3', name: '随堂练习', type: 'pdf', size: '1.2MB' },
  ],
  thoughts: [
    {
      id: 't1',
      type: 'core',
      title: '🎯 教学核心思路',
      content: '数形结合，从平均变化率过渡到瞬时变化率。通过动态演示帮助学生理解切线斜率的本质，建立极限思想的初步认知。',
      createdAt: '2026-09-02 14:30',
      tags: ['核心'],
    },
    {
      id: 't2',
      type: 'key',
      title: '📌 重点强调',
      content: '1. 导数 = 切线斜率 — 建立直观认知\n2. 极限思想 — 从平均变化率到瞬时变化率的过渡\n3. 切线方程的求法 — 点斜式的应用',
      createdAt: '2026-09-02 14:35',
      tags: ['重点'],
    },
    {
      id: 't3',
      type: 'design',
      title: '✨ 特殊设计',
      content: '1. 使用 GeoGebra 动态演示切线逼近过程\n2. 引入赛车加速情境，贴近学生认知\n3. 设计分层练习：基础题 + 拓展题 + 挑战题',
      createdAt: '2026-09-02 14:40',
      tags: ['设计'],
    },
    {
      id: 't4',
      type: 'personalized',
      title: '🎯 个性化调整',
      content: '基于班级学情分析（掌握度 68%，薄弱点：极限概念）：\n1. A层学生：增加拓展题和挑战题\n2. B层学生：加强基础训练，逐步提升\n3. C层学生：重点夯实基础，降低难度',
      createdAt: '2026-09-02 15:00',
      tags: ['AI生成'],
    },
    {
      id: 't5',
      type: 'note',
      title: '📝 备注',
      content: '已根据班级整体掌握度调整教学节奏，增加互动环节。',
      createdAt: '2026-09-03 10:00',
      tags: [],
    },
  ],
  stats: {
    totalStudents: 45,
    totalQuestions: 4,
    personalizedQuestions: 3,
    coverage: 100,
  },
};

export const tabConfig: { key: 'detail' | 'plan' | 'thoughts'; label: string }[] = [
  { key: 'detail', label: '📝 教案详情' },
  { key: 'plan', label: '📄 作业计划' },
  { key: 'thoughts', label: '💬 对话记录' },
];