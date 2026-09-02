// src/components/Register/Step1.tsx

import React from 'react';
import type { Role, School } from '../types';

interface Step1Props {
  formData: any;
  formErrors: Record<string, string>;
  showPassword: boolean;
  showConfirmPassword: boolean;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleNextStep: () => void;
}

const schools: School[] = [
  { id: '1', name: '西安高新第一中学(数学)', code: 'XAGX01' },
  { id: '2', name: '西安高新第二中学(英语)', code: 'XAGX02' },
  { id: '3', name: '西安铁一中学(数学)', code: 'XATY01' },
  { id: '4', name: '西安交通大学附属中学(数学)', code: 'XAJDFZ' },
];

const grades = ['高一', '高二', '高三', '初一', '初二', '初三', '小一', '小二', '小三', '小四', '小五', '小六'];
const classes = ['1班', '2班', '3班', '4班', '5班', '6班', '7班', '8班', '9班', '10班'];

const roles: Role[] = [
  { value: 'teacher', label: '👨‍🏫 教师', desc: '教学管理、备课授课' },
  { value: 'admin', label: '🛠️ 管理员', desc: '系统管理、数据维护' },
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
  handleNextStep,
}) => {
  return (
    <>
      {/* 角色选择 */}
      <div className="mb-3.5">
        <label className="block text-sm font-medium text-gray-800 mb-1">
          选择角色 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {roles.map((role) => (
            <div
              key={role.value}
              className={`
                p-2 border-2 rounded-xl text-center cursor-pointer transition-all duration-200
                ${formData.role === role.value
                  ? 'border-blue-500 bg-blue-50 shadow-[0_0_0_3px_rgba(22,119,255,0.15)]'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }
              `}
              onClick={() => setFormData((prev: any) => ({ ...prev, role: role.value }))}
            >
              <div className="text-2xl">{role.label.split(' ')[0]}</div>
              <div className="text-sm font-semibold text-gray-800 mt-0.5">
                {role.label.split(' ')[1] || role.label}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{role.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 基本信息 - 两列布局 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="mb-3.5 sm:mb-0">
          <label className="block text-sm font-medium text-gray-800 mb-1">
            账号 <span className="text-red-500">*</span>
          </label>
          <div className={`
            flex items-center border-2 rounded-xl transition-all duration-200 bg-gray-50
            ${formErrors.username ? 'border-red-500' : 'border-gray-200 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(22,119,255,0.1)]'}
          `}>
            <span className="px-3 text-gray-400">👤</span>
            <input
              type="text"
              name="username"
              placeholder="请设置4-20位账号"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full py-2.5 px-2 border-none bg-transparent text-sm text-gray-800 outline-none font-normal"
            />
          </div>
          {formErrors.username && <span className="text-xs text-red-500 mt-1 block">{formErrors.username}</span>}
        </div>

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

      {/* 学校选择 */}
      <div className="mb-3.5">
        <label className="block text-sm font-medium text-gray-800 mb-1">
          所属学校(教学学科) <span className="text-red-500">*</span>
        </label>
        <div className={`
          flex items-center border-2 rounded-xl transition-all duration-200 bg-gray-50
          ${formErrors.schoolName ? 'border-red-500' : 'border-gray-200 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(22,119,255,0.1)]'}
        `}>
          <span className="px-3 text-gray-400">🏫</span>
          <select
            name="schoolName"
            value={formData.schoolName}
            onChange={handleInputChange}
            className="w-full py-2.5 pr-8 border-none bg-transparent text-sm text-gray-800 outline-none font-normal appearance-none cursor-pointer"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
            }}
          >
            <option value="">请选择学校及教学学科</option>
            {schools.map((school) => (
              <option key={school.id} value={school.name}>
                {school.name} ({school.code})
              </option>
            ))}
          </select>
        </div>
        {formErrors.schoolName && <span className="text-xs text-red-500 mt-1 block">{formErrors.schoolName}</span>}
      </div>

      {/* 年级和班级（学生角色显示） */}
      {formData.role === 'student' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="mb-3.5 sm:mb-0">
            <label className="block text-sm font-medium text-gray-800 mb-1">年级</label>
            <div className="flex items-center border-2 border-gray-200 rounded-xl transition-all duration-200 bg-gray-50 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(22,119,255,0.1)]">
              <span className="px-3 text-gray-400">📚</span>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                className="w-full py-2.5 pr-8 border-none bg-transparent text-sm text-gray-800 outline-none font-normal appearance-none cursor-pointer"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                }}
              >
                <option value="">请选择年级</option>
                {grades.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-3.5">
            <label className="block text-sm font-medium text-gray-800 mb-1">班级</label>
            <div className="flex items-center border-2 border-gray-200 rounded-xl transition-all duration-200 bg-gray-50 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(22,119,255,0.1)]">
              <span className="px-3 text-gray-400">🏠</span>
              <select
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                className="w-full py-2.5 pr-8 border-none bg-transparent text-sm text-gray-800 outline-none font-normal appearance-none cursor-pointer"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                }}
              >
                <option value="">请选择班级</option>
                {classes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 用户协议 */}
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
            <a href="#" className="text-blue-500 hover:underline" onClick={(e) => { e.preventDefault(); alert('显示用户协议'); }}>
              《用户服务协议》
            </a>
            {' '}和{' '}
            <a href="#" className="text-blue-500 hover:underline" onClick={(e) => { e.preventDefault(); alert('显示隐私政策'); }}>
              《隐私政策》
            </a>
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