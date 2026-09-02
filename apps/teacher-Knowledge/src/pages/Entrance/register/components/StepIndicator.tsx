// src/components/Register/StepIndicator.tsx

import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { num: 1, label: '填写信息' },
    { num: 2, label: '身份验证' },
    { num: 3, label: '注册成功' },
  ];

  return (
    <div className="flex items-center justify-center mb-6 px-2">
      {steps.map((step, index) => (
        <React.Fragment key={step.num}>
          <div className="flex items-center gap-2 relative">
            <div
              className={`
                w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                ${currentStep >= step.num 
                  ? 'bg-blue-500 text-white border-2 border-blue-500' 
                  : 'border-2 border-gray-300 text-gray-400'
                }
              `}
            >
              {currentStep > step.num ? '✓' : step.num}
            </div>
            <span className={`
              text-sm hidden sm:inline
              ${currentStep >= step.num ? 'text-blue-500' : 'text-gray-400'}
            `}>
              {step.label}
            </span>
            {currentStep > step.num && (
              <span className="absolute -top-2 -right-4 text-sm text-green-500">✓</span>
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`
                w-8 sm:w-12 h-0.5 mx-1 transition-all duration-300
                ${currentStep > step.num ? 'bg-blue-500' : 'bg-gray-300'}
              `}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default StepIndicator;