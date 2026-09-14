import React from 'react';
import { ImageCaptchaField, type ImageCaptchaValue } from '@/components/ImageCaptchaField';
import { HumanVerifySlider } from '@/components/HumanVerifySlider';

interface Step2Props {
  formData: any;
  formErrors: Record<string, string>;
  setCurrentStep: (step: number) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isLoading: boolean;
  handleRegister: () => void;
  captcha: ImageCaptchaValue;
  setCaptcha: (value: ImageCaptchaValue) => void;
  captchaNonce: number;
  humanToken: string;
  setHumanToken: (value: string) => void;
  humanNonce: number;
}

/**
 * 能力：注册第二步 — 邮箱 + 图片验证码 + 人机滑块。
 * 输入：表单状态与回调。
 * 输出：提交注册。
 */
const Step2: React.FC<Step2Props> = ({
  formData,
  formErrors,
  setCurrentStep,
  handleInputChange,
  isLoading,
  handleRegister,
  captcha,
  setCaptcha,
  captchaNonce,
  humanToken,
  setHumanToken,
  humanNonce,
}) => {
  return (
    <>
      <div className="bg-gray-50 rounded-xl p-4 my-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">✉️</span>
          <span className="text-sm font-semibold text-gray-800">邮箱确认</span>
        </div>
        <p className="text-sm text-gray-400 mb-3">
          注册成功后将向邮箱发送确认链接，点击后才算注册完成。手机号{' '}
          <span className="font-medium text-gray-700">{formData.phone}</span>
        </p>

        <label className="block text-sm font-medium text-gray-800 mb-1">
          邮箱 <span className="text-red-500">*</span>
        </label>
        <div
          className={`
            flex items-center border-2 rounded-xl transition-all duration-200 bg-white mb-3
            ${formErrors.email ? 'border-red-500' : 'border-gray-200 focus-within:border-blue-500'}
          `}
        >
          <input
            type="email"
            name="email"
            placeholder="请输入常用邮箱"
            value={formData.email || ''}
            onChange={handleInputChange}
            className="w-full py-2.5 px-3 border-none bg-transparent text-sm text-gray-800 outline-none"
          />
        </div>
        {formErrors.email && (
          <span className="text-xs text-red-500 mt-1 mb-2 block">{formErrors.email}</span>
        )}

        <label className="block text-sm font-medium text-gray-800 mb-1">
          图片验证码 <span className="text-red-500">*</span>
        </label>
        <ImageCaptchaField
          key={captchaNonce}
          value={captcha}
          onChange={setCaptcha}
          disabled={isLoading}
        />
        {formErrors.captcha && (
          <span className="text-xs text-red-500 mt-1 mb-3 block">{formErrors.captcha}</span>
        )}

        <label className="block text-sm font-medium text-gray-800 mb-1 mt-3">
          人机验证 <span className="text-red-500">*</span>
        </label>
        <HumanVerifySlider
          key={humanNonce}
          value={humanToken}
          onChange={setHumanToken}
          disabled={isLoading}
        />
        {formErrors.human && (
          <span className="text-xs text-red-500 mt-1 block">{formErrors.human}</span>
        )}
      </div>

      <button
        className={`
          w-full py-3 bg-gradient-to-r from-blue-500 to-blue-400 border-none rounded-xl text-sm font-semibold text-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(22,119,255,0.35)] font-sans
          ${isLoading ? 'opacity-80' : ''}
        `}
        onClick={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? '⏳ 提交中...' : '📨 提交注册并发送确认邮件'}
      </button>

      <button
        className="block bg-none border-none text-gray-400 text-sm cursor-pointer mx-auto mt-3 font-sans hover:text-blue-500 transition-colors"
        onClick={() => setCurrentStep(1)}
        disabled={isLoading}
      >
        ← 返回上一步
      </button>
    </>
  );
};

export default Step2;
