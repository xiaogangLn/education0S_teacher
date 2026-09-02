
import { useState } from 'react';
import loginBg from '../../../assets/images/bg.jpeg';
import { LoginComponent } from './login';
import { OtherLogin } from './otherLogin';
import { Register } from './register';
import styles from './index.module.scss';

// ==================== 信任徽章数据 ====================
const trustBadges = [
    { icon: '🔒', label: '等保三级' },
    { icon: '✅', label: '2FA 已启用' },
    // { icon: '🏫', label: '2,000+ 学校' },
    // { icon: '📚', label: '500万+ 知识资产' },
];

const EducationOSEntrance = () => {

    const [isLogin, setIsLogin] = useState<boolean>(true);


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
                            Education<span>OS</span>
                        </div>
                    </div>
                    <div className={styles.slogan}>
                        教育数字基础设施
                        <br />
                        <span className={styles.highlight}>连接 · 加工 · 沉淀</span>
                    </div>
                    <div className={styles.desc}>
                        统一身份认证 · 零信任安全接入 · 多端协同
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
                        <h2>🔐 登录 EducationOS</h2>
                        <div className={styles.sub}>
                        教育数字基座 · <strong>零信任安全架构</strong>
                        </div>
                    </div>

                    {/* 登录表单 */}
                    {isLogin ? (
                    <>
                            <LoginComponent />
                            {/* ===== 注册入口 ===== */}
                            <div className={styles.registerEntry}>
                                <span className={styles.registerHint}>还没有账号？</span>
                                <button className={styles.registerBtn} onClick={() => setIsLogin(false)}>
                                    立即注册 →
                                </button>
                            </div> 
                            {/* 社交登录 */}
                            <OtherLogin />
                            {/* 站点信息 */}
                            <div className={styles.siteInfo}>
                                <span className={styles.siteName}>
                                🏫 当前站点：<strong>西安高新第一中学</strong>
                                <span className={styles.tag}>主校区</span>
                                </span>
                                <span>🔒 安全连接</span>
                            </div>
                    </>
                    ): (
                        <>
                            <Register />
                            <div className={styles.registerEntry}>
                                <span className={styles.registerHint}>已有账号</span>
                                <button className={styles.registerBtn} onClick={() => setIsLogin(true)}>
                                    立即登录 →
                                </button>
                            </div> 
                        </>
                    )}
                    {/* 底部版权 */}
                    <div className={styles.footer}>
                        © 2026 <a href="#">EducationOS</a>. All rights reserved. &nbsp;·&nbsp; 陕ICP备2026XXXXXX号
                    </div>
                </div>
            </div>
        </div>
    );
}

export {
    EducationOSEntrance
}