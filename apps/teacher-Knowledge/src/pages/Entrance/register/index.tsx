// src/components/Register/index.tsx

import React from 'react';
import { useRegister } from './hooks/useRegister';
import StepIndicator from './components/StepIndicator';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';

const Register: React.FC = () => {
  const {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    formErrors,
    isLoading,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    totpEnabled,
    setTotpEnabled,
    canvasRef,
    handleInputChange,
    handleNextStep,
    handleRegister,
  } = useRegister();

  return (
    <div className="w-full max-h-[90vh] overflow-y-auto  flex-shrink-0 ">
      {/* 步骤指示器 */}
      {currentStep < 3 && <StepIndicator currentStep={currentStep} />}

      {/* 表单内容 */}
      <div className="min-h-[380px]">
        {currentStep === 1 && (
          <Step1
            formData={formData}
            formErrors={formErrors}
            showPassword={showPassword}
            showConfirmPassword={showConfirmPassword}
            setShowPassword={setShowPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            setFormData={setFormData}
            handleInputChange={handleInputChange}
            handleNextStep={handleNextStep}
          />
        )}
        {currentStep === 2 && (
          <Step2
            formData={formData}
            setCurrentStep={setCurrentStep}
            setTotpEnabled={setTotpEnabled}
            canvasRef={canvasRef}
            isLoading={isLoading}
            handleRegister={handleRegister}
          />
        )}
        {currentStep === 3 && (
          <Step3
            formData={formData}
            totpEnabled={totpEnabled}
          />
        )}
      </div>
    </div>
  );
};

export {Register};