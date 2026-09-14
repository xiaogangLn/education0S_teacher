// ============================================================
// EducationOS V8.0 完整接口定义
// ============================================================

// ============================================================
// 一、认证模块 (Auth)
// ============================================================
export namespace AuthAPI {
    /** POST /api/v1/auth/login */
    export interface LoginRequest {
      phone: string;
      password: string;
      remember?: boolean;
    }
    export interface LoginResponse {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      user: UserInfo;
    }
  
    /** POST /api/v1/auth/refresh */
    export interface RefreshTokenRequest {
      refresh_token: string;
    }
    export interface RefreshTokenResponse {
      access_token: string;
      expires_in: number;
    }
  
    /** POST /api/v1/auth/logout */
    export interface LogoutResponse {
      success: boolean;
    }
  
    /** GET /api/v1/auth/me */
    export interface MeResponse {
      user: UserInfo;
    }
  
    /** PUT /api/v1/auth/password */
    export interface ChangePasswordRequest {
      old_password: string;
      new_password: string;
    }
  
    /** POST /api/v1/auth/password/reset */
    export interface ResetPasswordRequest {
      user_id: string;
      new_password: string;
    }
  
    /** POST /api/v1/auth/code/send */
    export interface SendCodeRequest {
      phone: string;
      type: 'login' | 'register' | 'reset';
    }
  
    /** POST /api/v1/auth/code/verify */
    export interface VerifyCodeRequest {
      phone: string;
      code: string;
      type: 'login' | 'register' | 'reset';
    }
  
