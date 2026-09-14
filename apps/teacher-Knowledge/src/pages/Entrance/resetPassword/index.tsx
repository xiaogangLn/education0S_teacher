import classNames from 'classnames';
import { Button, Form } from 'antd';
import { Input } from '@ui';
import { ImageCaptchaField } from '@/components/ImageCaptchaField';
import { HumanVerifyModal } from '@/components/HumanVerifyModal';
import { useResetPassword } from './hooks/useResetPassword';
import styles from '../login/index.module.scss';

interface ResetPasswordProps {
  onBackToLogin: () => void;
}

/**
 * 能力：老师工作站重置密码表单（邮箱验证码）。
 * 输入：onBackToLogin。
 * 输出：重置成功后回到登录。
 */
const ResetPasswordComponent = ({ onBackToLogin }: ResetPasswordProps) => {
  const {
    phone,
    setPhone,
    email,
    setEmail,
    code,
    setCode,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    captcha,
    setCaptcha,
    captchaNonce,
    humanModalOpen,
    humanNonce,
    closeHumanModal,
    handleHumanVerified,
    handleClickSendCode,
    handleClickReset,
    sendingCode,
    submitting,
    countdown,
    isBusy,
  } = useResetPassword(onBackToLogin);

  return (
    <>
      <Form className={styles.form} onFinish={handleClickReset}>
        <div className={styles.formGroup}>
          <label>手机号</label>
          <div className={styles.inputWrapper}>
            <span className={styles.prefix}>📱</span>
            <Input
              type="text"
              placeholder="请输入登录手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isBusy}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>绑定邮箱</label>
          <div className={styles.inputWrapper}>
            <span className={styles.prefix}>✉️</span>
            <Input
              type="email"
              placeholder="请输入账号绑定邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isBusy}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>图片验证码</label>
          <ImageCaptchaField
            key={captchaNonce}
            value={captcha}
            onChange={setCaptcha}
            disabled={isBusy}
          />
        </div>

        <div className={styles.formGroup}>
          <label>邮箱验证码</label>
          <div className={styles.twofaRow}>
            <div className={styles.inputWrapper}>
              <span className={styles.prefix}>🔢</span>
              <Input
                type="text"
                placeholder="请输入邮箱验证码"
                value={code}
                onChange={(e) => setCode(e.target.value.trim())}
                disabled={isBusy}
                maxLength={8}
              />
            </div>
            <button
              type="button"
              className={classNames(styles.btnGetCode, {
                [styles.disabled]: countdown > 0 || sendingCode,
              })}
              onClick={handleClickSendCode}
              disabled={countdown > 0 || sendingCode || isBusy}
            >
              {sendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : '获取验证码'}
            </button>
          </div>
          <span className={styles.labelHint}>验证码将发送至绑定邮箱；一周内仅可成功重置一次</span>
        </div>

        <div className={styles.formGroup}>
          <label>新密码</label>
          <div className={styles.inputWrapper}>
            <span className={styles.prefix}>🔑</span>
            <Input
              type="password"
              placeholder="至少 8 位新密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isBusy}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>确认新密码</label>
          <div className={styles.inputWrapper}>
            <span className={styles.prefix}>🔑</span>
            <Input
              type="password"
              placeholder="再次输入新密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isBusy}
            />
          </div>
        </div>

        <Button
          type="primary"
          block
          size="large"
          htmlType="submit"
          className={classNames(styles.btnLogin, {
            [styles.loadingState]: submitting,
          })}
          disabled={isBusy}
        >
          <span className={styles.btnText}>重置密码</span>
          <span className={styles.loading}>⏳ 提交中...</span>
        </Button>
      </Form>

      <HumanVerifyModal
        open={humanModalOpen}
        nonce={humanNonce}
        confirming={isBusy}
        onCancel={closeHumanModal}
        onVerified={handleHumanVerified}
      />
    </>
  );
};

export { ResetPasswordComponent };
