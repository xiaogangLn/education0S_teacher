// packages/shared/src/api/services/learning.ts
import { httpClient } from '../client';

export interface Question {
  id: string;
  content: string;
  type: 'choice' | 'fill' | 'answer';
  score: number;
  options?: string[];
  answer?: string;
}

export interface LearningRecordItem {
  id: string;
  student_id: string;
  student_name: string;
  lesson_plan_id: string;
  lesson_plan_title: string;
  assignment_title: string;
  subject?: string;
  status: 'pending' | 'submitted' | 'graded';
  submitted_at: string;
  graded_at: string;
  score: number;
  total_score: number;
  mastery_rate: number;
  created_at: string;
}

export interface LearningRecordDetail extends LearningRecordItem {
  common_questions: Question[];
  personalized_questions: Question[];
  answers: Record<string, string>;
  images: string[];
  files: string[];
  class_evaluation: {
    rating: number;
    comment: string;
    teacher: string;
    created_at: string;
    type: string;
  };
  ai_result: {
    score: number;
    total_score: number;
    level: string;
    basic_score: number;
    basic_total: number;
    basic_accuracy: number;
    advanced_score: number;
    advanced_total: number;
    advanced_accuracy: number;
    errors: Array<{ question: string; reason: string }>;
  };
  teacher_feedback: string;
  teacher_score: number;
}

export const learningService = {
  // GET /api/v1/learning/records - 获取记录列表
  getList: (params?: {
    page?: number;
    page_size?: number;
    student_id?: string;
    class_id?: string;
    status?: 'pending' | 'submitted' | 'graded';
    keyword?: string;
  }) => {
    return httpClient.get<{ items: LearningRecordItem[]; total: number; page: number; page_size: number }>(
      '/learning/records',
      { params }
    );
  },

  // GET /api/v1/learning/records/{id} - 获取记录详情
  getDetail: (id: string) => {
    return httpClient.get<{ record: LearningRecordDetail }>(`/learning/records/${id}`);
  },

  // POST /api/v1/learning/records - 创建单条记录
  create: (data: {
    student_id: string;
    lesson_plan_id: string;
    assignment_title: string;
    common_questions?: Question[];
    personalized_questions?: Question[];
  }) => {
    return httpClient.post<{ id: string; status: string; created_at: string }>('/learning/records', data);
  },

  // POST /api/v1/learning/records/batch - 批量创建（全班生成）
  batchCreate: (data: {
    lesson_plan_id: string;
    class_id: string;
    assignment_title: string;
    common_questions: Question[];
    personalized_map: Record<string, Question[]>;
  }) => {
    return httpClient.post<{
      total: number;
      success: number;
      record_ids: string[];
      created_at: string;
    }>('/learning/records/batch', data);
  },

  // PUT /api/v1/learning/records/{id}/submit - 提交作业
  submit: (id: string, data: {
    images?: string[];
    files?: string[];
    answers: Record<string, string>;
    class_evaluation?: {
      rating: number;
      comment: string;
    };
  }) => {
    return httpClient.put<{
      record_id: string;
      status: 'submitted';
      submitted_at: string;
      ai_analysis_started: boolean;
    }>(`/learning/records/${id}/submit`, data);
  },

  // PUT /api/v1/learning/records/{id}/grade - 批改作业
  grade: (id: string, data: {
    scores: Record<string, number>;
    feedback: string;
    teacher_score?: number;
  }) => {
    return httpClient.put<{
      record_id: string;
      status: 'graded';
      total_score: number;
      total_possible: number;
      mastery_rate: number;
      knowledge_analysis: {
        mastered: string[];
        developing: string[];
        not_mastered: string[];
      };
      graded_at: string;
    }>(`/learning/records/${id}/grade`, data);
  },

  // POST /api/v1/learning/records/{id}/images - 上传图片
  uploadImages: (id: string, formData: FormData) => {
    return httpClient.post<{ urls: string[] }>(`/learning/records/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // GET /api/v1/learning/records/student/{student_id} - 获取学生记录
  getStudentRecords: (studentId: string) => {
    return httpClient.get<{
      items: LearningRecordItem[];
      stats: {
        total: number;
        graded: number;
        pending: number;
        submitted: number;
      };
    }>(`/learning/records/student/${studentId}`);
  },

  // GET /api/v1/learning/records/class/{class_id} - 获取班级记录
  getClassRecords: (classId: string) => {
    return httpClient.get<{
      items: LearningRecordItem[];
      stats: {
        total: number;
        graded: number;
        pending: number;
        submitted: number;
      };
    }>(`/learning/records/class/${classId}`);
  },

  // GET /api/v1/learning/records/export - 导出记录
  export: (params?: {
    format?: 'excel' | 'csv';
    student_id?: string;
    class_id?: string;
    status?: string;
  }) => {
    return httpClient.get('/learning/records/export', { params });
  },

  getLessonAssignments: (taskId: string) => {
    return httpClient.get<LessonAssignmentPayload>(`/learning/records/lesson/${taskId}`);
  },

  generateFromLesson: (taskId: string, force?: boolean) => {
    return httpClient.post<LessonAssignmentPayload>(`/learning/records/from-lesson/${taskId}`, {}, {
      timeout: 120000,
      params: force ? { force: true } : undefined,
    });
  },
};

export interface PracticeQuestion {
  id: string;
  content: string;
  type: 'choice' | 'fill' | 'answer';
  score: number;
  options?: string[];
  answer?: string;
  scope?: 'common' | 'personalized';
  section?: 'in_class' | 'homework';
  knowledge_point?: string;
  layer?: 'A' | 'B' | 'C';
}

export interface LessonAssignmentStudent {
  id: string;
  name: string;
  class_name?: string;
  personalized: PracticeQuestion[];
  record_id?: string;
}

export interface LessonAssignmentSection {
  common: PracticeQuestion[];
  students: LessonAssignmentStudent[];
}

export interface LessonAssignmentPayload {
  lesson_plan_id: string;
  topic: string;
  subject: string;
  class_name: string;
  generated: boolean;
  generated_by?: string;
  stats: {
    totalStudents: number;
    totalQuestions: number;
    personalizedQuestions: number;
    coverage: number;
    inClassCount: number;
    homeworkCount: number;
  };
  in_class: LessonAssignmentSection;
  homework: LessonAssignmentSection;
  created?: number;
  record_ids?: string[];
}