import classNames from 'classnames';
import { RegisterHook } from "../hooks/register.hook";
import styles from './index.module.scss';


  // ==================== 模拟数据 ====================
const schools = [
    { id: '1', name: '西安高新第一中学', code: 'XAGX01' },
    { id: '2', name: '西安高新第二中学', code: 'XAGX02' },
    { id: '3', name: '西安铁一中学', code: 'XATY01' },
    { id: '4', name: '西安交通大学附属中学', code: 'XAJDFZ' },
];

const grades = ['高一', '高二', '高三', '初一', '初二', '初三', '小一', '小二', '小三', '小四', '小五', '小六'];
const classes = ['1班', '2班', '3班', '4班', '5班', '6班', '7班', '8班', '9班', '10班'];

const roles = [
    { value: 'teacher', label: '👨‍🏫 教师', desc: '教学管理、备课授课' },
    // { value: 'student', label: '🎓 学生', desc: '在线学习、作业考试' },
    // { value: 'parent', label: '👨‍👩‍👦 家长', desc: '了解学情、家校互通' },
    { value: 'admin', label: '🛠️ 管理员', desc: '系统管理、数据维护' },
];


// ==================== 渲染步骤指示器 ====================
const RenderSteps = () => {
    const {currentStep} = RegisterHook();
    return (
        <div className={styles.steps}>
            <div className={classNames(styles.stepItem, { [styles.active]: currentStep >= 1 })}>
                <span className={styles.stepNum}>1</span>
                <span className={styles.stepLabel}>填写信息</span>
                {currentStep > 1 && <span className={styles.stepCheck}>✓</span>}
            </div>
            <div className={classNames(styles.stepLine, { [styles.active]: currentStep >= 2 })} />
            <div className={classNames(styles.stepItem, { [styles.active]: currentStep >= 2 })}>
                <span className={styles.stepNum}>2</span>
                <span className={styles.stepLabel}>身份验证</span>
                {currentStep > 2 && <span className={styles.stepCheck}>✓</span>}
            </div>
            <div className={classNames(styles.stepLine, { [styles.active]: currentStep >= 3 })} />
            <div className={classNames(styles.stepItem, { [styles.active]: currentStep >= 3 })}>
                <span className={styles.stepNum}>3</span>
                <span className={styles.stepLabel}>注册成功</span>
            </div>
        </div>
    )
};

