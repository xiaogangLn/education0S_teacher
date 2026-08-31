import { DingdingOutlined, WechatOutlined, WechatWorkOutlined } from '@ant-design/icons';
import { EducationOSLoginHook } from '../hooks/login.hook';
import styles from './index.module.scss';
import { cn } from '@ui/lib/utils';


const socialButtons = [
    { 
        icon: <WechatWorkOutlined className="text-green-600" />, 
        label: '企业微信',
        color: '#07C160',
        className: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-600 hover:text-green-700',
    },
    { 
        icon: <DingdingOutlined className="text-blue-600" />, 
        label: '钉钉',
        color: '#1677FF',
        className: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600 hover:text-blue-700',
    },
    { 
        icon: <WechatOutlined className="text-emerald-600" />, 
        label: '微信',
        color: '#07C160',
        className: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-600 hover:text-emerald-700',
    },
];

const OtherLogin = () => {
    const { handleSocialLogin } = EducationOSLoginHook();

    return (
        <div className={styles.socialLogin}>
            <div className={styles.divider}>或使用以下方式登录</div>
            <div className={styles.socialIcons}>
            {socialButtons.map((item) => (
                <button
                    key={item.label}
                    className={cn(styles.socialBtn, item.className, item.color)}
                    title={item.label}
                    onClick={() => handleSocialLogin(item.label)}
                >
                {item.icon}
                </button>
            ))}
            </div>
        </div>
    )
}

export {
    OtherLogin
}