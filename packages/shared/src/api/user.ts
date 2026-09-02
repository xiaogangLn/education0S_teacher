// packages/shared/src/api/user.ts
// ============================================================
// 用户 API
// ============================================================

import { httpClient } from './client';
import {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UpdateUserRequest,
  UserListParams,
  TeacherPortrait,
  StudentPortrait,
  ApiResponse,
  PaginatedResponse,
} from '../types';

const BASE_URL = '/user';

export const userApi = {
  // 登录
  login: (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return httpClient.post('/auth/login', data);
  },

  // 注册
  register: (data: RegisterRequest): Promise<ApiResponse<User>> => {
    return httpClient.post('/auth/register', data);
  },

  // 刷新 Token
  refreshToken: (refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> => {
    return httpClient.post('/auth/refresh', { refreshToken });
  },

  // 登出
  logout: (): Promise<ApiResponse<void>> => {
    return httpClient.post('/auth/logout');
  },

  // 获取当前用户信息
  getCurrentUser: (): Promise<ApiResponse<User>> => {
    return httpClient.get(`${BASE_URL}/me`);
  },

  // 更新当前用户信息
  updateCurrentUser: (data: UpdateUserRequest): Promise<ApiResponse<User>> => {
    return httpClient.put(`${BASE_URL}/me`, data);
  },

  // 获取用户列表
  getList: (params: UserListParams): Promise<ApiResponse<PaginatedResponse<User>>> => {
    return httpClient.get(BASE_URL, { params });
  },

  // 获取用户详情
  getDetail: (id: string): Promise<ApiResponse<User>> => {
    return httpClient.get(`${BASE_URL}/${id}`);
  },

  // 获取教师画像
  getTeacherPortrait: (teacherId?: string): Promise<ApiResponse<TeacherPortrait>> => {
    const url = teacherId ? `${BASE_URL}/${teacherId}/portrait` : `${BASE_URL}/me/portrait`;
    return httpClient.get(url);
  },

  // 获取学生画像（五维）
  getStudentPortrait: (studentId: string): Promise<ApiResponse<StudentPortrait>> => {
    return httpClient.get(`${BASE_URL}/students/${studentId}/portrait`);
  },

  // 获取学生列表
  getStudents: (params: { classId?: string; gradeId?: string; keyword?: string; page?: number; pageSize?: number }): Promise<ApiResponse<PaginatedResponse<User>>> => {
    return httpClient.get(`${BASE_URL}/students`, { params });
  },

  // 获取教师列表
  getTeachers: (params: { schoolId?: string; gradeId?: string; subject?: string; page?: number; pageSize?: number }): Promise<ApiResponse<PaginatedResponse<User>>> => {
    return httpClient.get(`${BASE_URL}/teachers`, { params });
  },
};