// ==================== 渲染步骤1：填写信息 ====================
const RenderStep1 = () => {
    const {formData, formErrors, showPassword, showConfirmPassword, handleNextStep, setShowConfirmPassword, setShowPassword, handleInputChange, setFormData} = RegisterHook();
    return (
        <>
            {/* 角色选择 */}
            <div className={styles.formGroup}>
                <label className={styles.label}>选择角色 <span className={styles.required}>*</span></label>
                <div className={styles.roleGrid}>
                {roles.map((role) => (
                    <div
                    key={role.value}
                    className={classNames(styles.roleCard, {
                        [styles.active]: formData.role === role.value,
                    })}
                    onClick={() => setFormData((prev: any) => ({ ...prev, role: role.value as any }))}
                    >
                    <div className={styles.roleIcon}>{role.label.split(' ')[0]}</div>
                    <div className={styles.roleName}>{role.label.split(' ')[1] || role.label}</div>
                    <div className={styles.roleDesc}>{role.desc}</div>
                    </div>
                ))}
                </div>
            </div>

            {/* 基本信息 */}
            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                <label className={styles.label}>账号 <span className={styles.required}>*</span></label>
                <div className={classNames(styles.inputWrapper, { [styles.error]: formErrors.username })}>
                    <span className={styles.prefix}>👤</span>
                    <input
                    type="text"
                    name="username"
                    placeholder="请设置4-20位账号"
                    value={formData.username}
                    onChange={handleInputChange}
                    />
                </div>
                {formErrors.username && <span className={styles.errorMsg}>{formErrors.username}</span>}
                </div>
                <div className={styles.formGroup}>
                <label className={styles.label}>真实姓名 <span className={styles.required}>*</span></label>
                <div className={classNames(styles.inputWrapper, { [styles.error]: formErrors.realName })}>
                    <span className={styles.prefix}>📛</span>
                    <input
                    type="text"
                    name="realName"
                    placeholder="请输入真实姓名"
                    value={formData.realName}
                    onChange={handleInputChange}
                    />
                </div>
                {formErrors.realName && <span className={styles.errorMsg}>{formErrors.realName}</span>}
                </div>
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                <label className={styles.label}>密码 <span className={styles.required}>*</span></label>
                <div className={classNames(styles.inputWrapper, { [styles.error]: formErrors.password })}>
                    <span className={styles.prefix}>🔑</span>
                    <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="至少8位，包含字母和数字"
                    value={formData.password}
                    onChange={handleInputChange}
                    />
                    <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    >
                    {showPassword ? '🙈' : '👁️'}
                    </button>
                </div>
                {formErrors.password && <span className={styles.errorMsg}>{formErrors.password}</span>}
                </div>
                <div className={styles.formGroup}>
                <label className={styles.label}>确认密码 <span className={styles.required}>*</span></label>
                <div className={classNames(styles.inputWrapper, { [styles.error]: formErrors.confirmPassword })}>
                    <span className={styles.prefix}>🔐</span>
                    <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="再次输入密码"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    />
                    <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                    {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                </div>
                {formErrors.confirmPassword && <span className={styles.errorMsg}>{formErrors.confirmPassword}</span>}
                </div>
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                <label className={styles.label}>手机号 <span className={styles.required}>*</span></label>
                <div className={classNames(styles.inputWrapper, { [styles.error]: formErrors.phone })}>
                    <span className={styles.prefix}>📱</span>
                    <input
                    type="tel"
                    name="phone"
                    placeholder="请输入手机号"
                    value={formData.phone}
                    onChange={handleInputChange}
                    />
                </div>
                {formErrors.phone && <span className={styles.errorMsg}>{formErrors.phone}</span>}
                </div>
                <div className={styles.formGroup}>
                <label className={styles.label}>邮箱</label>
                <div className={styles.inputWrapper}>
                    <span className={styles.prefix}>✉️</span>
                    <input
                    type="email"
                    name="email"
                    placeholder="请输入邮箱（选填）"
                    value={formData.email}
                    onChange={handleInputChange}
                    />
                </div>
                </div>
            </div>

            {/* 组织信息 */}
            <div className={styles.formGroup}>
                <label className={styles.label}>所属学校 <span className={styles.required}>*</span></label>
                <div className={classNames(styles.inputWrapper, { [styles.error]: formErrors.schoolName })}>
                <span className={styles.prefix}>🏫</span>
                <select
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                >
                    <option value="">请选择学校</option>
                    {schools.map((school) => (
                    <option key={school.id} value={school.name}>
                        {school.name} ({school.code})
                    </option>
                    ))}
                </select>
                </div>
                {formErrors.schoolName && <span className={styles.errorMsg}>{formErrors.schoolName}</span>}
            </div>

            {/* 年级和班级（学生角色显示） */}
            {formData.role === 'student' && (
                <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>年级</label>
                    <div className={styles.inputWrapper}>
                    <span className={styles.prefix}>📚</span>
                    <select
                        name="grade"
                        value={formData.grade}
                        onChange={handleInputChange}
                    >
                        <option value="">请选择年级</option>
                        {grades.map((g) => (
                        <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>班级</label>
                    <div className={styles.inputWrapper}>
                    <span className={styles.prefix}>🏠</span>
                    <select
                        name="class"
                        value={formData.class}
                        onChange={handleInputChange}
                    >
                        <option value="">请选择班级</option>
                        {classes.map((c) => (
                        <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    </div>
                </div>
                </div>
            )}

            {/* 用户协议 */}
            <div className={classNames(styles.formGroup, styles.termsGroup)}>
                <label className={classNames(styles.checkboxLabel, { [styles.error]: formErrors.agreeTerms })}>
                <input
                    type="checkbox"
                    name="agreeTerms"
                    checked={formData.agreeTerms}
                    onChange={handleInputChange}
                />
                <span className={styles.checkboxText}>
                    我已阅读并同意 <a href="#" onClick={(e) => { e.preventDefault(); alert('显示用户协议'); }}>《用户服务协议》</a>
                    和 <a href="#" onClick={(e) => { e.preventDefault(); alert('显示隐私政策'); }}>《隐私政策》</a>
                </span>
                </label>
                {formErrors.agreeTerms && <span className={styles.errorMsg}>{formErrors.agreeTerms}</span>}
            </div>

            {/* 下一步按钮 */}
            <button className={styles.btnPrimary} onClick={handleNextStep}>
                下一步：身份验证 →
            </button>
        </>
    )
};

  // ==================== 渲染步骤2：身份验证 ====================
const RenderStep2 = () => {
    const {formData, codeCountdown, canvasRef, isLoading, setCurrentStep, handleRegister, setTotpEnabled, setFormData, handleSendCode} = RegisterHook();
    return (
        <>
            <div className={styles.verifyHeader}>
                <div className={styles.verifyIcon}>✅</div>
                <h3>身份验证</h3>
                <p className={styles.verifyDesc}>
                为了保障账号安全，请完成以下验证<br />
                <span className={styles.verifyHint}>系统已向 {formData.phone} 发送验证码</span>
                </p>
            </div>

            {/* 短信验证码 */}
            <div className={styles.formGroup}>
                <label className={styles.label}>短信验证码 <span className={styles.required}>*</span></label>
                <div className={styles.twofaRow}>
                <div className={styles.inputWrapper}>
                    <span className={styles.prefix}>📱</span>
                    <input
                    type="text"
                    placeholder="请输入6位验证码"
                    maxLength={6}
                    value={formData.totpCode}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, totpCode: e.target.value }))}
                    />
                </div>
                <button
                    type="button"
                    className={classNames(styles.btnGetCode, { [styles.disabled]: codeCountdown > 0 })}
                    onClick={handleSendCode}
                    disabled={codeCountdown > 0}
                >
                    {codeCountdown > 0 ? `${codeCountdown}s` : '获取验证码'}
                </button>
                </div>
            </div>

            {/* TOTP 双因素认证绑定 */}
            <div className={styles.totpSection}>
                <div className={styles.totpHeader}>
                <span className={styles.totpIcon}>🔐</span>
                <span className={styles.totpTitle}>绑定二次验证（推荐）</span>
                <span className={styles.totpTag}>等保三级</span>
                </div>
                <p className={styles.totpDesc}>
                使用 Google Authenticator 或 Microsoft Authenticator 扫描下方二维码
                </p>
                <div className={styles.totpQRWrapper}>
                <div className={styles.totpQR}>
                    <canvas ref={canvasRef} width="160" height="160" />
                    <div className={styles.totpSecret}>
                    <span>密钥：</span>
                    <code>{formData.totpSecret || 'ABCD-EFGH-IJKL-MNOP'}</code>
                    </div>
                </div>
                <div className={styles.totpTips}>
                    <div className={styles.totpTip}>📲 打开 Authenticator APP</div>
                    <div className={styles.totpTip}>📷 扫描二维码或手动输入密钥</div>
                    <div className={styles.totpTip}>✅ 绑定后每次登录需输入动态码</div>
                </div>
                </div>
                <div className={styles.totpSkip}>
                <button
                    type="button"
                    className={styles.totpSkipBtn}
                    onClick={() => setTotpEnabled(false)}
                >
                    ⏭️ 稍后绑定（不推荐）
                </button>
                </div>
            </div>

            {/* 注册按钮 */}
            <button
                className={classNames(styles.btnPrimary, { [styles.loading]: isLoading })}
                onClick={handleRegister}
                disabled={isLoading}
            >
                {isLoading ? '⏳ 注册中...' : '✅ 完成注册'}
            </button>

            {/* 返回上一步 */}
            <button
                className={styles.btnBack}
                onClick={() => setCurrentStep(1)}
                disabled={isLoading}
            >
                ← 返回上一步
            </button>
        </>
    )
    
};

// ==================== 渲染步骤3：注册成功 ====================
const RenderStep3 = () => {
    const {formData, totpEnabled} = RegisterHook();
    return (
        <div className={styles.successContainer}>
            <div className={styles.successIcon}>🎉</div>
            <h2 className={styles.successTitle}>注册成功！</h2>
            <p className={styles.successDesc}>
                恭喜您成为 EducationOS 的一员<br />
                教育数字基座 · 连接 · 加工 · 沉淀
            </p>
            <div className={styles.successInfo}>
                <div className={styles.successItem}>
                    <span className={styles.successLabel}>账号</span>
                    <span className={styles.successValue}>{formData.username}</span>
                </div>
                <div className={styles.successItem}>
                    <span className={styles.successLabel}>角色</span>
                    <span className={styles.successValue}>
                        {roles.find(r => r.value === formData.role)?.label || formData.role}
                    </span>
                </div>
                <div className={styles.successItem}>
                    <span className={styles.successLabel}>学校</span>
                    <span className={styles.successValue}>{formData.schoolName}</span>
                </div>
                {formData.role === 'student' && formData.grade && (
                    <div className={styles.successItem}>
                        <span className={styles.successLabel}>班级</span>
                        <span className={styles.successValue}>{formData.grade} {formData.class}</span>
                    </div>
                )}
                <div className={styles.successItem}>
                    <span className={styles.successLabel}>安全状态</span>
                    <span className={styles.successValue} style={{ color: '#52c41a' }}>
                        🔒 2FA {totpEnabled ? '已绑定' : '未绑定'}
                    </span>
                </div>
            </div>
        </div>
    )
};

const EducationOSRegister = () => {
    const {currentStep} = RegisterHook();
    return (
        <>
            {/* 步骤指示器 */}
            {currentStep < 3 && <RenderSteps />}

            {/* 表单内容 */}
            <div className={styles.formContent}>
            {currentStep === 1 && <RenderStep1 />}
            {currentStep === 2 && <RenderStep2 />}
            {currentStep === 3 && <RenderStep3 />}
            </div>

        </>
    )
}

export {
    EducationOSRegister
}