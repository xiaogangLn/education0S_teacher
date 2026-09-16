import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { Input } from '@ui';
import { authService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import styles from './ImageCaptchaField.module.scss';

export interface ImageCaptchaValue {
  captcha_id: string;
  captcha_code: string;
}

interface ImageCaptchaFieldProps {
  value?: ImageCaptchaValue;
  onChange?: (value: ImageCaptchaValue) => void;
  disabled?: boolean;
  className?: string;
  /** 变化时触发重新拉取验证码（代替外层 key 重挂载，避免兄弟节点 key 冲突） */
  refreshKey?: number;
}

/**
 * 能力：图片验证码输入（拉取/刷新/填写），样式与登录账号密码框一致。
 * 输入：受控 value / onChange；refreshKey 变化时重新拉取。
 * 输出：通过 onChange 回传 captcha_id + captcha_code。
 */
export const ImageCaptchaField: React.FC<ImageCaptchaFieldProps> = ({
  value,
  onChange,
  disabled,
  className,
  refreshKey,
}) => {
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  // 用 ref 持有 onChange：父组件传内联回调也不会影响 refresh 的稳定性
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });
  const inFlightRef = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setLoading(true);
    try {
      const res = await authService.getCaptcha();
      const payload = extractPayload<{ captcha_id: string; image_base64: string }>(res) || (res as any);
      const captchaId = payload?.captcha_id || '';
      const imageBase64 = payload?.image_base64 || '';
      setImage(imageBase64);
      onChangeRef.current?.({
        captcha_id: captchaId,
        captcha_code: '',
      });
    } catch {
      setImage('');
      onChangeRef.current?.({ captcha_id: '', captcha_code: '' });
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  // 用 ref 持有 refresh：effect 只依赖 refreshKey
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  });
  const lastRefreshKeyRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // StrictMode 重放保护：同一个 refreshKey 只自动拉取一次
    if (lastRefreshKeyRef.current === refreshKey) return;
    lastRefreshKeyRef.current = refreshKey;
    void refreshRef.current();
  }, [refreshKey]);

  return (
    <div className={`${styles.row} ${className || ''}`}>
      <div className={styles.inputWrapper}>
        <span className={styles.prefix}>🛡️</span>
        <Input
          type="text"
          value={value?.captcha_code || ''}
          onChange={(e) =>
            onChange?.({
              captcha_id: value?.captcha_id || '',
              captcha_code: e.target.value.trim(),
            })
          }
          placeholder="请输入图片验证码"
          maxLength={8}
          disabled={disabled || loading}
          autoComplete="off"
          className="!h-auto !border-0 !rounded-none !bg-transparent !px-0 !py-0 !shadow-none focus:!ring-0 focus:!border-transparent"
        />
      </div>
      <button
        type="button"
        className={styles.imageBtn}
        onClick={() => void refresh()}
        disabled={disabled || loading}
        title="看不清？点击刷新"
      >
        {loading ? (
          <Spin size="small" />
        ) : image ? (
          <img src={image} alt="验证码" />
        ) : (
          <span className={styles.placeholder}>点击获取</span>
        )}
        <ReloadOutlined className={styles.reload} />
      </button>
    </div>
  );
};

/**
 * 能力：对外暴露刷新方法时使用的轻量 hook。
 * 输入：无。
 * 输出：captcha 状态与 refresh/setCode。
 */
export function useImageCaptcha() {
  const [captcha, setCaptcha] = useState<ImageCaptchaValue>({
    captcha_id: '',
    captcha_code: '',
  });

  const refresh = useCallback(async () => {
    const res = await authService.getCaptcha();
    const payload = extractPayload<{ captcha_id: string; image_base64: string }>(res) || (res as any);
    setCaptcha({ captcha_id: payload?.captcha_id || '', captcha_code: '' });
    return payload?.image_base64 || '';
  }, []);

  return { captcha, setCaptcha, refresh };
}
