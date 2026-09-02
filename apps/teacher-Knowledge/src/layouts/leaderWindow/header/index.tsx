import KnowledgeBaseTag from "@/components/toKnowledge";
import { YearInfo } from "@/components/yearInfo";
import { FundOutlined, HighlightOutlined, HistoryOutlined, LogoutOutlined, ProfileOutlined, RadarChartOutlined, TeamOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, message, type MenuProps } from "antd"
import { useNavigate } from "react-router-dom";


const HeaderComponent = () => {
    const navigate = useNavigate();

    // 菜单项配置
    const menuItems: MenuProps['items'] = [
        {
            key: 'user-info',
            label: (
                <div className="px-2 py-1">
                    <div className="font-semibold text-gray-800">张老师</div>
                    <div className="text-xs text-gray-500">XX中学 · 九年级数学</div>
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
        {
            key: 'profile',
            icon: <RadarChartOutlined />,
            label: '教学画像',
            onClick: () => navigate('/workbench/teacherPortrait'),
        },
        {
            key: 'students',
            icon: <TeamOutlined />,
            label: '学生管理',
            onClick: () =>  navigate('/workbench/studentList'),
        },
        {
            key: 'history',
            icon: <HistoryOutlined />,
            label: '历史记录',
            onClick: () => navigate('/workbench/historyOrder'),
        },
        {
            key: 'review',
            icon: <HighlightOutlined />,
            label: '审核中心',
            onClick: () => navigate('/reviewCenter'),
        },
        {
            type: 'divider',
        },
        {
            key: 'leader',
            icon: <FundOutlined />,
            label: '领导窗口',
            onClick: () => navigate('/leaderWindow'),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: '退出登录',
            danger: true,
            onClick: () => {
                message.success('已退出登录');
                // 执行退出登录逻辑
                navigate('/')
            },
        },
    ];

    return (
        <div className="w-[100%] p-4 px-6">
            <div className="bg-[white] p-3 rounded-[12px] flex items-center justify-between">
                <div className="text-[18px] font-bold cursor-pointer" onClick={() => navigate('/workbench')}>
                    📘 Education
                    <span className="text-[#4f46e5]">OS</span>
                </div>
                <div>
                    <YearInfo />
                </div>
                <div className="flex items-center">
                    <KnowledgeBaseTag onClick={() => navigate('/knowledge')} className="mr-[20px]" />
                    <Dropdown
                        menu={{ items: menuItems }}
                        placement="topCenter"
                        trigger={['hover']}
                        arrow
                    >
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors">
                            <Avatar 
                                size={36} 
                                className="bg-blue-500 flex items-center justify-center text-white font-medium"
                            >
                                张
                            </Avatar>
                            <div className="hidden sm:block">
                                <div className="text-sm font-medium text-gray-700 leading-tight">张老师</div>
                                <div className="text-xs text-gray-400 leading-tight">XX中学 · 九年级</div>
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