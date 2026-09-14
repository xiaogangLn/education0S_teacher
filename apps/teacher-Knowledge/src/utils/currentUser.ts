import type { User } from '@/store/slices/userSlice';

export const CURRENT_USER_KEY = 'currentUser';

const ROLE_LABEL: Record<User['role'], string> = {
  admin: '管理员',
  is_grade_admin: '年级主任',
  teacher: '教师',
  student: '学生',
  parent: '家长',
};

export function isLeaderRole(role?: string | null) {
  return role === 'admin' || role === 'is_grade_admin' || role === 'grade_admin';
}

/** 商业版个人租户（无教育组织年级/班级语义） */
export function isCommercialTenant(user?: Pick<User, 'tenant'> | null) {
  return user?.tenant?.type === 'commercial';
}

/** 教育版年级主任可进审核中心 */
export function canAccessReviewCenter(user?: Pick<User, 'role' | 'tenant'> | null) {
  if (!user || isCommercialTenant(user)) return false;
  return isLeaderRole(user.role);
}

function resolveStoreRole(source: any): User['role'] {
  const rawRole = String(source?.role || 'teacher');
  const roles = Array.isArray(source?.roles)
    ? source.roles.map((item: unknown) => String(item || '').trim()).filter(Boolean)
    : String(source?.roles || '')
        .split(/[,，、]+/)
        .flatMap((part) => part.split('/'))
        .map((item) => item.trim())
        .filter(Boolean);
  const flagged =
    source?.is_grade_admin === true
    || source?.isGradeAdmin === true
    || roles.includes('grade_admin')
    || roles.includes('is_grade_admin');
  if (rawRole === 'admin') return 'admin';
  if (
    rawRole === 'grade_admin'
    || rawRole === 'is_grade_admin'
    || flagged
  ) {
    return 'is_grade_admin';
  }
  if (['teacher', 'student', 'parent'].includes(rawRole)) {
    return rawRole as User['role'];
  }
  return 'teacher';
}

function mapExamTypes(raw: any): User['examTypes'] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => ({
    subject: String(item?.subject || '').trim(),
    key: String(item?.key || '').trim(),
    label: String(item?.label || item?.key || '').trim(),
    defaultCount: Math.max(0, Number(item?.defaultCount ?? item?.default_count ?? 0) || 0),
    sortOrder: Number(item?.sortOrder ?? item?.sort_order ?? 0) || 0,
  })).filter((item) => item.key && item.label);
}

const DEFAULT_ENTITLEMENTS: User['entitlements'] = {
  selfAddStudent: false,
  manageStudents: false,
  importRoster: false,
  aiGrading: false,
  showBilling: false,
  generatePersonalizedHomework: false,
  updateStudentPortrait: false,
};

const DEFAULT_QUOTAS: User['quotas'] = {
  students: { used: 0, limit: 0 },
  aiGrading: { used: 0, limit: 0 },
  lessonPlan: { used: 0, limit: 0 },
  courseware: { used: 0, limit: 0 },
  exam: { used: 0, limit: 0 },
};

function mapPlanCode(raw: any): NonNullable<User['tenant']>['planCode'] {
  const value = raw?.plan_code || raw?.planCode;
  if (value === 'turbo') return 'turbo';
  if (value === 'pro') return 'pro';
  if (value === 'exempt') return 'exempt';
  if (value === 'basic' || value === 'trial' || value === 'free') return 'basic';
  return 'exempt';
}

