import React, { useCallback, useEffect, useState } from 'react';
import { Spin } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { Input } from '@ui';
import { authService } from '@api/index';
import styles from './ImageCaptchaField.module.scss';

export interface ImageCaptchaValue {
  captcha_id: string;
  captcha_code: string;
}

interface ImageCaptchaFieldProps {
  value?: ImageCaptchaValue;
  onChange?: (value: ImageCaptchaValue) => void;
  disabled?: boolean;
}

function extractPayload<T = any>(response: any): T {
  return (response?.data ?? response) as T;
}

/**
 * 能力：Admin 登录用图片验证码，样式与账号密码框一致。
 * 输入：受控 value/onChange。
 * 输出：captcha_id + captcha_code。
 */
export const ImageCaptchaField: React.FC<ImageCaptchaFieldProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authService.getCaptcha();
      const payload = extractPayload<{ captcha_id: string; image_base64: string }>(res);
      setImage(payload?.image_base64 || '');
      onChange?.({ captcha_id: payload?.captcha_id || '', captcha_code: '' });
    } catch {
      setImage('');
      onChange?.({ captcha_id: '', captcha_code: '' });
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.row}>
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
        title="刷新验证码"
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
