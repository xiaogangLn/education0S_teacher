
import loginBg from '../../../assets/images/bg.jpeg';
import { LoginComponent } from './login';
import styles from './index.module.scss';

// ==================== 信任徽章数据 ====================
const trustBadges = [
    { icon: '🔒', label: 'AI辅助教案、试卷生成' },
    { icon: '✅', label: 'AI学情分析与精准辅导' },
    { icon: '🏫', label: 'AI知识图谱构建与智能问答' },
    { icon: '📚', label: 'AI辅助教研与教学设计' },    
];

const EducationOSEntrance = () => {


    // ==================== 渲染 ====================
    return (
        <div className={styles.page}>
            {/* 背景图 */}
            <div
                className={styles.bg}
                style={{
                    backgroundImage: `url(${loginBg})`,
                }}
            />
            {/* 主容器 */}
            <div className={styles.container}>
                {/* 左侧品牌区 */}
                <div className={styles.brand}>
                    <div className={styles.logo}>
                        <div className={styles.logoIcon}>E</div>
                        <div className={styles.logoText}>
                            Education<span>OS</span> ·
                            Admin
                        </div>
                    </div>
                    <div className={styles.slogan}>
                        AI教育基础设施
                        <br />
                        <span className={styles.highlight}>连接 · 加工 · 沉淀</span>
                    </div>
                    <div className={styles.desc}>
                        探索AI教育赋能的无限可能
                    </div>
                    <div className={styles.trustBadges}>
                        {trustBadges.map((item, idx) => (
                        <span key={idx} className={styles.trustBadge}>
                            <span className={styles.icon}>{item.icon}</span> {item.label}
                        </span>
                        ))}
                    </div>
                </div>

                {/* 右侧登录卡片 */}
                <div className={styles.card}>
                    {/* 卡片头部 */}
                    <div className={styles.cardHeader}>
                        <h2>🔐 登录 EducationOS Admin</h2>
                        <div className={styles.sub}>
                        教育数字基座 · <strong>零信任安全架构</strong>
                        </div>
                    </div>

                    <LoginComponent />
                    {/* 底部版权 */}
                    <div className={styles.footer}>
                        © 2026 EducationOS. All rights reserved.
                        &nbsp;·&nbsp;
                        <a href="/legal/terms" target="_blank" rel="noopener noreferrer">用户协议</a>
                        &nbsp;·&nbsp;
                        <a href="/legal/privacy" target="_blank" rel="noopener noreferrer">隐私政策</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export {
    EducationOSEntrance
}