function mapTenant(raw: any): User['tenant'] {
  if (!raw) return null;
  return {
    id: String(raw.id || ''),
    type: raw.type === 'commercial' ? 'commercial' : 'education',
    billingMode: raw.billing_mode === 'subscription' || raw.billingMode === 'subscription' ? 'subscription' : 'exempt',
    planCode: mapPlanCode(raw),
    planExpiresAt: raw.plan_expires_at || raw.planExpiresAt || null,
    studentTrialEndsAt: raw.student_trial_ends_at || raw.studentTrialEndsAt || null,
    portraitRefreshIntervalDays:
      raw.portrait_refresh_interval_days != null
        ? Number(raw.portrait_refresh_interval_days)
        : raw.portraitRefreshIntervalDays != null
          ? Number(raw.portraitRefreshIntervalDays)
          : undefined,
    portraitRefreshPolicy: raw.portrait_refresh_policy || raw.portraitRefreshPolicy || undefined,
  };
}

function mapEntitlements(raw: any): User['entitlements'] {
  if (!raw || typeof raw !== 'object') return DEFAULT_ENTITLEMENTS;
  return {
    selfAddStudent: Boolean(raw.self_add_student ?? raw.selfAddStudent),
    manageStudents: Boolean(raw.manage_students ?? raw.manageStudents),
    importRoster: Boolean(raw.import_roster ?? raw.importRoster),
    aiGrading: Boolean(raw.ai_grading ?? raw.aiGrading),
    showBilling: Boolean(raw.show_billing ?? raw.showBilling),
    generatePersonalizedHomework: Boolean(raw.generate_personalized_homework ?? raw.generatePersonalizedHomework),
    updateStudentPortrait: Boolean(raw.update_student_portrait ?? raw.updateStudentPortrait),
  };
}

function mapQuota(raw: any): { used: number; limit: number | null } {
  if (!raw || typeof raw !== 'object') return { used: 0, limit: 0 };
  const limit = raw.limit;
  return {
    used: Number(raw.used || 0),
    limit: limit == null ? null : Number(limit),
  };
}

export function mapAuthUserToStore(raw: any): User {
  const envelope = raw?.user && (raw.user.id || raw.user.phone || raw.user.role) ? raw : { user: raw, tenant: raw?.tenant, entitlements: raw?.entitlements, quotas: raw?.quotas };
  const source = envelope.user && (envelope.user.id || envelope.user.phone || envelope.user.role) ? envelope.user : raw;
  const role = resolveStoreRole(source);
  const quotas = envelope.quotas || source.quotas || {};
  const classIdsRaw = source?.class_ids || source?.classIds;
  const classIds = Array.isArray(classIdsRaw)
    ? classIdsRaw.map((id: any) => String(id)).filter(Boolean).slice(0, 3)
    : (source?.class_id || source?.classId ? [String(source.class_id || source.classId)] : []);
  const classNamesRaw = source?.class_names || source?.classNames;
  const classNames = Array.isArray(classNamesRaw)
    ? classNamesRaw.map((name: any) => String(name)).filter(Boolean)
    : (source?.class_name || source?.className ? [String(source.class_name || source.className)] : []);
  return {
    id: String(source?.id || ''),
    username: source?.username || source?.phone || '',
    phone: source?.phone || '',
    email: source?.email || undefined,
    realName: source?.real_name || source?.realName || source?.name || source?.username || source?.phone || '',
    role,
    schoolId: source?.school_id || source?.schoolId || undefined,
    schoolName: source?.school_name || source?.schoolName || undefined,
    gradeId: source?.grade_id || source?.gradeId || undefined,
    gradeName: source?.grade_name || source?.gradeName || undefined,
    classId: classIds[0] || source?.class_id || source?.classId || undefined,
    className: classNames[0] || source?.class_name || source?.className || undefined,
    classIds,
    classNames,
    stage: source?.stage || undefined,
    avatarUrl: source?.avatar_url || source?.avatarUrl || undefined,
    subjects: Array.isArray(source?.subjects) ? source.subjects : [],
    examTypes: mapExamTypes(source?.exam_types || source?.examTypes),
    tenant: mapTenant(envelope.tenant || source.tenant),
    entitlements: mapEntitlements(envelope.entitlements || source.entitlements),
    quotas: {
      students: mapQuota(quotas.students),
      aiGrading: mapQuota(quotas.ai_grading || quotas.aiGrading),
      lessonPlan: mapQuota(quotas.lesson_plan || quotas.lessonPlan),
      courseware: mapQuota(quotas.courseware),
      exam: mapQuota(quotas.exam),
    },
    isActive: source?.is_active ?? source?.isActive ?? true,
    lastLoginAt: source?.last_login_at || source?.lastLoginAt,
    createdAt: source?.created_at || source?.createdAt || new Date().toISOString(),
    updatedAt: source?.updated_at || source?.updatedAt || new Date().toISOString(),
  };
}

