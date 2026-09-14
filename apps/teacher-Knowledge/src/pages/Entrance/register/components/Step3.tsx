import React, { useState } from 'react';
import { message } from 'antd';
import { authService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';
import { ImageCaptchaField, type ImageCaptchaValue } from '@/components/ImageCaptchaField';
import { HumanVerifySlider } from '@/components/HumanVerifySlider';

interface Step3Props {
  formData: any;
  debugConfirmUrl?: string;
}

/**
 * 能力：展示「等待邮箱确认」结果页，并支持重发确认邮件。
 * 输入：注册表单摘要、可选 debug 链接。
 * 输出：引导用户查收邮件并完成确认。
 */
const Step3: React.FC<Step3Props> = ({ formData, debugConfirmUrl }) => {
  const [captcha, setCaptcha] = useState<ImageCaptchaValue>({
    captcha_id: '',
    captcha_code: '',
  });
  const [captchaNonce, setCaptchaNonce] = useState(0);
  const [humanToken, setHumanToken] = useState('');
  const [humanNonce, setHumanNonce] = useState(0);
  const [sending, setSending] = useState(false);

  const handleResend = async () => {
    if (!captcha.captcha_id || !captcha.captcha_code) {
      message.warning('请填写图片验证码');
      return;
    }
    if (!humanToken.trim()) {
      message.warning('请先完成人机滑块验证');
      return;
    }
    setSending(true);
    try {
      const res = await authService.resendConfirmEmail({
        phone: formData.phone,
        email: formData.email,
        captcha_id: captcha.captcha_id,
        captcha_code: captcha.captcha_code,
        human_token: humanToken.trim(),
      });
      const payload = extractPayload<{ message?: string; debug_confirm_url?: string }>(res) || (res as any);
      message.success(payload?.message || '确认邮件已发送');
      if (payload?.debug_confirm_url && import.meta.env.DEV) {
        message.info(`调试链接：${payload.debug_confirm_url}`, 8);
      }
    } catch (error: any) {
      message.error(error?.message || '发送失败');
    } finally {
      setSending(false);
      setCaptcha({ captcha_id: '', captcha_code: '' });
      setCaptchaNonce((n) => n + 1);
      setHumanToken('');
      setHumanNonce((n) => n + 1);
    }
  };

  return (
    <div className="text-center pt-5 pb-2.5">
      <div className="text-6xl">📬</div>
      <h2 className="text-2xl font-bold text-gray-800 mt-2 mb-1">请确认邮箱</h2>
      <p className="text-sm text-gray-400 leading-relaxed">
        我们已向 <span className="font-medium text-gray-700">{formData.email}</span> 发送确认链接
        <br />
        点击邮件中的链接后，注册才算完成，然后即可登录
      </p>

      <div className="bg-gray-50 rounded-xl p-3.5 my-4 text-left border border-gray-200">
        <div className="flex justify-between py-1.5 border-b border-gray-100">
          <span className="text-sm text-gray-400">姓名</span>
          <span className="text-sm font-medium text-gray-800">{formData.realName}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-gray-100">
          <span className="text-sm text-gray-400">手机号</span>
          <span className="text-sm font-medium text-gray-800">{formData.phone}</span>
        </div>
        <div className="flex justify-between py-1.5">
          <span className="text-sm text-gray-400">邮箱</span>
          <span className="text-sm font-medium text-gray-800">{formData.email}</span>
        </div>
      </div>

      {debugConfirmUrl && import.meta.env.DEV ? (
        <p className="text-xs text-amber-600 mb-3 break-all text-left">
          开发调试确认链接：
          <a className="text-blue-500 underline" href={debugConfirmUrl}>
            {debugConfirmUrl}
          </a>
        </p>
      ) : null}

      <div className="text-left mb-3 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">重发前请填写图片验证码</label>
          <ImageCaptchaField
            key={captchaNonce}
            value={captcha}
            onChange={setCaptcha}
            disabled={sending}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">人机验证</label>
          <HumanVerifySlider
            key={humanNonce}
            value={humanToken}
            onChange={setHumanToken}
            disabled={sending}
          />
        </div>
      </div>

      <button
        type="button"
        className="w-full py-2.5 mb-2 rounded-xl border border-blue-200 text-blue-600 text-sm font-medium hover:bg-blue-50"
        onClick={() => void handleResend()}
        disabled={sending}
      >
        {sending ? '发送中...' : '重发确认邮件'}
      </button>
    </div>
  );
};

export default Step3;
