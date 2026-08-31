import { message } from 'antd';
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';


const EducationOSLoginHook = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState<string>('zhanglaoshi');
    const [password, setPassword] = useState<string>('••••••••');
    const [verifyCode, setVerifyCode] = useState<string>('');
    const [rememberMe, setRememberMe] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [codeCountdown, setCodeCountdown] = useState<number>(0);

    const handleSubmit = useCallback(() => {
        
        // 表单校验
        if (!username.trim() || !password.trim() || !verifyCode.trim()) {
          alert('请完整填写所有字段');
          return;
        }
        
        setIsLoading(true);
        
        // 模拟登录请求
        setTimeout(() => {
          setIsLoading(false);
          message.success('登录成功！欢迎使用 EducationOS')
          // 实际项目中跳转到工作台
          navigate('/home');
        }, 1500);
    }, [username, password, verifyCode]);


    /** 获取验证码（2FA） */
    const handleGetCode = useCallback(() => {
        if (codeCountdown > 0) return;
        
        // 模拟发送验证码
        alert('验证码已发送至您的绑定手机/邮箱');
        setCodeCountdown(60);
        
        const timer = setInterval(() => {
        setCodeCountdown((prev) => {
            if (prev <= 1) {
            clearInterval(timer);
            return 0;
            }
            return prev - 1;
        });
        }, 1000);
    }, [codeCountdown]);


    /** 社交登录处理 */
    const handleSocialLogin = useCallback((platform: string) => {
        alert(`正在跳转至 ${platform} 授权登录...`);
        // 实际项目中跳转至 OAuth2 授权页面
    }, []);

    /** 记住我切换 */
    const handleRememberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setRememberMe(e.target.checked);
    }, []);

    // ========== 注册处理 ==========
    const handleRegister = useCallback(() => {
        alert('跳转至注册页面');
        // 实际项目中使用 navigate('/register')
    }, []);

    return {
        username,
        setUsername,
        password,
        setPassword,
        verifyCode,
        setVerifyCode,
        rememberMe,
        setRememberMe,
        isLoading,
        setIsLoading,
        codeCountdown,
        setCodeCountdown,
        handleSubmit,
        handleGetCode,
        handleSocialLogin,
        handleRememberChange,
        handleRegister
    }
}

export {
    EducationOSLoginHook
}