export function canSelfAddStudent(user: User | null | undefined): boolean {
  return Boolean(user?.entitlements?.selfAddStudent);
}

export function canManageStudents(user: User | null | undefined): boolean {
  return Boolean(user?.entitlements?.manageStudents);
}

export function canShowBilling(user: User | null | undefined): boolean {
  return Boolean(user?.entitlements?.showBilling);
}

export function isQuotaReached(quota?: { used: number; limit: number | null } | null): boolean {
  if (!quota || quota.limit == null) return false;
  return quota.used >= quota.limit;
}

export function quotaText(used?: number, limit?: number | null) {
  if (limit == null) return `${used ?? 0} / 不限`;
  return `${used ?? 0} / ${limit}`;
}

export function generationQuotaOf(user: User | null | undefined, type?: string | null) {
  if (type === 'courseware') return user?.quotas?.courseware;
  if (type === 'exam') return user?.quotas?.exam;
  return user?.quotas?.lessonPlan;
}

export const GENERATION_LABEL: Record<string, string> = {
  lesson_plan: '教案',
  courseware: '课件',
  exam: '试卷',
};

export function assertGenerationQuota(user: User | null | undefined, type?: string | null): string | null {
  const kind = type === 'courseware' || type === 'exam' ? type : 'lesson_plan';
  if (isQuotaReached(generationQuotaOf(user, kind))) {
    return `本月${GENERATION_LABEL[kind]}生成次数已用完，请升级套餐`;
  }
  return null;
}

export function canAiGrading(user: User | null | undefined): boolean {
  if (!user?.entitlements?.aiGrading) return false;
  return !isQuotaReached(user.quotas?.aiGrading);
}

export function remainingPlanDays(expiresAt?: string | null): number | null {
  if (!expiresAt) return null;
  const end = new Date(expiresAt).getTime();
  if (Number.isNaN(end)) return null;
  return Math.ceil((end - Date.now()) / (24 * 60 * 60 * 1000));
}

export function getUserDisplayName(user: User | null) {
  return user?.realName || user?.username || '未登录';
}

export function getUserSubtitle(user: User | null) {
  if (!user) return '';
  const roleLabel = ROLE_LABEL[user.role] || user.role;
  const parts = [user.schoolName, user.gradeName || user.className].filter(Boolean);
  if (parts.length) {
    if (user.role === 'is_grade_admin' || user.role === 'admin') {
      return `${parts.join(' · ')} · ${roleLabel}`;
    }
    return parts.join(' · ');
  }
  return roleLabel;
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
    if (!raw) return null;
    const user = JSON.parse(raw) as User;
    return {
      ...user,
      subjects: Array.isArray(user.subjects) ? user.subjects : [],
      examTypes: Array.isArray(user.examTypes) ? user.examTypes : [],
      classIds: Array.isArray(user.classIds) ? user.classIds : (user.classId ? [user.classId] : []),
      classNames: Array.isArray(user.classNames) ? user.classNames : (user.className ? [user.className] : []),
      entitlements: {
        ...DEFAULT_ENTITLEMENTS,
        ...(user.entitlements || {}),
      },
      quotas: {
        ...DEFAULT_QUOTAS,
        ...(user.quotas || {}),
      },
    };
  } catch {
    return null;
  }
}
