import React, { useEffect, useState } from 'react';
import { Alert, Modal, QRCode, Typography } from 'antd';
import { isLocalHostOrigin } from './api';
import type { QrTicketView } from './types';

const STATUS_TEXT: Record<string, string> = {
  pending: '等待手机拍照上传',
  grading: '手机已提交，正在识别…',
  done: '上传完成',
  failed: '上传失败',
  expired: '二维码已过期',
};

type Props = {
  open: boolean;
  qrUrl: string;
  ticket: QrTicketView | null;
  onClose: () => void;
};

const QrUploadModal: React.FC<Props> = ({ open, qrUrl, ticket, onClose }) => {
  const [remain, setRemain] = useState(0);
  const homework = ticket?.purpose === 'homework';

  useEffect(() => {
    if (!open || !ticket?.expires_at) {
      setRemain(0);
      return;
    }
    const tick = () => setRemain(Math.max(0, new Date(ticket.expires_at).getTime() - Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [open, ticket?.expires_at]);

  const minutes = Math.floor(remain / 60000);
  const seconds = Math.floor((remain % 60000) / 1000);

  return (
    <Modal
      title={homework ? '手机扫码上传作业' : '手机扫码拍照批改'}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      zIndex={1300}
    >
      <div className="flex flex-col items-center gap-3 py-2">
        {isLocalHostOrigin() ? (
          <Alert
            type="warning"
            showIcon
            className="w-full"
            message="当前是 localhost，手机扫不开。请用电脑的局域网 IP 打开本页后再生成二维码。"
          />
        ) : null}
        {qrUrl ? <QRCode value={qrUrl} size={196} /> : null}
        <div className="text-center text-sm text-gray-600">
          <div>{ticket?.student_name || '未指定学生'} · {ticket?.subject} · {ticket?.assignment_title}</div>
          <div className="mt-1 text-xs text-gray-400">
            {STATUS_TEXT[ticket?.status || 'pending'] || ticket?.status}
            {remain > 0 ? ` · ${minutes}:${String(seconds).padStart(2, '0')} 后过期` : ''}
          </div>
        </div>
        <Typography.Paragraph copyable className="mb-0 max-w-full text-center text-xs text-gray-400">
          {qrUrl}
        </Typography.Paragraph>
      </div>
    </Modal>
  );
};

export default QrUploadModal;
