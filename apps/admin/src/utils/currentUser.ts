import type { User } from '@/store/slices/userSlice';

export const CURRENT_USER_KEY = 'currentUser';

const ROLE_LABEL: Record<User['role'], string> = {
  admin: '管理员',
  grade_admin: '年级主任',
  teacher: '教师',
  student: '学生',
  parent: '家长',
};

export function mapAuthUserToStore(raw: any): User {
  const source = raw?.user && (raw.user.id || raw.user.phone || raw.user.role) ? raw.user : raw;
  const role = (source?.role || 'teacher') as User['role'];
  return {
    id: String(source?.id || ''),
    username: source?.username || source?.phone || '',
    phone: source?.phone || '',
    email: source?.email || undefined,
    realName: source?.real_name || source?.realName || source?.name || source?.username || source?.phone || '',
    role: ['admin', 'grade_admin', 'teacher', 'student', 'parent'].includes(role) ? role : 'teacher',
    schoolId: source?.school_id || source?.schoolId || undefined,
    schoolName: source?.school_name || source?.schoolName || undefined,
    gradeId: source?.grade_id || source?.gradeId || undefined,
    gradeName: source?.grade_name || source?.gradeName || undefined,
    classId: source?.class_id || source?.classId || undefined,
    className: source?.class_name || source?.className || undefined,
    avatarUrl: source?.avatar_url || source?.avatarUrl || undefined,
    subjects: Array.isArray(source?.subjects) ? source.subjects : [],
    isActive: source?.is_active ?? source?.isActive ?? true,
    lastLoginAt: source?.last_login_at || source?.lastLoginAt,
    createdAt: source?.created_at || source?.createdAt || new Date().toISOString(),
    updatedAt: source?.updated_at || source?.updatedAt || new Date().toISOString(),
  };
}

export function getUserDisplayName(user: User | null) {
  return user?.realName || user?.username || '管理员';
}

export function getUserSubtitle(user: User | null) {
  if (!user) return '管理员';
  return ROLE_LABEL[user.role] || user.role || '管理员';
}

export function persistCurrentUser(user: User | null) {
  if (typeof localStorage === 'undefined') return;
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function loadPersistedUser(): User | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}
