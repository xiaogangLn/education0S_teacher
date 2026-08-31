import classNames from 'classnames';
import styles from './index.module.scss';
import { Input } from '@ui';
import { EducationOSLoginHook } from '../hooks/login.hook';
import { Button, Form } from 'antd';

const LoginComponent = () => {
    const {
        handleSubmit,
        username,
        setUsername,
        isLoading,
        password,
        setPassword,
        verifyCode,
        setVerifyCode,
        codeCountdown,
        handleGetCode,
        rememberMe,
        handleRememberChange,
    } = EducationOSLoginHook();
    return (
        <>
            <Form className={styles.form} onFinish={handleSubmit}>
                {/* 账号 */}
                <div className={styles.formGroup}>
                    <label>账号</label>
                    <div className={styles.inputWrapper}>
                        <span className={styles.prefix}>👤</span>
                        <Input
                            type="text"
                            placeholder="请输入教师/学生账号"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* 密码 */}
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

                {/* 2FA 双因素认证 */}
                <div className={styles.formGroup}>
                    <label>
                        二次验证码
                        <span className={styles.labelHint}>（等保三级强制）</span>
                    </label>
                    <div className={styles.twofaRow}>
                        <div className={styles.inputWrapper}>
                        <span className={styles.prefix}>📱</span>
                        <input
                            type="text"
                            placeholder="6位动态验证码"
                            maxLength={6}
                            value={verifyCode}
                            onChange={(e) => setVerifyCode(e.target.value)}
                            disabled={isLoading}
                        />
                        </div>
                        <button
                        type="button"
                        className={classNames(styles.btnGetCode, {
                            [styles.disabled]: codeCountdown > 0 || isLoading,
                        })}
                        onClick={handleGetCode}
                        disabled={codeCountdown > 0 || isLoading}
                        >
                        {codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码'}
                        </button>
                    </div>
                </div>

                {/* 选项 */}
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
                        alert('请联系管理员重置密码');
                        }}
                    >
                        忘记密码？
                    </a>
                </div>

                {/* 登录按钮 */}
                <Button
                    type="primary" 
                    block
                    size='large'
                    htmlType="submit"
                    className={classNames(styles.btnLogin, {
                        [styles.loadingState]: isLoading,
                    })}
                    disabled={isLoading}
                    >
                    <span className={styles.btnText}>登 录</span>
                    <span className={styles.loading}>⏳ 验证中...</span>
                </Button>

                {/* 安全标识 */}
                <div className={styles.securityBadge}>
                <span className={styles.dot} />
                    2FA 双因素认证 · 端到端加密
                </div>
            </Form>
        </>
    );
}

export {
    LoginComponent
}