import classNames from 'classnames';
import styles from './index.module.scss';
import { Input } from '@ui';
import { EducationOSLoginHook } from '../hooks/login.hook';
import { Button, Form } from 'antd';
import { ImageCaptchaField } from '@/components/ImageCaptchaField';
import { HumanVerifyModal } from '@/components/HumanVerifyModal';

interface LoginComponentProps {
  onForgotPassword?: () => void;
}

const LoginComponent = ({ onForgotPassword }: LoginComponentProps) => {
  const {
    handleSubmit,
    username,
    setUsername,
    isLoading,
    password,
    setPassword,
    captcha,
    setCaptcha,
    captchaNonce,
    humanModalOpen,
    humanNonce,
    closeHumanModal,
    handleHumanVerified,
    rememberMe,
    handleRememberChange,
  } = EducationOSLoginHook();

  return (
    <>
      <Form className={styles.form} onFinish={handleSubmit}>
        <div className={styles.formGroup}>
          <label>账号</label>
          <div className={styles.inputWrapper}>
            <span className={styles.prefix}>👤</span>
            <Input
              type="text"
              placeholder="请输入教师电话号码"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>密码</label>
          <div className={styles.inputWrapper}>
            <span className={styles.prefix}>🔑</span>
            <Input
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>图片验证码</label>
          <ImageCaptchaField
            key={captchaNonce}
            value={captcha}
            onChange={setCaptcha}
            disabled={isLoading}
          />
        </div>

        <div className={styles.formOptions}>
          <label>
            <Input
              type="checkbox"
              checked={rememberMe}
              onChange={handleRememberChange}
              disabled={isLoading}
            />
            记住我
          </label>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onForgotPassword?.();
            }}
          >
            忘记密码？
          </a>
        </div>

        <Button
          type="primary"
          block
          size="large"
          htmlType="submit"
          className={classNames(styles.btnLogin, {
            [styles.loadingState]: isLoading,
          })}
          disabled={isLoading}
        >
          <span className={styles.btnText}>登 录</span>
          <span className={styles.loading}>⏳ 验证中...</span>
        </Button>
      </Form>

      <HumanVerifyModal
        open={humanModalOpen}
        nonce={humanNonce}
        confirming={isLoading}
        onCancel={closeHumanModal}
        onVerified={handleHumanVerified}
      />
    </>
  );
};

export { LoginComponent };
