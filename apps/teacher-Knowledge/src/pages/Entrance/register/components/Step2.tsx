// src/components/Register/Step2.tsx

import React from 'react';

interface Step2Props {
  formData: any;
  setCurrentStep: (step: number) => void;
  setTotpEnabled: (enabled: boolean) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isLoading: boolean;
  handleRegister: () => void;
}

const Step2: React.FC<Step2Props> = ({
  formData,
  setCurrentStep,
  setTotpEnabled,
  canvasRef,
  isLoading,
  handleRegister,
}) => {
  return (
    <>
      {/* TOTP 双因素认证绑定 */}
      <div className="bg-gray-50 rounded-xl p-4 my-4 border border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔐</span>
          <span className="text-sm font-semibold text-gray-800">绑定二次验证（推荐）</span>
          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full ml-auto">等保三级</span>
        </div>
        <p className="text-sm text-gray-400 my-1 mb-3">使用 Google Authenticator 或 Microsoft Authenticator 扫描下方二维码</p>
        
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex flex-col items-center gap-1.5">
            <canvas ref={canvasRef} width="120" height="120" className="bg-white rounded-lg border border-gray-200" />
            <div className="text-xs text-gray-500">
              <span>密钥：</span>
              <code className="bg-gray-200 px-2 py-0.5 rounded font-mono text-sm tracking-wide">
                {formData.totpSecret || 'ABCD-EFGH-IJKL-MNOP'}
              </code>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-sm text-gray-600">📲 打开 Authenticator APP</div>
            <div className="text-sm text-gray-600">📷 扫描二维码或手动输入密钥</div>
            <div className="text-sm text-gray-600">✅ 绑定后每次登录需输入动态码</div>
          </div>
        </div>

        <div className="text-center mt-2.5">
          <button
            type="button"
            className="bg-none border-none text-gray-400 text-sm cursor-pointer font-sans hover:text-blue-500 transition-colors"
            onClick={() => setTotpEnabled(false)}
          >
            ⏭️ 稍后绑定（不推荐）
          </button>
        </div>
      </div>

      {/* 注册按钮 */}
      <button
        className={`
          w-full py-3 bg-gradient-to-r from-blue-500 to-blue-400 border-none rounded-xl text-sm font-semibold text-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(22,119,255,0.35)] font-sans
          ${isLoading ? 'opacity-80' : ''}
        `}
        onClick={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? '⏳ 注册中...' : '✅ 完成注册'}
      </button>

      {/* 返回上一步 */}
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