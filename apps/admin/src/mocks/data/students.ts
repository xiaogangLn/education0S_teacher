// src/mocks/data/students.ts
export interface Student {
    id: string;
    name: string;
    studentNo: string;
    className: string;
    gradeName: string;
    masteryRate: number;
    status: 'active' | 'transferred' | 'graduated';
  }
  
  export const mockStudents: Student[] = [
    { id: '1', name: '张三', studentNo: '001', className: '九年级1班', gradeName: '九年级', masteryRate: 78, status: 'active' },
    { id: '2', name: '李四', studentNo: '002', className: '九年级1班', gradeName: '九年级', masteryRate: 45, status: 'active' },
    { id: '3', name: '王五', studentNo: '003', className: '九年级1班', gradeName: '九年级', masteryRate: 92, status: 'active' },
    { id: '4', name: '赵六', studentNo: '004', className: '九年级1班', gradeName: '九年级', masteryRate: 32, status: 'transferred' },
    { id: '5', name: '孙七', studentNo: '005', className: '九年级2班', gradeName: '九年级', masteryRate: 68, status: 'active' },
  ];
  
  export const mockStudentDetail = {
    id: '1',
    name: '张三',
    studentNo: '001',
    className: '九年级1班',
    gradeName: '九年级',
    schoolName: 'XX中学',
    gender: 'male' as const,
    parentName: '张先生',
    parentPhone: '138****1234',
    enrollmentYear: '2024',
    status: 'active' as const,
    masteryRate: 78,
    rank: 12,
    totalStudents: 45,
    strengths: ['数学', '物理'],
    weaknesses: ['英语', '化学'],
    transferHistory: [
      { id: 't1', fromClass: '八年级3班', toClass: '九年级2班', transferDate: '2026-03-01', reason: '成绩提升', operatedBy: '张老师' },
      { id: 't2', fromClass: '九年级2班', toClass: '九年级1班', transferDate: '2026-08-15', reason: '班级调整', operatedBy: '李老师' },
    ],
    abilities: [
      { name: '计算力', value: 78, label: '计算力' },
      { name: '逻辑推理', value: 62, label: '逻辑推理' },
      { name: '空间想象', value: 85, label: '空间想象' },
      { name: '应用能力', value: 70, label: '应用能力' },
    ],
    portraits: {
      academic: { overall_mastery: 78, trend: 'up', strengths: ['数学', '物理'], weaknesses: ['英语', '化学'] },
      abilities: { memory: 72, comprehension: 58, application: 45, analysis: 40, evaluation: 35, creation: 30 },
      behaviors: { homework_rate: 85, homework_accuracy: 65, participation: 4.2, handwriting_score: 78, learning_habit: 'moderate' },
      psychology: { motivation: 3.8, anxiety: 'medium', self_efficacy: 3.5, cooperation: 4.0, stress_level: 'medium' },
      growth: { improvement_rate: 12, milestones: [{ date: '2026-07-15', title: '期中考试进步10名', description: '从22名进步到12名' }] },
    },
  };
  
  // 模拟分页响应
  export const paginateResponse = <T>(items: T[], page: number = 1, pageSize: number = 20) => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      items: items.slice(start, end),
      total: items.length,
      page,
      page_size: pageSize,
    };
  };