    export interface UserInfo {
      id: string;
      username: string;
      real_name: string;
      phone: string;
      email: string;
      role: 'admin' | 'grade_admin' | 'teacher' | 'student' | 'parent';
      school_id: string;
      grade_id: string;
      class_id: string;
      avatar_url: string;
      is_active: boolean;
      school_name?: string;
      grade_name?: string;
      class_name?: string;
    }
  }
  
  // ============================================================
  // 二、用户管理模块 (Users)
  // ============================================================
  export namespace UsersAPI {
    /** GET /api/v1/users */
    export interface UserListQuery {
      page?: number;
      page_size?: number;
      keyword?: string;
      role?: string;
      school_id?: string;
      status?: 'active' | 'inactive';
    }
    export interface UserListResponse {
      items: UserItem[];
      total: number;
      page: number;
      page_size: number;
    }
  
    /** GET /api/v1/users/{id} */
    export interface UserDetailResponse {
      user: UserItem;
    }
  
    /** POST /api/v1/users */
    export interface CreateUserRequest {
      username: string;
      phone: string;
      email?: string;
      real_name: string;
      password: string;
      role: string;
      school_id?: string;
      grade_id?: string;
      class_id?: string;
      class_ids?: string[];
      subjects?: string[];
    }
  
    /** PUT /api/v1/users/{id} */
    export interface UpdateUserRequest {
      real_name?: string;
      phone?: string;
      email?: string;
      role?: string;
      school_id?: string;
      grade_id?: string;
      class_id?: string;
      class_ids?: string[];
      subjects?: string[];
    }
  
    /** POST /api/v1/users/import */
    export interface ImportUsersRequest {
      file: File;
      overwrite?: boolean;
    }
    export interface ImportUsersResponse {
      task_id: string;
      total: number;
      success: number;
      failed: number;
      errors: Array<{ row: number; field: string; reason: string }>;
      error_file_url?: string;
    }
  
    /** GET /api/v1/users/export */
    export interface ExportUsersQuery {
      format: 'excel' | 'csv';
      school_id?: string;
      role?: string;
    }
  
    export interface UserItem {
      id: string;
      username: string;
      real_name: string;
      phone: string;
      email: string;
      role: string;
      school_id: string;
      grade_id: string;
      class_id: string;
      avatar_url: string;
      is_active: boolean;
      last_login_at: string;
      created_at: string;
    }
  }
  
  // ============================================================
  // 三、组织管理模块 (Organization)
  // ============================================================
  export namespace OrgAPI {
    /** GET /api/v1/organizations/schools */
    export interface SchoolListResponse {
      items: SchoolItem[];
    }
  
    /** POST /api/v1/organizations/schools */
    export interface CreateSchoolRequest {
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
    }

    /** PUT /api/v1/organizations/schools/{id} */
    export interface UpdateSchoolRequest {
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
    }
  
    /** GET /api/v1/organizations/grades */
    export interface GradeListQuery {
      school_id?: string;
    }
    export interface GradeListResponse {
      items: GradeItem[];
    }
  
    /** POST /api/v1/organizations/grades */
    export interface CreateGradeRequest {
      school_id: string;
      name: string;
      display_order?: number;
    }
  
    /** GET /api/v1/organizations/classes */
    export interface ClassListQuery {
      school_id?: string;
      grade_id?: string;
    }
    export interface ClassListResponse {
      items: ClassItem[];
    }
  
    /** POST /api/v1/organizations/classes */
    export interface CreateClassRequest {
      school_id: string;
      grade_id: string;
      name: string;
      academic_year?: string;
      display_order?: number;
    }
  
    /** PUT /api/v1/organizations/classes/{id} */
    export interface UpdateClassRequest {
      name?: string;
      academic_year?: string;
      status?: 'active' | 'inactive' | 'graduated';
    }
  
    /** GET /api/v1/organizations/classes/{id} */
    export interface ClassDetailResponse {
      id: string;
      name: string;
      grade_id: string;
      grade_name: string;
      school_id: string;
      school_name: string;
      academic_year: string;
      student_count: number;
      status: string;
      created_at: string;
    }
  
    export interface SchoolItem {
      id: string;
      name: string;
      code: string;
      province: string;
      city: string;
      district: string;
      address: string;
      contact_phone: string;
      contact_person?: string;
      status: string;
    }
  
    export interface GradeItem {
      id: string;
      school_id: string;
      name: string;
      display_order: number;
      status: string;
    }
  
    export interface ClassItem {
      id: string;
      school_id: string;
      grade_id: string;
      name: string;
      display_order: number;
      academic_year: string;
      student_count: number;
      status: string;
    }
  }
  
  // ============================================================
  // 四、学生管理模块 (Students)
  // ============================================================
  export namespace StudentsAPI {
    /** GET /api/v1/students */
    export interface StudentListQuery {
      page?: number;
      page_size?: number;
      keyword?: string;
      class_id?: string;
      grade_id?: string;
      school_id?: string;
      status?: 'active' | 'transferred' | 'graduated' | 'withdrawn';
      sort_by?: 'name' | 'student_no' | 'created_at';
      sort_order?: 'asc' | 'desc';
    }
    export interface StudentListResponse {
      items: StudentItem[];
      total: number;
      page: number;
      page_size: number;
    }
  
    /** GET /api/v1/students/{id} */
    export interface StudentDetailResponse {
      student: StudentDetail;
    }
  
    /** POST /api/v1/students */
    export interface CreateStudentRequest {
      user_id: string;
      student_no: string;
      school_id?: string;
      grade_id?: string;
      class_id?: string;
      enrollment_year?: string;
      parent_name?: string;
      parent_phone?: string;
      parent_email?: string;
    }
  
    /** PUT /api/v1/students/{id} */
    export interface UpdateStudentRequest {
      student_no?: string;
      class_id?: string;
      grade_id?: string;
      parent_name?: string;
      parent_phone?: string;
      parent_email?: string;
      status?: 'active' | 'transferred' | 'graduated' | 'withdrawn';
    }
  
    /** POST /api/v1/students/{id}/transfer */
    export interface TransferRequest {
      target_class_id: string;
      reason: string;
      transfer_date?: string;
    }
    export interface TransferResponse {
      student_id: string;
      from_class: string;
      to_class: string;
      from_grade: string;
      to_grade: string;
      transfer_date: string;
      status: 'pending' | 'executed';
      record_id: string;
    }
  
    /** GET /api/v1/students/{id}/transfers */
    export interface TransferHistoryResponse {
      items: TransferRecord[];
    }
  
    /** GET /api/v1/students/class/{class_id} */
    export interface ClassStudentsResponse {
      items: StudentItem[];
      total: number;
    }
  
    /** POST /api/v1/students/import */
    export interface ImportStudentsRequest {
      file: File;
      class_id?: string;
    }
    export interface ImportStudentsResponse {
      task_id: string;
      total: number;
      success: number;
      failed: number;
      errors: Array<{ row: number; field: string; reason: string }>;
    }
  
    export interface StudentItem {
      id: string;
      user_id: string;
      student_no: string;
      name: string;
      gender: 'male' | 'female';
      school_id: string;
      school_name: string;
      grade_id: string;
      grade_name: string;
      class_id: string;
      class_name: string;
      enrollment_year: string;
      parent_name: string;
      parent_phone: string;
      parent_email: string;
      status: string;
      mastery_rate: number;
      rank: number;
      total_students: number;
      created_at: string;
    }
  
    export interface StudentDetail extends StudentItem {
      strengths: string[];
      weaknesses: string[];
      transfer_history: TransferRecord[];
      abilities: Ability[];
      portraits: {
        academic: any;
        abilities: any;
        behaviors: any;
        psychology: any;
        growth: any;
      };
    }
  
    export interface TransferRecord {
      id: string;
      from_class: string;
      to_class: string;
      from_grade: string;
      to_grade: string;
      transfer_date: string;
      reason: string;
      operated_by: string;
      status: string;
    }
  
    export interface Ability {
      name: string;
      value: number;
      label: string;
    }
  }
  
  // ============================================================
  // 五、知识库模块 (Knowledge)
  // ============================================================
  export namespace KnowledgeAPI {
    /** GET /api/v1/knowledge/documents */
    export interface DocumentListQuery {
      page?: number;
      page_size?: number;
      keyword?: string;
      type?: 'document' | 'sheet' | 'video' | 'audio' | 'pdf' | 'link' | 'image';
      permission?: 'school' | 'grade' | 'class' | 'personal';
      category?: string;
      folder_id?: string;
      sort_by?: 'created_at' | 'title' | 'view_count';
      sort_order?: 'asc' | 'desc';
    }
    export interface DocumentListResponse {
      items: DocumentItem[];
      total: number;
      page: number;
      page_size: number;
    }
  
    /** GET /api/v1/knowledge/documents/{id} */
    export interface DocumentDetailResponse {
      document: DocumentDetail;
    }
  
    /** POST /api/v1/knowledge/documents */
    export interface CreateDocumentRequest {
      file?: File;
      title: string;
      type: string;
      permission: 'school' | 'grade' | 'class' | 'personal';
      category?: string;
      folder_id?: string;
      tags?: string[];
      content?: string;
    }
    export interface CreateDocumentResponse {
      id: string;
      title: string;
      file_url: string;
      file_size: number;
      permission: string;
      created_at: string;
    }
  
    /** PUT /api/v1/knowledge/documents/{id} */
    export interface UpdateDocumentRequest {
      title?: string;
      content?: string;
      permission?: 'school' | 'grade' | 'class' | 'personal';
      category?: string;
      tags?: string[];
    }
  
    /** DELETE /api/v1/knowledge/documents/{id} */
    export interface DeleteDocumentResponse {
      success: boolean;
    }
  
    /** GET /api/v1/knowledge/folders */
    export interface FolderListQuery {
      parent_id?: string;
      permission?: 'school' | 'grade' | 'class' | 'personal';
    }
    export interface FolderListResponse {
      items: FolderItem[];
    }
  
    /** POST /api/v1/knowledge/folders */
    export interface CreateFolderRequest {
      parent_id?: string;
      name: string;
      permission: 'school' | 'grade' | 'class' | 'personal';
    }
  
    /** GET /api/v1/knowledge/permissions */
    export interface PermissionListResponse {
      items: PermissionItem[];
    }
  
    /** PUT /api/v1/knowledge/documents/{id}/permission */
    export interface UpdatePermissionRequest {
      permission: 'school' | 'grade' | 'class' | 'personal';
    }
  
    /** GET /api/v1/knowledge/search */
    export interface SearchDocumentsQuery {
      keyword: string;
      page?: number;
      page_size?: number;
      type?: string;
      permission?: string;
    }
    export interface SearchDocumentsResponse {
      items: DocumentItem[];
      total: number;
    }
  
    /** POST /api/v1/knowledge/documents/{id}/favorite */
    export interface ToggleFavoriteResponse {
      favorited: boolean;
    }
  
    /** GET /api/v1/knowledge/favorites */
    export interface FavoriteListResponse {
      items: DocumentItem[];
      total: number;
    }
  
    /** GET /api/v1/knowledge/recent */
    export interface RecentListResponse {
      items: DocumentItem[];
    }
  
    export interface DocumentItem {
      id: string;
      title: string;
      type: string;
      permission: 'school' | 'grade' | 'class' | 'personal';
      category: string;
      file_size: number;
      file_url: string;
      creator_name: string;
      creator_id: string;
      created_at: string;
      view_count: number;
      download_count: number;
      is_favorited: boolean;
      status: 'active' | 'archived';
      thumbnail?: string;
    }
  
    export interface DocumentDetail extends DocumentItem {
      content: string;
      tags: string[];
      folder_id: string;
      updated_at: string;
      comments: CommentItem[];
    }
  
    export interface FolderItem {
      id: string;
      parent_id: string;
      name: string;
      permission: string;
      sort_order: number;
      created_at: string;
    }
  
    export interface PermissionItem {
      key: 'school' | 'grade' | 'class' | 'personal';
      label: string;
      icon: string;
      desc: string;
      count: number;
    }
  
    export interface CommentItem {
      id: string;
      user_id: string;
      user_name: string;
      content: string;
      created_at: string;
    }
  }
  
  // ============================================================
  // 六、拍照批改模块 (Grading)
  // ============================================================
  export namespace GradingAPI {
    /** POST /api/v1/knowledge/grading/photo */
    export interface PhotoGradingRequest {
      image: File;
      student_id: string;
      subject: string;
      assignment_title: string;
    }
    export interface PhotoGradingResponse {
      record_id: string;
      ocr_result: string;
      handwriting_analysis: HandwritingAnalysis;
      ai_score: number;
      ai_feedback: string;
      status: 'pending_confirm';
    }
  
    /** GET /api/v1/knowledge/grading/{id} */
    export interface GradingDetailResponse {
      record: GradingRecord;
    }
  
    /** GET /api/v1/knowledge/grading/list */
    export interface GradingListQuery {
      page?: number;
      page_size?: number;
      student_id?: string;
      status?: 'pending_confirm' | 'confirmed' | 'modified';
    }
    export interface GradingListResponse {
      items: GradingRecord[];
      total: number;
    }
  
    /** PUT /api/v1/knowledge/grading/{id}/confirm */
    export interface ConfirmGradingRequest {
      confirmed: boolean;
      feedback?: string;
    }
  
    /** PUT /api/v1/knowledge/grading/{id}/update */
    export interface UpdateGradingRequest {
      ai_score?: number;
      teacher_score?: number;
      feedback?: string;
    }
  
    export interface HandwritingAnalysis {
      neatness: number;
      stroke: number;
      consistency: number;
      layout: number;
    }
  
    export interface GradingRecord {
      id: string;
      student_id: string;
      student_name: string;
      subject: string;
      assignment_title: string;
      ocr_result: string;
      handwriting_analysis: HandwritingAnalysis;
      ai_score: number;
      teacher_score: number;
      ai_feedback: string;
      teacher_feedback: string;
      status: 'pending_confirm' | 'confirmed' | 'modified';
      created_at: string;
      confirmed_at: string;
      images: string[];
    }
  }
  
  // ============================================================
  // 七、成绩管理模块 (Exam)
  // ============================================================
  export namespace ExamAPI {
    /** GET /api/v1/exam/records */
    export interface ExamListQuery {
      page?: number;
      page_size?: number;
      student_id?: string;
      class_id?: string;
      subject?: string;
      exam_type?: 'midterm' | 'final' | 'quiz' | 'mock';
    }
    export interface ExamListResponse {
      items: ExamRecord[];
      total: number;
    }
  
    /** GET /api/v1/exam/records/{id} */
    export interface ExamDetailResponse {
      record: ExamRecordDetail;
    }
  
    /** POST /api/v1/exam/records */
    export interface CreateExamRequest {
      student_id: string;
      exam_name: string;
      subject: string;
      score: number;
      total_score: number;
      exam_type: 'midterm' | 'final' | 'quiz' | 'mock';
      exam_date: string;
      images?: File[];
    }
  
    /** POST /api/v1/exam/records/import */
    export interface ImportExamRequest {
      file: File;
      class_id?: string;
      exam_name?: string;
      exam_type?: string;
      exam_date?: string;
    }
    export interface ImportExamResponse {
      task_id: string;
      total: number;
      success: number;
      failed: number;
      errors: Array<{ row: number; field: string; reason: string }>;
    }
  
    /** GET /api/v1/exam/student/{student_id} */
    export interface StudentExamResponse {
      items: ExamRecord[];
    }
  
    /** GET /api/v1/exam/class/{class_id} */
    export interface ClassExamResponse {
      items: ClassExamSummary[];
    }
  
    export interface ExamRecord {
      id: string;
      student_id: string;
      student_name: string;
      exam_name: string;
      subject: string;
      score: number;
      total_score: number;
      class_average: number;
      rank: number;
      total_students: number;
      exam_type: string;
      exam_date: string;
      created_at: string;
    }
  
    export interface ExamRecordDetail extends ExamRecord {
      images: string[];
      knowledge_analysis: {
        mastered: string[];
        developing: string[];
        not_mastered: string[];
      };
    }
  
    export interface ClassExamSummary {
      class_name: string;
      average_score: number;
      max_score: number;
      min_score: number;
      pass_rate: number;
      excellent_rate: number;
      exam_name: string;
      exam_date: string;
    }
  }
  
  // ============================================================
  // 八、课堂评价模块 (Classroom)
  // ============================================================
  export namespace ClassroomAPI {
    /** POST /api/v1/classroom/evaluations */
    export interface CreateEvaluationRequest {
      student_id: string;
      rating: number;
      comment: string;
      participation?: number;
      type?: 'voice' | 'manual';
    }
  
    /** GET /api/v1/classroom/evaluations/{id} */
    export interface EvaluationDetailResponse {
      evaluation: EvaluationRecord;
    }
  
    /** GET /api/v1/classroom/evaluations/student/{student_id} */
    export interface StudentEvaluationResponse {
      items: EvaluationRecord[];
    }
  
    /** GET /api/v1/classroom/evaluations/class/{class_id} */
    export interface ClassEvaluationResponse {
      items: EvaluationRecord[];
    }
  
    /** POST /api/v1/classroom/evaluations/voice */
    export interface VoiceEvaluationRequest {
      student_id: string;
      audio: File;
    }
  
    /** PUT /api/v1/classroom/evaluations/{id} */
    export interface UpdateEvaluationRequest {
      rating?: number;
      comment?: string;
      participation?: number;
    }
  
    export interface EvaluationRecord {
      id: string;
      student_id: string;
      student_name: string;
      rating: number;
      comment: string;
      participation: number;
      teacher: string;
      teacher_id: string;
      type: string;
      created_at: string;
    }
  }
  
  // ============================================================
  // 九、加工台模块 (Processing - 五阶段交互)
  // ============================================================
  export namespace ProcessingAPI {
    /** POST /api/v1/processing/tasks */
    export interface CreateTaskRequest {
      class_id: string;
      subject: string;
      topic: string;
      teacher_ideas: TeacherIdeas;
    }
    export interface CreateTaskResponse {
      task_id: string;
      status: string;
      current_stage: 'init';
      created_at: string;
    }
  
    /** GET /api/v1/processing/tasks/{id} */
    export interface TaskDetailResponse {
      task: GenerationTask;
    }
  
    /** GET /api/v1/processing/tasks */
    export interface TaskListQuery {
      page?: number;
      page_size?: number;
      status?: string;
      subject?: string;
      created_by?: string;
    }
    export interface TaskListResponse {
      items: GenerationTask[];
      total: number;
    }
  
    /** GET /api/v1/processing/tasks/{id}/analysis */
    export interface AnalysisResponse {
      analysis: ClassAnalysis;
    }
  
    /** POST /api/v1/processing/tasks/{id}/analysis/confirm */
    export interface ConfirmAnalysisRequest {
      confirmed: boolean;
      adjustments?: string;
    }
  
    /** POST /api/v1/processing/tasks/{id}/outline/generate */
    export interface GenerateOutlineRequest {
      instruction?: string;
    }
    export interface GenerateOutlineResponse {
      outline: Outline;
    }
  
    /** POST /api/v1/processing/tasks/{id}/outline/adjust */
    export interface AdjustOutlineRequest {
      sections: OutlineSection[];
    }
  
    /** POST /api/v1/processing/tasks/{id}/content/generate */
    export interface GenerateContentRequest {
      instruction?: string;
    }
    export interface GenerateContentResponse {
      content: ContentSection[];
    }
  
    /** PUT /api/v1/processing/tasks/{id}/content/update */
    export interface UpdateContentRequest {
      sections: ContentSection[];
    }
  
    /** POST /api/v1/processing/tasks/{id}/refine */
    export interface RefineRequest {
      instruction?: string;
    }
    export interface RefineResponse {
      refined_content: ContentSection[];
    }
  
    /** POST /api/v1/processing/tasks/{id}/complete */
    export interface CompleteResponse {
      task_id: string;
      status: 'generated';
      completed_at: string;
    }
  
    /** POST /api/v1/processing/tasks/{id}/adjust */
    export interface AdjustRequest {
      stage: 'analysis' | 'outline' | 'content' | 'refine';
      instruction: string;
      type: 'adjust' | 'regenerate' | 'refine';
      target?: string;
    }
    export interface AdjustResponse {
      task_id: string;
      stage: string;
      stream_url: string;
    }
  
    /** GET /api/v1/processing/tasks/{id}/stream/{stage} */
    // SSE 流式事件类型
    export interface SSEStartEvent {
      type: 'start';
      stage: string;
      timestamp: string;
    }
    export interface SSEChunkEvent {
      type: 'chunk';
      data: {
        type: 'text' | 'markdown' | 'structured';
        content: string;
        position: number;
      };
    }
    export interface SSEDataEvent {
      type: 'data';
      data: {
        type: 'structured';
        content: any;
      };
    }
    export interface SSEProgressEvent {
      type: 'progress';
      progress: number;
      total: number;
    }
    export interface SSECompleteEvent {
      type: 'complete';
      stage: string;
      status: 'done';
      content: string;
      next_action: 'confirm' | 'adjust' | 'next';
    }
    export interface SSEErrorEvent {
      type: 'error';
      code: number;
      message: string;
    }
  
    /** POST /api/v1/processing/tasks/{id}/submit */
    export interface SubmitTaskResponse {
      task_id: string;
      status: 'pending_review';
      submitted_at: string;
    }
  
    /** POST /api/v1/processing/tasks/{id}/draft */
    export interface DraftTaskResponse {
      task_id: string;
      status: 'draft';
      draft_saved_at: string;
    }
  
    /** GET /api/v1/processing/tasks/{id}/versions */
    export interface VersionListResponse {
      items: VersionItem[];
    }
  
    /** POST /api/v1/processing/tasks/{id}/versions/{version}/restore */
    export interface RestoreVersionResponse {
      task_id: string;
      version: number;
      restored_at: string;
    }
  
    export interface TeacherIdeas {
      teaching_approach: string;
      key_points: string[];
      special_design: string;
      target_students: string;
    }
  
    export interface ClassAnalysis {
      mastery_rate: number;
      weak_points: string[];
      layers: {
        A: number;
        B: number;
        C: number;
      };
      zone_of_proximal_development: string;
    }
  
    export interface OutlineSection {
      id: string;
      title: string;
      level: number;
      children?: OutlineSection[];
    }
  
    export interface Outline {
      sections: OutlineSection[];
    }
  
    export interface ContentSection {
      id: string;
      title: string;
      content: string;
      ai_generated: boolean;
      teacher_modified: boolean;
      modifications?: string[];
    }
  
    export interface GenerationTask {
      id: string;
      class_id: string;
      subject: string;
      topic: string;
      current_stage: 'init' | 'analysis' | 'outline' | 'content' | 'refine' | 'complete';
      status: 'draft' | 'generated' | 'pending_review' | 'approved' | 'rejected' | 'published' | 'archived';
      teacher_ideas: TeacherIdeas;
      class_analysis: ClassAnalysis;
      outline: Outline;
      content: ContentSection[];
      refined_content: ContentSection[];
      generated_lesson_plan: string;
      ai_tags: string[];
      created_by: string;
      created_at: string;
      updated_at: string;
      version: number;
    }
  
    export interface VersionItem {
      version: number;
      content: string;
      saved_at: string;
      saved_by: string;
      changes: string;
    }
  }
  
  // ============================================================
  // 十、审批模块 (Review)
  // ============================================================
  export namespace ReviewAPI {
    /** GET /api/v1/review/pending */
    export interface PendingReviewQuery {
      page?: number;
      page_size?: number;
      type?: 'lesson_plan' | 'courseware' | 'exam';
      subject?: string;
      grade_id?: string;
    }
    export interface PendingReviewResponse {
      items: PendingReviewItem[];
      total: number;
      page: number;
      page_size: number;
    }
  
    /** GET /api/v1/review/list */
    export interface ReviewListQuery {
      page?: number;
      page_size?: number;
      status?: 'pending' | 'approved' | 'rejected';
      type?: string;
      start_date?: string;
      end_date?: string;
    }
    export interface ReviewListResponse {
      items: ReviewItem[];
      total: number;
    }
  
    /** GET /api/v1/review/{id} */
    export interface ReviewDetailResponse {
      review: ReviewDetail;
    }
  
    /** POST /api/v1/review/{id}/approve */
    export interface ApproveRequest {
      comment?: string;
    }
    export interface ApproveResponse {
      id: string;
      status: 'approved';
      reviewed_at: string;
    }
  
    /** POST /api/v1/review/{id}/reject */
    export interface RejectRequest {
      reason: string;
      comment?: string;
    }
    export interface RejectResponse {
      id: string;
      status: 'rejected';
      reviewed_at: string;
    }
  
    /** POST /api/v1/review/{id}/comment */
    export interface AddCommentRequest {
      content: string;
    }
    export interface AddCommentResponse {
      comment: ReviewComment;
    }
  
    /** GET /api/v1/review/{id}/comments */
    export interface CommentListResponse {
      items: ReviewComment[];
    }
  
    /** GET /api/v1/review/stats */
    export interface ReviewStatsResponse {
      stats: ReviewStats;
    }
  
    /** POST /api/v1/review/batch */
    export interface BatchReviewRequest {
      ids: string[];
      action: 'approve' | 'reject';
      comment?: string;
      reason?: string;
    }
    export interface BatchReviewResponse {
      success: number;
      failed: number;
      errors: Array<{ id: string; reason: string }>;
    }
  
    export interface PendingReviewItem {
      id: string;
      title: string;
      type: string;
      submitter: string;
      submitter_id: string;
      class_name: string;
      subject: string;
      submitted_at: string;
      status: 'pending';
      preview_content: string;
    }
  
    export interface ReviewItem {
      id: string;
      title: string;
      type: string;
      submitter: string;
      approver: string;
      status: 'pending' | 'approved' | 'rejected';
      submitted_at: string;
      reviewed_at: string;
      comment: string;
    }
  
    export interface ReviewDetail {
      id: string;
      title: string;
      type: string;
      content: string;
      submitter: {
        id: string;
        name: string;
      };
      approver: {
        id: string;
        name: string;
      };
      status: string;
      submitted_at: string;
      reviewed_at: string;
      comments: ReviewComment[];
      version_history: Array<{
        version: number;
        content: string;
        saved_at: string;
      }>;
    }
  
    export interface ReviewComment {
      id: string;
      author: string;
      author_id: string;
      content: string;
      created_at: string;
    }
  
    export interface ReviewStats {
      pending: number;
      approved: number;
      rejected: number;
      total: number;
      pass_rate: number;
      avg_duration: number;
    }
  }
  
  // ============================================================
  // 十一、学习记录模块 (Learning)
  // ============================================================
  export namespace LearningAPI {
    /** GET /api/v1/learning/records */
    export interface RecordListQuery {
      page?: number;
      page_size?: number;
      student_id?: string;
      class_id?: string;
      status?: 'pending' | 'submitted' | 'graded';
      keyword?: string;
    }
    export interface RecordListResponse {
      items: LearningRecordItem[];
      total: number;
    }
  
    /** GET /api/v1/learning/records/{id} */
    export interface RecordDetailResponse {
      record: LearningRecordDetail;
    }
  
    /** POST /api/v1/learning/records */
    export interface CreateRecordRequest {
      student_id: string;
      lesson_plan_id: string;
      assignment_title: string;
      common_questions?: Question[];
      personalized_questions?: Question[];
    }
    export interface CreateRecordResponse {
      id: string;
      status: 'pending';
      created_at: string;
    }
  
    /** POST /api/v1/learning/records/batch */
    export interface BatchCreateRecordRequest {
      lesson_plan_id: string;
      class_id: string;
      assignment_title: string;
      common_questions: Question[];
      personalized_map: Record<string, Question[]>;
    }
    export interface BatchCreateRecordResponse {
      total: number;
      success: number;
      record_ids: string[];
      created_at: string;
    }
  
    /** PUT /api/v1/learning/records/{id}/submit */
    export interface SubmitRecordRequest {
      images?: File[];
      files?: File[];
      answers: Record<string, string>;
      class_evaluation?: {
        rating: number;
        comment: string;
      };
    }
    export interface SubmitRecordResponse {
      record_id: string;
      status: 'submitted';
      submitted_at: string;
      ai_analysis_started: boolean;
    }
  
    /** PUT /api/v1/learning/records/{id}/grade */
    export interface GradeRecordRequest {
      scores: Record<string, number>;
      feedback: string;
      teacher_score?: number;
    }
    export interface GradeRecordResponse {
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
    }
  
    /** POST /api/v1/learning/records/{id}/images */
    export interface UploadImagesRequest {
      images: File[];
    }
    export interface UploadImagesResponse {
      urls: string[];
    }
  
    /** GET /api/v1/learning/records/student/{student_id} */
    export interface StudentRecordsResponse {
      items: LearningRecordItem[];
      stats: {
        total: number;
        graded: number;
        pending: number;
      };
    }
  
    /** GET /api/v1/learning/records/class/{class_id} */
    export interface ClassRecordsResponse {
      items: LearningRecordItem[];
      stats: {
        total: number;
        graded: number;
        pending: number;
        submitted: number;
      };
    }
  
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
      status: 'pending' | 'submitted' | 'graded';
      submitted_at: string;
      graded_at: string;
      score: number;
      total_score: number;
      mastery_rate: number;
      created_at: string;
    }
  
    export interface LearningRecordDetail {
      id: string;
      student_id: string;
      student_name: string;
      lesson_plan_id: string;
      lesson_plan_title: string;
      assignment_title: string;
      status: string;
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
      submitted_at: string;
      graded_at: string;
      created_at: string;
    }
  }
  
  // ============================================================
  // 十二、画像模块 (Portrait)
  // ============================================================
  export namespace PortraitAPI {
    /** GET /api/v1/portraits/student/{student_id} */
    export interface StudentPortraitResponse {
      data: StudentPortrait;
    }
  
    /** GET /api/v1/portraits/teacher/{teacher_id} */
    export interface TeacherPortraitResponse {
      data: TeacherPortrait;
    }
  
    /** GET /api/v1/portraits/stats */
    export interface PortraitStatsResponse {
      stats: PortraitStats;
    }
  
    /** GET /api/v1/portraits/class/{class_id} */
    export interface ClassPortraitResponse {
      data: ClassPortrait;
    }
  
    /** GET /api/v1/portraits/student/{student_id}/abilities */
    export interface AbilityRadarResponse {
      abilities: Ability[];
    }
  
    /** GET /api/v1/portraits/student/{student_id}/growth */
    export interface GrowthResponse {
      milestones: Milestone[];
      improvement_rate: number;
      teacher_comments: TeacherComment[];
    }
  
    /** GET /api/v1/portraits/student/{student_id}/recommendations */
    export interface RecommendationsResponse {
      recommendations: string[];
    }
  
    export interface StudentPortrait {
      student_id: string;
      student_name: string;
      class_name: string;
      academic: {
        subjects: Record<string, { score: number; mastery: number; rank: number }>;
        overall_mastery: number;
        trend: 'up' | 'down' | 'stable';
        strengths: string[];
        weaknesses: string[];
      };
      abilities: {
        memory: number;
        comprehension: number;
        application: number;
        analysis: number;
        evaluation: number;
        creation: number;
      };
      behaviors: {
        homework_rate: number;
        homework_accuracy: number;
        participation: number;
        handwriting_score: number;
        learning_habit: 'good' | 'moderate' | 'poor';
      };
      psychology: {
        motivation: number;
        anxiety: number;
        self_efficacy: number;
        cooperation: number;
        stress_level: 'low' | 'medium' | 'high';
      };
      growth: {
        milestones: Milestone[];
        improvement_rate: number;
        teacher_comments: TeacherComment[];
      };
      updated_at: string;
    }
  
    export interface TeacherPortrait {
      teacher_id: string;
      teacher_name: string;
      school_name: string;
      department: string;
      teaching: {
        lesson_plan_quality: number;
        classroom_interaction: number;
        teaching_style: string;
        innovation_score: number;
      };
      research: {
        research_participation: number;
        projects_count: number;
        training_hours: number;
      };
      effectiveness: {
        student_progress: number;
        satisfaction: number;
        peer_evaluation: number;
      };
      growth: {
        capability_evolution: string;
        milestones: Milestone[];
        development_suggestions: string[];
      };
      overall_score: number;
      growth_trend: number;
      updated_at: string;
    }
  
    export interface Ability {
      name: string;
      value: number;
      label: string;
    }
  
    export interface Milestone {
      date: string;
      title: string;
      description: string;
    }
  
    export interface TeacherComment {
      teacher: string;
      content: string;
      date: string;
    }
  
    export interface PortraitStats {
      total_students: number;
      avg_mastery: number;
      avg_abilities: Record<string, number>;
      distribution: {
        excellent: number;
        good: number;
        average: number;
        poor: number;
      };
    }
  
    export interface ClassPortrait {
      class_id: string;
      class_name: string;
      total_students: number;
      avg_mastery: number;
      subject_mastery: Record<string, number>;
      ability_distribution: Record<string, number>;
      top_students: StudentPortrait[];
      bottom_students: StudentPortrait[];
    }
  }
  
  // ============================================================
  // 十三、教育局信息同步模块 (InfoSync)
  // ============================================================
  export namespace InfoSyncAPI {
    /** GET /api/v1/info-sync/sources */
    export interface SourceListResponse {
      items: SourceItem[];
    }
  
    /** POST /api/v1/info-sync/sources */
    export interface CreateSourceRequest {
      source_name: string;
      source_type: 'wechat' | 'website' | 'rss';
      source_url: string;
      feed_url?: string;
      sync_frequency?: 'daily' | 'hourly' | 'weekly';
      sync_time?: string;
      tags?: string[];
    }
  
    /** PUT /api/v1/info-sync/sources/{id} */
    export interface UpdateSourceRequest {
      source_name?: string;
      source_url?: string;
      feed_url?: string;
      sync_frequency?: string;
      sync_time?: string;
      tags?: string[];
      is_active?: boolean;
    }
  
    /** POST /api/v1/info-sync/sync */
    export interface SyncNowResponse {
      task_id: string;
      source_count: number;
      synced_count: number;
      started_at: string;
    }
  
    /** GET /api/v1/info-sync/records */
    export interface SyncRecordsQuery {
      page?: number;
      page_size?: number;
      source_id?: string;
      status?: 'success' | 'failed' | 'partial';
    }
    export interface SyncRecordsResponse {
      items: SyncRecordItem[];
      total: number;
    }
  
    /** GET /api/v1/info-sync/items */
    export interface SyncItemsQuery {
      page?: number;
      page_size?: number;
      type?: 'policy' | 'notice' | 'insight';
      keyword?: string;
    }
    export interface SyncItemsResponse {
      items: SyncItem[];
      total: number;
    }
  
    /** GET /api/v1/info-sync/insights */
    export interface InsightsResponse {
      insights: InsightItem[];
    }
  
    export interface SourceItem {
      id: string;
      source_name: string;
      source_type: string;
      source_url: string;
      feed_url: string;
      sync_frequency: string;
      sync_time: string;
      tags: string[];
      is_active: boolean;
      last_sync_at: string;
      created_at: string;
    }
  
    export interface SyncRecordItem {
      id: string;
      source_id: string;
      source_name: string;
      status: string;
      synced_count: number;
      error_message: string;
      started_at: string;
      completed_at: string;
    }
  
    export interface SyncItem {
      id: string;
      title: string;
      type: 'policy' | 'notice' | 'insight';
      content: string;
      source: string;
      source_url: string;
      published_at: string;
      tags: string[];
      created_at: string;
    }
  
    export interface InsightItem {
      id: string;
      title: string;
      summary: string;
      content: string;
      generated_at: string;
      tags: string[];
    }
  }
  
  // ============================================================
  // 十四、趋势预测模块 (Prediction)
  // ============================================================
  export namespace PredictionAPI {
    /** GET /api/v1/predict/stream */
    export interface PredictStreamQuery {
      grade: string;
      subject: string;
      weeks: 4 | 8 | 12;
      class_id?: string;
    }
  
    /** GET /api/v1/predict/report */
    export interface PredictReportQuery {
      grade: string;
      subject: string;
      weeks: 4 | 8 | 12;
      class_id?: string;
    }
    export interface PredictReportResponse {
      report: PredictionReport;
    }
  
    /** GET /api/v1/predict/export */
    export interface PredictExportQuery {
      grade: string;
      subject: string;
      weeks: 4 | 8 | 12;
      class_id?: string;
      format: 'excel' | 'pdf';
    }
  
    // SSE 事件类型
    export interface PredictStepEvent {
      type: 'step';
      data: {
        id: string;
        type: 'info' | 'analysis' | 'calculation' | 'result' | 'warning' | 'suggestion';
        title: string;
        content: string;
        timestamp: string;
      };
    }
  
    export interface PredictProgressEvent {
      type: 'progress';
      progress: number;
    }
  
    export interface PredictCompleteEvent {
      type: 'complete';
      data: {
        summary: string;
        accuracy: number;
        trend: 'up' | 'down' | 'stable';
        recommendations: string[];
        generated_at: string;
      };
    }
  
    export interface PredictErrorEvent {
      type: 'error';
      code: number;
      message: string;
    }
  
    export interface PredictionReport {
      summary: string;
      accuracy: number;
      trend: 'up' | 'down' | 'stable';
      recommendations: string[];
      data: Array<{
        week: number;
        weekLabel: string;
        actual: number | null;
        predicted: number | null;
        lowerBound: number | null;
        upperBound: number | null;
      }>;
      alerts: Array<{
        severity: 'high' | 'medium' | 'low';
        grade: string;
        className: string;
        subject: string;
        message: string;
        predictedValue: number;
        timeframe: string;
      }>;
      suggestions: Array<{
        id: string;
        type: 'positive' | 'improvement' | 'conclusion';
        title: string;
        description: string;
        actionItems?: string[];
      }>;
      generated_at: string;
    }
  }
  
  // ============================================================
  // 十五、数据导出模块 (Export)
  // ============================================================
  export namespace ExportAPI {
    /** POST /api/v1/export */
    export interface ExportRequest {
      scope: {
        academic?: boolean;
        teacher?: boolean;
        student?: boolean;
        plan?: boolean;
      };
      format: 'excel' | 'pdf' | 'csv' | 'json';
      time_range: '1month' | '3months' | '6months' | '1year';
      grade_id?: string;
      class_id?: string;
    }
    export interface ExportResponse {
      task_id: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      file_name: string;
      file_url?: string;
      download_url?: string;
      expires_at?: string;
      created_at: string;
    }
  
    /** GET /api/v1/export/tasks/{task_id} */
    export interface ExportTaskResponse {
      task_id: string;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      progress: number;
      file_name: string;
      file_size: number;
      download_url?: string;
      error_message?: string;
      created_at: string;
      completed_at?: string;
    }
  
    /** GET /api/v1/export/tasks */
    export interface TaskListQuery {
      page?: number;
      page_size?: number;
      status?: string;
    }
    export interface TaskListResponse {
      items: ExportTaskItem[];
      total: number;
    }
  
    /** GET /api/v1/export/download/{task_id} */
    // 返回文件流
  
    /** DELETE /api/v1/export/tasks/{task_id} */
    export interface DeleteTaskResponse {
      success: boolean;
    }
  
    /** GET /api/v1/export/templates */
    export interface TemplateListResponse {
      items: ExportTemplate[];
    }
  
    export interface ExportTaskItem {
      task_id: string;
      file_name: string;
      format: string;
      status: string;
      progress: number;
      created_at: string;
      completed_at: string;
      download_url?: string;
    }
  
    export interface ExportTemplate {
      id: string;
      name: string;
      description: string;
      scope: {
        academic?: boolean;
        teacher?: boolean;
        student?: boolean;
        plan?: boolean;
      };
      format: string;
      time_range: string;
      is_default: boolean;
    }
  }
  
  // ============================================================
  // 十六、管理驾驶舱模块 (Dashboard)
  // ============================================================
  export namespace DashboardAPI {
    /** GET /api/v1/dashboard/overview */
    export interface OverviewResponse {
      stats: {
        total_students: number;
        total_teachers: number;
        total_classes: number;
        total_documents: number;
        total_lesson_plans: number;
        total_assignments: number;
      };
      trends: {
        mastery_avg: number;
        mastery_change: number;
        active_rate: number;
      };
      alerts: Array<{
        id: string;
        type: 'warning' | 'danger' | 'info';
        title: string;
        description: string;
        time: string;
      }>;
    }
  
    /** GET /api/v1/dashboard/trend */
    export interface TrendQuery {
      weeks?: number;
      grade_id?: string;
    }
    export interface TrendResponse {
      grades: Array<{
        grade: string;
        mastery_rate: number;
        change: number;
        trend: 'up' | 'down' | 'stable';
      }>;
      history: Array<{
        date: string;
        mastery_rate: number;
      }>;
    }
  
    /** GET /api/v1/dashboard/class/{class_id} */
    export interface ClassDashboardResponse {
      class: {
        id: string;
        name: string;
        student_count: number;
      };
      stats: {
        avg_mastery: number;
        pass_rate: number;
        excellent_rate: number;
        trend: 'up' | 'down' | 'stable';
      };
      subjects: Record<string, {
        mastery: number;
        rank: number;
      }>;
      top_students: Array<{
        name: string;
        mastery: number;
      }>;
      bottom_students: Array<{
        name: string;
        mastery: number;
      }>;
    }
  
    /** GET /api/v1/dashboard/stats */
    export interface StatsResponse {
      students: {
        total: number;
        active: number;
        transferred: number;
        graduated: number;
      };
      documents: {
        total: number;
        by_type: Record<string, number>;
        by_permission: Record<string, number>;
      };
      tasks: {
        total: number;
        pending: number;
        reviewing: number;
        completed: number;
      };
    }
  
    /** GET /api/v1/dashboard/activities */
    export interface ActivitiesQuery {
      limit?: number;
      type?: 'create' | 'update' | 'approve' | 'sync';
    }
    export interface ActivitiesResponse {
      items: ActivityItem[];
    }
  
    export interface ActivityItem {
      id: string;
      user: string;
      user_id: string;
      action: string;
      target: string;
      target_type: string;
      time: string;
      type: 'create' | 'update' | 'approve' | 'sync';
      avatar?: string;
    }
  }
  
  // ============================================================
  // 十七、作业打印分发模块 (Assignment)
  // ============================================================
  export namespace AssignmentAPI {
    /** POST /api/v1/assignment/generate-pdf */
    export interface GeneratePDFRequest {
      lesson_plan_id: string;
      class_id: string;
      include_common: boolean;
      include_personalized: boolean;
      personalized_map?: Record<string, Question[]>;
    }
    export interface GeneratePDFResponse {
      task_id: string;
      pdf_url: string;
      total_pages: number;
      total_students: number;
      generated_at: string;
    }
  
    /** GET /api/v1/assignment/preview/{task_id} */
    export interface PreviewResponse {
      task: {
        id: string;
        title: string;
        class_name: string;
        student_name?: string;
        pages: Array<{
          page: number;
          content: string;
        }>;
        common_questions: Question[];
        personalized_questions: Question[];
      };
    }
  
    /** POST /api/v1/assignment/batch-print */
    export interface BatchPrintRequest {
      task_id: string;
      student_ids?: string[];
      copies?: number;
      duplex?: boolean;
      paper_size?: 'A4' | 'B5';
    }
    export interface BatchPrintResponse {
      record_id: string;
      total_students: number;
      total_pages: number;
      print_status: 'pending' | 'printing' | 'completed' | 'failed';
      print_queue_id: string;
    }
  
    /** GET /api/v1/assignment/print-records */
    export interface PrintRecordsQuery {
      page?: number;
      page_size?: number;
      lesson_plan_id?: string;
      class_id?: string;
      status?: 'pending' | 'printing' | 'completed' | 'distributed';
    }
    export interface PrintRecordsResponse {
      items: PrintRecordItem[];
      total: number;
    }
  
    /** PUT /api/v1/assignment/distribute/{record_id} */
    export interface DistributeRequest {
      student_ids?: string[];
      distributed_at?: string;
    }
    export interface DistributeResponse {
      record_id: string;
      distributed_count: number;
      total_count: number;
      status: 'distributed';
    }
  
    export interface Question {
      id: string;
      content: string;
      type: 'choice' | 'fill' | 'answer';
      score: number;
      options?: string[];
      answer?: string;
    }
  
    export interface PrintRecordItem {
      id: string;
      lesson_plan_id: string;
      lesson_plan_title: string;
      class_name: string;
      total_students: number;
      printed_count: number;
      distributed_count: number;
      status: 'pending' | 'printing' | 'completed' | 'distributed';
      created_at: string;
      printed_at: string;
      distributed_at: string;
    }
  }
  
  // ============================================================
  // 通用类型定义
  // ============================================================
  
  /** 通用API响应 */
  export interface APIResponse<T = any> {
    code: number;
    message: string;
    data: T;
    timestamp: string;
  }
  
  /** 分页参数 */
  export interface PaginationParams {
    page?: number;
    page_size?: number;
  }
  
  /** 排序参数 */
  export interface SortParams {
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }
  
  /** 学生信息（通用） */
  export interface StudentInfo {
    id: string;
    name: string;
    student_no: string;
    class_name: string;
    grade_name: string;
    school_name: string;
    mastery_rate: number;
  }
  
  /** 教师信息（通用） */
  export interface TeacherInfo {
    id: string;
    name: string;
    subject: string;
    class_name: string;
    grade_name: string;
    school_name: string;
  }
  
  /** 班级信息（通用） */
  export interface ClassInfo {
    id: string;
    name: string;
    grade_name: string;
    school_name: string;
    student_count: number;
  }


