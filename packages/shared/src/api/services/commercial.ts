import { httpClient } from '../client';

export const PLAN_LABELS: Record<string, string> = {
  basic: '基础版',
  pro: 'Pro',
  turbo: 'Turbo',
  trial: '基础版',
  free: '基础版',
  exempt: '教育合同',
};

export type CommercialPlanCode = 'basic' | 'pro' | 'turbo';

export interface CommercialTenantItem {
  school_id: string;
  school_name: string;
  type: 'commercial';
  source: string;
  plan_code: CommercialPlanCode | 'exempt' | string;
  billing_mode: 'exempt' | 'subscription';
  plan_expires_at: string | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
  current_period_end: string | null;
  owner: {
    id: string;
    name: string;
    phone: string;
    status: string;
  } | null;
  student_count: number;
  teacher_count: number;
  quotas: {
    students: { used: number; limit: number | null };
    ai_grading: { used: number; limit: number | null };
    lesson_plan?: { used: number; limit: number | null };
    courseware?: { used: number; limit: number | null };
    exam?: { used: number; limit: number | null };
  };
  created_at: string;
}

export interface CommercialPlanItem {
  code: CommercialPlanCode;
  name: string;
  period_days: number;
  student_limit: number | null;
  student_trial_days: number | null;
  student_trial_limit: number | null;
  lesson_plan_quota_monthly: number | null;
  courseware_quota_monthly: number | null;
  exam_quota_monthly: number | null;
  ai_quota_monthly: number | null;
  has_student_management: boolean;
  generate_personalized_homework: boolean;
  update_student_portrait: boolean;
  /** 画像模型回写最小间隔（天）：基础 60 / Pro 30 / Turbo 7 */
  portrait_refresh_interval_days: number;
  /** 可读说明，如「约每月更新 1 次」 */
  portrait_refresh_policy?: string;
  price_fen: number;
  sort_order: number;
  generation_model: string;
  grading_model: string;
}

export type UpdateCommercialPlanPayload = Partial<Omit<CommercialPlanItem, 'code' | 'sort_order'>>;

export const commercialService = {
  getTenants: (params?: { keyword?: string; plan_code?: string }) => {
    return httpClient.get<{ items: CommercialTenantItem[]; total: number }>('/commercial/tenants', { params });
  },
  grantPlan: (schoolId: string, data: { plan_code: CommercialPlanCode; period_days?: number }) => {
    return httpClient.post(`/commercial/tenants/${schoolId}/grant`, data);
  },
  adjustQuotas: (schoolId: string, data: {
    students_remaining?: number;
    lesson_plan_remaining?: number;
    courseware_remaining?: number;
    exam_remaining?: number;
    ai_grading_remaining?: number;
  }) => {
    return httpClient.patch(`/commercial/tenants/${schoolId}/quotas`, data);
  },
  getPlans: () => {
    return httpClient.get<{ items: CommercialPlanItem[]; total: number }>('/commercial/plans');
  },
  updatePlan: (code: CommercialPlanCode, data: UpdateCommercialPlanPayload) => {
    return httpClient.put<CommercialPlanItem>(`/commercial/plans/${code}`, data);
  },
};
