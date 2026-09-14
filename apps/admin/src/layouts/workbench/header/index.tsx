import { LogoutOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, message, type MenuProps } from "antd"
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@api/index";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout as userLogout } from "@/store/slices/userSlice";
import { getUserDisplayName, getUserSubtitle } from "@/utils/currentUser";

const HeaderComponent = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user.current);
    const displayName = getUserDisplayName(user);
    const subtitle = getUserSubtitle(user);
    const avatarText = displayName.slice(0, 1) || '管';
    const avatarUrl = user?.avatarUrl || undefined;

    const handleLogout = useCallback(async () => {
        try {
            await authService.logout();
        } catch {
            // ignore
        }
        dispatch(userLogout());
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        message.success('已退出登录');
        navigate('/');
    }, [dispatch, navigate]);

    const menuItems: MenuProps['items'] = [
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: '退出登录',
            danger: true,
            onClick: () => {
                void handleLogout();
            },
        },
    ];

    return (
        <div className="w-[100%]">
            <div className="bg-[white] p-3 flex items-center justify-between">
                <div className="text-[18px] font-bold cursor-pointer" onClick={() => navigate('/application')}>
                    📘 Education
                    <span className="text-[#4f46e5]">OS</span>
                </div>
                <div className="flex items-center">
                    <Dropdown
                        menu={{ items: menuItems }}
                        placement="topCenter"
                        trigger={['hover']}
                        arrow
                    >
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">
                            <Avatar 
                                size={36}
                                src={avatarUrl}
                                className="bg-blue-500 flex items-center justify-center text-white font-medium"
                            >
                                {avatarText}
                            </Avatar>
                            <div className="hidden sm:block">
                                <div className="text-sm font-medium text-gray-700 leading-tight">{displayName}</div>
                                <div className="text-xs text-gray-400 leading-tight">{subtitle}</div>
                            </div>
                        </div>
                    </Dropdown>
                </div>
            </div>
        </div>
    )
}

export {
    HeaderComponent
}
