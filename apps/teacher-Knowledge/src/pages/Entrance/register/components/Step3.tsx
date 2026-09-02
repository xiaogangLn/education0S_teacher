// src/components/Register/Step3.tsx

import React from 'react';

interface Step3Props {
  formData: any;
  totpEnabled: boolean;
}

const roles = [
  { value: 'teacher', label: '👨‍🏫 教师', desc: '教学管理、备课授课' },
  { value: 'admin', label: '🛠️ 管理员', desc: '系统管理、数据维护' },
];

const Step3: React.FC<Step3Props> = ({ formData, totpEnabled }) => {
  const roleLabel = roles.find(r => r.value === formData.role)?.label || formData.role;

  return (
    <div className="text-center pt-5 pb-2.5">
      <div className="text-6xl">🎉</div>
      <h2 className="text-2xl font-bold text-gray-800 mt-2 mb-1">注册成功！</h2>
      <p className="text-sm text-gray-400 leading-relaxed">
        恭喜您成为 EducationOS 的一员<br />
        教育数字基座 · 连接 · 加工 · 沉淀
      </p>

      <div className="bg-gray-50 rounded-xl p-3.5 my-4 text-left border border-gray-200">
        <div className="flex justify-between py-1.5 border-b border-gray-100">
          <span className="text-sm text-gray-400">账号</span>
          <span className="text-sm font-medium text-gray-800">{formData.username}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-gray-100">
          <span className="text-sm text-gray-400">角色</span>
          <span className="text-sm font-medium text-gray-800">{roleLabel}</span>
        </div>
        <div className="flex justify-between py-1.5 border-b border-gray-100">
          <span className="text-sm text-gray-400">学校</span>
          <span className="text-sm font-medium text-gray-800">{formData.schoolName}</span>
        </div>
        {formData.role === 'student' && formData.grade && (
          <div className="flex justify-between py-1.5 border-b border-gray-100">
            <span className="text-sm text-gray-400">班级</span>
            <span className="text-sm font-medium text-gray-800">{formData.grade} {formData.class}</span>
          </div>
        )}
        <div className="flex justify-between py-1.5">
          <span className="text-sm text-gray-400">安全状态</span>
          <span className="text-sm font-medium text-green-500">
            🔒 2FA {totpEnabled ? '已绑定' : '未绑定'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Step3;