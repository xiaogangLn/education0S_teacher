import WorkbenchBaseTag from "@/components/toWorkbench";
import { ClassInfo } from "@/components/classInfo";
import { useHeaderUser } from "@/hooks/useHeaderUser";
import { FundOutlined, LogoutOutlined, ProfileOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, type MenuProps } from "antd"
import { useNavigate } from "react-router-dom";


const HeaderComponent = () => {
    const navigate = useNavigate();
    const { isLeader, displayName, subtitle, avatarText, avatarUrl, handleLogout } = useHeaderUser();

    const menuItems: MenuProps['items'] = [
        {
            key: 'user-info',
            label: (
                <div className="px-2 py-1">
                    <div className="font-semibold text-gray-800">{displayName}</div>
                    <div className="text-xs text-gray-500">{subtitle}</div>
                </div>
            ),
            className: 'cursor-default hover:bg-transparent',
            disabled: true,
        },
        {
            type: 'divider',
        },
        {
            key: 'profile',
            icon: <ProfileOutlined />,
            label: '个人信息',
            onClick: () => navigate('/workbench/teacherInfo'),
        },
        ...(isLeader ? [
            { type: 'divider' as const },
            {
                key: 'leader',
                icon: <FundOutlined />,
                label: '领导窗口',
                onClick: () => navigate('/leaderWindow'),
            },
        ] : []),
        {
            type: 'divider',
        },
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
        <div className="w-[100%] p-4 px-6">
            <div className="bg-[white] p-3 rounded-[12px] flex items-center justify-between">
                <div className="text-[18px] font-bold cursor-pointer" onClick={() => navigate('/knowledge')}>
                    📘 Education
                    <span className="text-[#4f46e5]">OS</span>
                </div>
                <div>
                    <ClassInfo />
                </div>
                <div className="flex items-center">
                    <WorkbenchBaseTag onClick={() => navigate('/workbench')} className="mr-[20px]" />
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