import { httpClient } from '../client';

export interface SchoolItem {
  id: string;
  name: string;
  code: string;
  type?: 'education' | 'commercial';
  plan_code?: string;
  province: string;
  city: string;
  district: string;
  address: string;
  contact_phone: string;
  contact_person?: string;
  status: string;
  student_count?: number;
  teacher_count?: number;
  created_at?: string;
  generation_model?: string;
  grading_model?: string;
  generation_base_url?: string;
  has_generation_api_key?: boolean;
}

export interface AiModelCatalogItem {
  id: string;
  label: string;
  provider: string;
  kind: 'generation' | 'grading';
  thinking: boolean;
  note?: string;
}

/** Admin 维护用：id 为库主键，code 为写入 Plan/School 的模型标识 */
export interface AiModelCatalogAdminItem {
  id: string;
  code: string;
  kind: 'generation' | 'grading';
  label: string;
  provider: string;
  base_url?: string;
  has_api_key: boolean;
  thinking: boolean;
  note?: string;
  enabled: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface GradeItem {
  id: string;
  school_id: string;
  school_name?: string;
  name: string;
  display_order: number;
  class_count?: number;
  student_count?: number;
  status: string;
  created_at?: string;
}

export interface OrgClassItem {
  id: string;
  school_id: string;
  school_name?: string;
  grade_id: string;
  grade_name?: string;
  name: string;
  display_order: number;
  academic_year: string;
  student_count: number;
  teacher_count?: number;
  status: string;
  created_at?: string;
}

export const organizationsService = {
  getAiModels: async () => {
    return httpClient.get<{
      generation: AiModelCatalogItem[];
      grading: AiModelCatalogItem[];
      contract_note: string;
    }>('/organizations/ai-models');
  },
  listAiModelCatalog: async (params?: { kind?: string; include_disabled?: boolean }) => {
    return httpClient.get<{ items: AiModelCatalogAdminItem[]; total: number }>('/admin/ai-models', { params });
  },
  createAiModelCatalog: async (data: {
    code: string;
    kind: 'generation' | 'grading';
    label: string;
    provider?: string;
    base_url: string;
    api_key?: string | null;
    thinking?: boolean;
    note?: string | null;
    enabled?: boolean;
    sort_order?: number;
  }) => {
    return httpClient.post<AiModelCatalogAdminItem>('/admin/ai-models', data);
  },
  updateAiModelCatalog: async (
    id: string,
    data: Partial<{
      code: string;
      kind: 'generation' | 'grading';
      label: string;
      provider: string;
      base_url: string;
      api_key: string | null;
      thinking: boolean;
      note: string | null;
      enabled: boolean;
      sort_order: number;
    }>,
  ) => {
    return httpClient.put<AiModelCatalogAdminItem>(`/admin/ai-models/${id}`, data);
  },
  deleteAiModelCatalog: async (id: string) => {
    return httpClient.delete(`/admin/ai-models/${id}`);
  },
  getSchools: async (params?: { keyword?: string; status?: string; type?: string }) => {
    return httpClient.get<{ items: SchoolItem[] }>('/organizations/schools', { params });
  },
  createSchool: async (data: {
    name: string;
    code: string;
    province?: string;
    city?: string;
    district?: string;
    address?: string;
    contact_phone?: string;
    contact_person?: string;
    status?: string;
    generation_model?: string;
    grading_model?: string;
    generation_base_url?: string;
    generation_api_key?: string;
  }) => {
    return httpClient.post<{ school: SchoolItem }>('/organizations/schools', data);
  },
  updateSchool: async (
    id: string,
    data: {
      name?: string;
      code?: string;
      province?: string;
      city?: string;
      district?: string;
      address?: string;
      contact_phone?: string;
      contact_person?: string;
      status?: string;
      generation_model?: string;
      grading_model?: string;
      generation_base_url?: string;
      generation_api_key?: string;
    },
  ) => {
    return httpClient.put<{ school: SchoolItem }>(`/organizations/schools/${id}`, data);
  },
  deleteSchool: async (id: string) => {
    return httpClient.delete(`/organizations/schools/${id}`);
  },

  getGrades: async (params?: { school_id?: string; keyword?: string }) => {
    return httpClient.get<{ items: GradeItem[] }>('/organizations/grades', { params });
  },
  createGrade: async (data: {
    school_id: string;
    name: string;
    display_order?: number;
    status?: string;
  }) => {
    return httpClient.post<{ grade: GradeItem }>('/organizations/grades', data);
  },
  updateGrade: async (id: string, data: Partial<GradeItem>) => {
    return httpClient.put<{ grade: GradeItem }>(`/organizations/grades/${id}`, data);
  },
  deleteGrade: async (id: string) => {
    return httpClient.delete(`/organizations/grades/${id}`);
  },

  getClasses: async (params?: { school_id?: string; grade_id?: string; keyword?: string }) => {
    return httpClient.get<{ items: OrgClassItem[] }>('/organizations/classes', { params });
  },
  getClass: async (id: string) => {
    return httpClient.get<any>(`/organizations/classes/${id}`);
  },
  createClass: async (data: {
    school_id: string;
    grade_id: string;
    name: string;
    academic_year?: string;
    display_order?: number;
    status?: string;
  }) => {
    return httpClient.post<{ class: OrgClassItem }>('/organizations/classes', data);
  },
  updateClass: async (id: string, data: {
    name?: string;
    academic_year?: string;
    display_order?: number;
    status?: 'active' | 'inactive' | 'graduated';
  }) => {
    return httpClient.put<{ class: OrgClassItem }>(`/organizations/classes/${id}`, data);
  },
  deleteClass: async (id: string) => {
    return httpClient.delete(`/organizations/classes/${id}`);
  },
};
