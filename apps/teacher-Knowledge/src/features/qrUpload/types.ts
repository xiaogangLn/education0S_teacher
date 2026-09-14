export type QrUploadPurpose = 'grade' | 'homework';

export type QrTicketView = {
  token?: string;
  purpose?: QrUploadPurpose;
  status: string;
  subject: string;
  assignment_title: string;
  student_name: string;
  expires_at: string;
  expire_in: number;
  record_id?: string;
  message?: string;
  images?: string[];
  max_images?: number;
};

export type CreateQrTicketInput = {
  purpose?: QrUploadPurpose;
  student_id?: string;
  class_id?: string;
  subject?: string;
  assignment_title?: string;
  learning_record_id?: string;
};
