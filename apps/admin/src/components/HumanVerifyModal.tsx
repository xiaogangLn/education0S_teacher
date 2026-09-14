import React, { useCallback, useEffect, useState } from 'react';
import { Modal } from 'antd';
import { HumanVerifySlider } from '@/components/HumanVerifySlider';

interface HumanVerifyModalProps {
  open: boolean;
  onCancel: () => void;
  onVerified: (humanToken: string) => void;
  nonce?: number;
  confirming?: boolean;
}

/**
 * 能力：Admin 登录触发后的人机滑块弹窗。
 * 输入：open、onVerified、onCancel。
 * 输出：校验成功时回传 human_token。
 */
export const HumanVerifyModal: React.FC<HumanVerifyModalProps> = ({
  open,
  onCancel,
  onVerified,
  nonce = 0,
  confirming = false,
}) => {
  const [token, setToken] = useState('');

  useEffect(() => {
    if (open) setToken('');
  }, [open, nonce]);

  const handleChange = useCallback(
    (next: string) => {
      setToken(next);
      if (next.trim()) {
        onVerified(next.trim());
      }
    },
    [onVerified],
  );

  return (
    <Modal
      title="人机验证"
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      destroyOnClose
      maskClosable={!confirming}
      closable={!confirming}
      width={360}
      styles={{ body: { paddingTop: 8 } }}
    >
      <HumanVerifySlider
        key={nonce}
        value={token}
        onChange={handleChange}
        disabled={confirming}
      />
    </Modal>
  );
};
