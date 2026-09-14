import { knowledgeService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import type { CreateQrTicketInput, QrTicketView } from './types';

export function buildMobileUploadUrl(token: string) {
  return `${window.location.origin}/m/grade/${token}`;
}

export function isLocalHostOrigin() {
  return /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
}

export async function createQrTicket(input: CreateQrTicketInput) {
  return extractPayload<QrTicketView>(await knowledgeService.createGradingTicket(input));
}

export async function readQrTicket(token: string) {
  return extractPayload<QrTicketView>(await knowledgeService.getGradingTicket(token));
}

export async function submitQrTicket(token: string, imageUrls: string[]) {
  return extractPayload<QrTicketView & { subject_mismatch?: boolean; ai_feedback?: string }>(
    await knowledgeService.submitGradingTicket(token, { image_urls: imageUrls }),
  );
}
