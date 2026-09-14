import { useState } from 'react';
import loginBg from '../../../assets/images/bg.jpeg';
import { LoginComponent } from './login';
import { Register } from './register';
import { ResetPasswordComponent } from './resetPassword';
import styles from './index.module.scss';

type EntranceMode = 'login' | 'register' | 'reset';

const trustBadges = [
  { icon: '🔒', label: 'AI辅助教案、试卷生成' },
  { icon: '✅', label: 'AI学情分析与精准辅导' },
  { icon: '🏫', label: 'AI知识图谱构建与智能问答' },
  { icon: '📚', label: 'AI辅助教研与教学设计' },
];

const cardTitle: Record<EntranceMode, string> = {
  login: '🔐 登录 EducationOS - 工作台',
  register: '📝 注册 EducationOS - 工作台',
  reset: '🔑 重置密码 - 工作台',
};

const EducationOSEntrance = () => {
  const [mode, setMode] = useState<EntranceMode>('login');

  return (
    <div className={styles.page}>
      <div
        className={styles.bg}
        style={{
          backgroundImage: `url(${loginBg})`,
        }}
      />
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>E</div>
            <div className={styles.logoText}>
              Education<span>OS</span>
            </div>
          </div>
          <div className={styles.slogan}>
            AI教育基础设施
            <br />
            <span className={styles.highlight}>连接 · 加工 · 沉淀</span>
          </div>
          <div className={styles.desc}>探索AI教育赋能的无限可能</div>
          <div className={styles.trustBadges}>
            {trustBadges.map((item, idx) => (
              <span key={idx} className={styles.trustBadge}>
                <span className={styles.icon}>{item.icon}</span> {item.label}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>{cardTitle[mode]}</h2>
            <div className={styles.sub}>
              教育数字基座 · <strong>零信任安全架构</strong>
            </div>
          </div>

          {mode === 'login' && (
            <>
              <LoginComponent onForgotPassword={() => setMode('reset')} />
              <div className={styles.registerEntry}>
                <span className={styles.registerHint}>还没有账号？</span>
                <button className={styles.registerBtn} onClick={() => setMode('register')}>
                  立即注册 →
                </button>
              </div>
            </>
          )}

          {mode === 'register' && (
            <>
              <Register />
              <div className={styles.registerEntry}>
                <span className={styles.registerHint}>已有账号</span>
                <button className={styles.registerBtn} onClick={() => setMode('login')}>
                  立即登录 →
                </button>
              </div>
            </>
          )}

          {mode === 'reset' && (
            <>
              <ResetPasswordComponent onBackToLogin={() => setMode('login')} />
              <div className={styles.registerEntry}>
                <span className={styles.registerHint}>想起密码了？</span>
                <button className={styles.registerBtn} onClick={() => setMode('login')}>
                  返回登录 →
                </button>
              </div>
            </>
          )}

          <div className={styles.footer}>
            © 2026 EducationOS. All rights reserved.
            &nbsp;·&nbsp;
            <a href="/legal/terms" target="_blank" rel="noopener noreferrer">
              用户协议
            </a>
            &nbsp;·&nbsp;
            <a href="/legal/privacy" target="_blank" rel="noopener noreferrer">
              隐私政策
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export { EducationOSEntrance };
