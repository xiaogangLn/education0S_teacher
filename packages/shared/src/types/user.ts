// packages/shared/src/types/user.ts
// ============================================================
// 用户相关类型定义
// ============================================================

import { UserRole, PermissionLevel, PaginationParams } from './common';

/** 用户信息 */
export interface User {
  id: string;
  username: string;
  phone: string;
  email?: string;
  realName: string;
  role: UserRole;
  schoolId?: string;
  gradeId?: string;
  classId?: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** 用户登录请求 */
export interface LoginRequest {
  phone: string;
  password: string;
}

/** 用户登录响应 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

/** 用户注册请求 */
export interface RegisterRequest {
  phone: string;
  code: string;
  realName: string;
  schoolId: string;
  subjects: string[];
  grades: string[];
  password: string;
}

/** 更新用户信息请求 */
export interface UpdateUserRequest {
  realName?: string;
  email?: string;
  avatarUrl?: string;
  phone?: string;
}

/** 用户列表查询参数 */
export interface UserListParams extends PaginationParams {
  role?: UserRole;
  schoolId?: string;
  gradeId?: string;
  classId?: string;
  keyword?: string;
}

/** 教师画像 */
export interface TeacherPortrait {
  teaching: {
    quality: number;      // 教案质量 1-5
    interaction: number;  // 课堂互动 1-5
    style: string;        // 教学风格
    innovation: number;   // 创新评分
  };
  research: {
    participation: number; // 教研参与次数
    projects: number;      // 课题数量
    trainingHours: number; // 培训学时
  };
  effectiveness: {
    studentProgress: number; // 学生进步百分比
    satisfaction: number;    // 满意度 1-5
    peerEvaluation: number;  // 同行评价 1-5
  };
  growth: {
    capabilityEvolution: string; // 能力演化
    milestones: string[];        // 里程碑
    developmentSuggestions: string[]; // 发展建议
  };
  overallScore: number;
  growthTrend: number;
  updatedAt: string;
}

/** 学生画像（五维） */
export interface StudentPortrait {
  academic: {
    math: number;
    chinese: number;
    english: number;
    physics: number;
    chemistry: number;
    biology?: number;
    history?: number;
    geography?: number;
    overall: number;
    trend: number;
  };
  abilities: {
    memory: number;      // 记忆
    comprehension: number; // 理解
    application: number;   // 应用
    analysis: number;      // 分析
    evaluation: number;    // 评价
    creation: number;      // 创造
  };
  behaviors: {
    homeworkCompletion: number; // 作业完成率
    classParticipation: number; // 课堂参与度 1-5
    handwriting: number;        // 字迹评分
    attendance: number;         // 出勤率
  };
  psychology: {
    motivation: number;   // 学习动机 1-5
    anxiety: string;      // 考试焦虑等级
    selfEfficacy: number; // 自我效能 1-5
    cooperation: number;  // 合作能力 1-5
  };
  growth: {
    trajectory: string;   // 学业轨迹
    milestones: string[]; // 里程碑
    teacherComments: string[]; // 教师评语
  };
  overallScore: number;
  overallGrade: string;
  updatedAt: string;
  lastCalculatedAt: string;
  version: number;
}