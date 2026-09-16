import React from 'react';
import { useRegister } from './hooks/useRegister';
import { HumanVerifyModal } from '@/components/HumanVerifyModal';
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
    handleInputChange,
    toggleSubject,
    handleNextStep,
    handleRegister,
    captcha,
    setCaptcha,
    captchaNonce,
    humanModalOpen,
    humanNonce,
    closeHumanModal,
    handleHumanVerified,
    debugConfirmUrl,
  } = useRegister();

  return (
    <div className="w-full max-h-[90vh] overflow-y-auto  flex-shrink-0 ">
      {currentStep < 3 && <StepIndicator currentStep={currentStep} />}

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
            toggleSubject={toggleSubject}
            handleNextStep={handleNextStep}
          />
        )}
        {currentStep === 2 && (
          <Step2
            formData={formData}
            formErrors={formErrors}
            setCurrentStep={setCurrentStep}
            handleInputChange={handleInputChange}
            isLoading={isLoading}
            handleRegister={handleRegister}
            captcha={captcha}
            setCaptcha={setCaptcha}
            captchaNonce={captchaNonce}
          />
        )}
        {currentStep === 3 && (
          <Step3 formData={formData} debugConfirmUrl={debugConfirmUrl} />
        )}
      </div>

      <HumanVerifyModal
        open={humanModalOpen}
        nonce={humanNonce}
        confirming={isLoading}
        onCancel={closeHumanModal}
        onVerified={handleHumanVerified}
      />
    </div>
  );
};

export { Register };
