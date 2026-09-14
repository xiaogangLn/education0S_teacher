import { httpClient } from '../client';

/** 与后端 PaymentChannelConfig / Order 视图对齐 */
export interface PaymentChannelConfigItem {
  code: string;
  enabled: boolean;
  pay_types: string[];
  notify_url: string | null;
  remark: string | null;
  /** 各参数键是否已配置（不回显原文） */
  params_configured: Record<string, boolean>;
  updated_by: string | null;
  updated_at: string;
}

export interface PaymentOrderItem {
  id: string;
  school_id: string;
  product_type: string;
  plan_code: string | null;
  period_days: number;
  amount_fen: number;
  currency: string;
  status: string;
  channel: string;
  out_trade_no: string;
  provider_trade_no: string | null;
  paid_at: string | null;
  fulfilled_at: string | null;
  closed_at: string | null;
  code_url?: string;
  created_at: string;
  updated_at: string;
}

export type UpdatePaymentChannelPayload = {
  enabled?: boolean;
  pay_types?: string[];
  notify_url?: string | null;
  remark?: string | null;
  /** 空串表示删除该键；未传的键保持原值 */
  params?: Record<string, string | null | undefined>;
};

export const paymentsService = {
  listChannels: () => {
    return httpClient.get<{ items: PaymentChannelConfigItem[]; total: number }>(
      '/payments/admin/channels',
    );
  },
  updateChannel: (code: string, data: UpdatePaymentChannelPayload) => {
    return httpClient.put<PaymentChannelConfigItem>(`/payments/admin/channels/${code}`, data);
  },
  listOrders: (params?: {
    school_id?: string;
    status?: string;
    channel?: string;
    keyword?: string;
    limit?: number;
  }) => {
    return httpClient.get<{ items: PaymentOrderItem[]; total: number }>(
      '/payments/admin/orders',
      { params },
    );
  },
  confirmOrder: (id: string, data?: { provider_trade_no?: string }) => {
    return httpClient.post<PaymentOrderItem>(`/payments/admin/orders/${id}/confirm`, data || {});
  },
  fulfillOrder: (id: string) => {
    return httpClient.post<PaymentOrderItem>(`/payments/admin/orders/${id}/fulfill`, {});
  },
  closeOrder: (id: string, data?: { reason?: string }) => {
    return httpClient.post<PaymentOrderItem>(`/payments/admin/orders/${id}/close`, data || {});
  },
};
