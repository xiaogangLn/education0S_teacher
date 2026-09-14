// src/components/Register/Step1.tsx

import React from 'react';
import { Link } from 'react-router-dom';

interface Step1Props {
  formData: any;
  formErrors: Record<string, string>;
  showPassword: boolean;
  showConfirmPassword: boolean;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  toggleSubject: (subject: string) => void;
  handleNextStep: () => void;
}

const STAGE_OPTIONS = ['小学', '初中', '高中'] as const;

const SUBJECT_OPTIONS = [
  '语文',
  '数学',
  '英语',
  '物理',
  '化学',
  '生物',
  '历史',
  '地理',
  '政治',
];

const Step1: React.FC<Step1Props> = ({
  formData,
  formErrors,
  showPassword,
  showConfirmPassword,
  setShowPassword,
  setShowConfirmPassword,
  setFormData,
  handleInputChange,
  toggleSubject,
  handleNextStep,
}) => {
  return (
    <>
      {/* 真实姓名 */}
      <div className="mb-3.5">
        <label className="block text-sm font-medium text-gray-800 mb-1">
          真实姓名 <span className="text-red-500">*</span>
        </label>
        <div className={`
          flex items-center border-2 rounded-xl transition-all duration-200 bg-gray-50
          ${formErrors.realName ? 'border-red-500' : 'border-gray-200 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(22,119,255,0.1)]'}
        `}>
          <span className="px-3 text-gray-400">📛</span>
          <input
            type="text"
            name="realName"
            placeholder="请输入真实姓名"
            value={formData.realName}
            onChange={handleInputChange}
            className="w-full py-2.5 px-2 border-none bg-transparent text-sm text-gray-800 outline-none font-normal"
          />
        </div>
        {formErrors.realName && <span className="text-xs text-red-500 mt-1 block">{formErrors.realName}</span>}
      </div>

      {/* 密码 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="mb-3.5 sm:mb-0">
          <label className="block text-sm font-medium text-gray-800 mb-1">
            密码 <span className="text-red-500">*</span>
          </label>
          <div className={`
            flex items-center border-2 rounded-xl transition-all duration-200 bg-gray-50
            ${formErrors.password ? 'border-red-500' : 'border-gray-200 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(22,119,255,0.1)]'}
          `}>
            <span className="px-3 text-gray-400">🔑</span>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="至少8位，包含字母和数字"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full py-2.5 px-2 border-none bg-transparent text-sm text-gray-800 outline-none font-normal"
            />
            <button
              type="button"
              className="px-3 text-base opacity-60 hover:opacity-100 transition-opacity"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {formErrors.password && <span className="text-xs text-red-500 mt-1 block">{formErrors.password}</span>}
        </div>

        <div className="mb-3.5">
          <label className="block text-sm font-medium text-gray-800 mb-1">
            确认密码 <span className="text-red-500">*</span>
          </label>
          <div className={`
            flex items-center border-2 rounded-xl transition-all duration-200 bg-gray-50
            ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-200 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(22,119,255,0.1)]'}
          `}>
            <span className="px-3 text-gray-400">🔐</span>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="再次输入密码"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full py-2.5 px-2 border-none bg-transparent text-sm text-gray-800 outline-none font-normal"
            />
            <button
              type="button"
              className="px-3 text-base opacity-60 hover:opacity-100 transition-opacity"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {formErrors.confirmPassword && <span className="text-xs text-red-500 mt-1 block">{formErrors.confirmPassword}</span>}
        </div>
      </div>

      {/* 联系方式 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="mb-3.5 sm:mb-0">
          <label className="block text-sm font-medium text-gray-800 mb-1">
            手机号 <span className="text-red-500">*</span>
          </label>
          <div className={`
            flex items-center border-2 rounded-xl transition-all duration-200 bg-gray-50
            ${formErrors.phone ? 'border-red-500' : 'border-gray-200 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(22,119,255,0.1)]'}
          `}>
            <span className="px-3 text-gray-400">📱</span>
            <input
              type="tel"
              name="phone"
              placeholder="请输入手机号"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full py-2.5 px-2 border-none bg-transparent text-sm text-gray-800 outline-none font-normal"
            />
          </div>
          {formErrors.phone && <span className="text-xs text-red-500 mt-1 block">{formErrors.phone}</span>}
        </div>

        <div className="mb-3.5">
          <label className="block text-sm font-medium text-gray-800 mb-1">邮箱</label>
          <div className="flex items-center border-2 border-gray-200 rounded-xl transition-all duration-200 bg-gray-50 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(22,119,255,0.1)]">
            <span className="px-3 text-gray-400">✉️</span>
            <input
              type="email"
              name="email"
              placeholder="请输入邮箱（选填）"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full py-2.5 px-2 border-none bg-transparent text-sm text-gray-800 outline-none font-normal"
            />
          </div>
        </div>
      </div>

      {/* 任教年级 + 学科 */}
      <div className="mb-3.5">
        <label className="block text-sm font-medium text-gray-800 mb-1">
          任教年级 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {STAGE_OPTIONS.map((stage) => (
            <button
              key={stage}
              type="button"
              className={`
                py-2.5 border-2 rounded-xl text-sm font-medium transition-all duration-200
                ${formData.stage === stage
                  ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-[0_0_0_3px_rgba(22,119,255,0.15)]'
                  : 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                }
              `}
              onClick={() => {
                setFormData((prev: any) => ({ ...prev, stage }));
              }}
            >
              {stage}
            </button>
          ))}
        </div>
        {formErrors.stage && <span className="text-xs text-red-500 mt-1 block">{formErrors.stage}</span>}
      </div>

      <div className="mb-3.5">
        <label className="block text-sm font-medium text-gray-800 mb-1">
          任教学科 <span className="text-red-500">*</span>
          <span className="ml-1 text-xs font-normal text-gray-400">可多选</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SUBJECT_OPTIONS.map((subject) => {
            const selected = (formData.subjects || []).includes(subject);
            return (
              <button
                key={subject}
                type="button"
                className={`
                  px-3 py-1.5 border-2 rounded-lg text-sm transition-all duration-200
                  ${selected
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 text-gray-700 hover:border-blue-300'
                  }
                `}
                onClick={() => toggleSubject(subject)}
              >
                {subject}
              </button>
            );
          })}
        </div>
        {formErrors.subjects && <span className="text-xs text-red-500 mt-1 block">{formErrors.subjects}</span>}
      </div>

      {/* 联系方式 */}
      <div className={`mb-2.5 ${formErrors.agreeTerms ? 'text-red-500' : ''}`}>
        <label className="flex items-start gap-2 text-sm text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleInputChange}
            className="w-4 h-4 accent-blue-500 mt-0.5 flex-shrink-0 cursor-pointer"
          />
          <span>
            我已阅读并同意{' '}
            <Link
              to="/legal/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              《用户服务协议》
            </Link>
            {' '}和{' '}
            <Link
              to="/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              《隐私政策》
            </Link>
          </span>
        </label>
        {formErrors.agreeTerms && <span className="text-xs text-red-500 mt-1 block">{formErrors.agreeTerms}</span>}
      </div>

      {/* 下一步按钮 */}
      <button
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-400 border-none rounded-xl text-sm font-semibold text-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(22,119,255,0.35)] font-sans mt-1"
        onClick={handleNextStep}
      >
        下一步：身份验证 →
      </button>
    </>
  );
};

export default Step1;