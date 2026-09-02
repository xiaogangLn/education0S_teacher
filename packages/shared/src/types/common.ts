export interface PageParams {
    page: number
    pageSize: number
}
  
export interface PageResult<T> {
    list: T[]
    total: number
    page: number
    pageSize: number
}

/** 分页请求参数 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** 分页响应数据 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** API 响应基础结构 */
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

/** 筛选条件基础结构 */
export interface FilterParams {
  keyword?: string;
  startDate?: string;
  endDate?: string;
}

/** 权限层级 */
export type PermissionLevel = 'school' | 'grade' | 'class' | 'personal' | 'research';

/** 状态枚举 */
export type StatusType = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'draft' | 'published';

/** 文件类型 */
export type FileType = 'document' | 'sheet' | 'video' | 'audio' | 'pdf' | 'image' | 'link' | 'word' | 'ppt' | 'folder';

/** 用户角色 */
export type UserRole = 'admin' | 'grade_admin' | 'teacher' | 'student' | 'parent';

/** 时间范围 */
export type TimeRange = '1month' | '3months' | '6months' | '1year';