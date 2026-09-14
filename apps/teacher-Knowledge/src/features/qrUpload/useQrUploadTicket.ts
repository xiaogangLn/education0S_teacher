import { useCallback, useEffect, useState } from 'react';
import { message } from 'antd';
import { buildMobileUploadUrl, createQrTicket, readQrTicket } from './api';
import type { CreateQrTicketInput, QrTicketView } from './types';

type Options = {
  onDone?: (ticket: QrTicketView) => void;
};

export function useQrUploadTicket(options: Options = {}) {
  const { onDone } = options;
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [ticket, setTicket] = useState<QrTicketView | null>(null);
  const qrUrl = ticket?.token ? buildMobileUploadUrl(ticket.token) : '';

  const close = useCallback(() => {
    setOpen(false);
    setTicket(null);
  }, []);

  const create = useCallback(async (payload: CreateQrTicketInput) => {
    setCreating(true);
    try {
      const next = await createQrTicket(payload);
      if (!next?.token) throw new Error('未能生成二维码');
      setTicket(next);
      setOpen(true);
    } catch (error: any) {
      message.error(error?.message || '生成二维码失败');
    } finally {
      setCreating(false);
    }
  }, []);

  useEffect(() => {
    if (!open || !ticket?.token) return;
    if (ticket.status === 'done' || ticket.status === 'failed' || ticket.status === 'expired') return;
    const token = ticket.token;
    const timer = window.setInterval(async () => {
      try {
        const latest = await readQrTicket(token);
        setTicket((prev) => ({ ...(prev || latest), ...latest, token }));
        if (latest.status === 'done') {
          onDone?.({ ...latest, token });
          setOpen(false);
          setTicket(null);
        } else if (latest.status === 'failed') {
          message.error(latest.message || '上传失败');
        }
      } catch {
        // keep polling until expired
      }
    }, 2500);
    return () => window.clearInterval(timer);
  }, [open, ticket?.token, ticket?.status, onDone]);

  return { open, creating, ticket, qrUrl, create, close };
}
