// packages/shared/src/api/services/auth.ts
import { httpClient } from '../client';

export interface LoginParams {
  phone: string;
  password: string;
  remember?: boolean;
  captcha_id?: string;
  captcha_code?: string;
  /** 滑块人机验证一次性令牌 */
  human_token?: string;
}

export interface QuotaView {
  used: number;
  limit: number | null;
}

export interface TenantInfo {
  id: string;
  type: 'education' | 'commercial';
  billing_mode: 'exempt' | 'subscription';
  plan_code: 'exempt' | 'basic' | 'pro' | 'turbo';
  plan_expires_at: string | null;
  student_trial_ends_at?: string | null;
  /** 师生画像共用回写间隔（天） */
  portrait_refresh_interval_days?: number;
  portrait_refresh_policy?: string;
}

export interface EntitlementsInfo {
  self_add_student: boolean;
  manage_students: boolean;
  import_roster: boolean;
  ai_grading: boolean;
  show_billing: boolean;
  generate_personalized_homework: boolean;
  update_student_portrait: boolean;
}

export interface UserInfo {
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
  subjects?: string[];
  exam_types?: Array<{
    subject: string;
    key: string;
    label: string;
    default_count: number;
    sort_order?: number;
  }>;
}

export interface AuthSessionPayload {
  user: UserInfo;
  tenant: TenantInfo | null;
  entitlements: EntitlementsInfo;
  quotas: {
    students: QuotaView;
    ai_grading: QuotaView;
    lesson_plan: QuotaView;
    courseware: QuotaView;
    exam: QuotaView;
  };
}

export interface RegisterParams {
  phone: string;
  password: string;
  name: string;
  /** 任教学段：小学 / 初中 / 高中 */
  stage: string;
  /** 任教学科，至少一门 */
  subjects: string[];
  email: string;
  code?: string;
  captcha_id?: string;
  captcha_code?: string;
  human_token?: string;
}

export const authService = {
  /**
   * 能力：账号密码登录（图片验证码 + 人机令牌）。
   * 输入：phone、password、可选 remember/captcha/human_token。
   * 输出：会话 token + 用户视图。
   */
  login: (params: LoginParams) => {
    return httpClient.post<{ access_token: string; refresh_token: string; expires_in: number } & AuthSessionPayload>(
      '/auth/login',
      {
        phone: params.phone,
        password: params.password,
        remember: params.remember,
        captcha_id: params.captcha_id,
        captcha_code: params.captcha_code,
        human_token: params.human_token,
      },
    );
  },

  /**
   * 能力：商业教师注册（邮箱确认流）。
   * 输入：RegisterParams（含 captcha / email）。
   * 输出：need_email_confirm 结果，或兼容旧版会话。
   */
  register: (params: RegisterParams) => {
    return httpClient.post<
      | ({ access_token: string; refresh_token: string; expires_in: number } & AuthSessionPayload)
      | {
          need_email_confirm: true;
          email: string;
          message: string;
          debug_confirm_url?: string;
        }
    >('/auth/register', params);
  },

  refresh: (refreshToken: string) => {
    return httpClient.post<{ access_token: string; expires_in: number }>('/auth/refresh', { refreshToken });
  },

  logout: () => {
    return httpClient.post<{ success: boolean }>('/auth/logout');
  },

  getMe: () => {
    return httpClient.get<AuthSessionPayload>('/auth/me');
  },

  /**
   * 能力：获取图片验证码。
   * 输入：无。
   * 输出：captcha_id + image_base64。
   */
  getCaptcha: () => {
    return httpClient.get<{ captcha_id: string; image_base64: string; expires_in: number }>(
      '/auth/captcha',
    );
  },

  /**
   * 能力：获取滑块人机挑战。
   * 输入：无。
   * 输出：拼图挑战载荷。
   */
  getHumanChallenge: () => {
    return httpClient.get<{
      challenge_id: string;
      background_base64: string;
      piece_base64: string;
      piece_y: number;
      canvas_width: number;
      canvas_height: number;
      piece_size: number;
      expires_in: number;
    }>('/auth/human-challenge');
  },

  /**
   * 能力：校验滑块并换取 human_token。
   * 输入：challenge_id、offset_x。
   * 输出：human_token。
   */
  verifyHuman: (data: { challenge_id: string; offset_x: number }) => {
    return httpClient.post<{ human_token: string; expires_in: number }>('/auth/human/verify', data);
  },

  /**
   * 能力：确认注册邮箱。
   * 输入：token。
   * 输出：确认结果。
   */
  confirmEmail: (token: string) => {
    return httpClient.post<{ success: boolean; message: string; phone?: string }>(
      '/auth/email/confirm',
      { token },
    );
  },

  /**
   * 能力：重发注册确认邮件。
   * 输入：phone、email?、captcha、human_token。
   * 输出：发送结果。
   */
  resendConfirmEmail: (data: {
    phone: string;
    email?: string;
    captcha_id?: string;
    captcha_code?: string;
    human_token?: string;
  }) => {
    return httpClient.post<{
      email: string;
      message: string;
      debug_confirm_url?: string;
    }>('/auth/email/resend', data);
  },

  updateProfile: (data: {
    real_name?: string;
    name?: string;
    email?: string;
    avatar_url?: string;
    stage?: string;
    subjects?: string[];
    subject?: string;
  }) => {
    return httpClient.put<{ user: UserInfo }>('/auth/profile', data);
  },

  /** 上传头像图片，返回可访问的 avatar_url，并写入当前用户资料 */
  uploadAvatar: (file: File | Blob, fileName?: string) => {
    const formData = new FormData();
    formData.append('file', file, fileName || (file as File).name || 'avatar.png');
    return httpClient.post<{ avatar_url: string; user: UserInfo }>('/auth/avatar', formData);
  },

  changePassword: (oldPassword: string, newPassword: string) => {
    return httpClient.put('/auth/password', { old_password: oldPassword, new_password: newPassword });
  },

  sendCode: (phone: string, type: 'login' | 'register' | 'reset') => {
    return httpClient.post<{ code: string; expires_in: number }>('/auth/code/send', { phone, type });
  },

  verifyCode: (phone: string, code: string, type: 'login' | 'register' | 'reset') => {
    return httpClient.post<{ valid: boolean }>('/auth/code/verify', { phone, code, type });
  },

  /**
   * 能力：发送密码重置邮箱验证码。
   * 输入：phone、email、图片码、人机令牌。
   * 输出：发送结果（非生产可含 debug_code）。
   */
  sendResetPasswordCode: (data: {
    phone: string;
    email: string;
    captcha_id?: string;
    captcha_code?: string;
    human_token?: string;
  }) => {
    return httpClient.post<{
      message: string;
      expires_in: number;
      masked_email?: string;
      debug_code?: string;
    }>('/auth/password/reset/send-code', data);
  },

  /**
   * 能力：邮箱验证码重置密码。
   * 输入：phone、email、code、new_password、图片码、人机令牌。
   * 输出：重置结果。
   */
  resetPassword: (data: {
    phone: string;
    email: string;
    code: string;
    new_password: string;
    captcha_id?: string;
    captcha_code?: string;
    human_token?: string;
  }) => {
    return httpClient.post<{ success: boolean; message: string }>('/auth/password/reset', data);
  },
};
