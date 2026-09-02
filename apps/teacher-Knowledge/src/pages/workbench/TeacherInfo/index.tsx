import { ArrowLeftOutlined, BellOutlined, SaveOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, message, Space, Tabs } from "antd";
import { useState } from "react";
import TeacherInfoForm from "./components/TeacherInfoForm";
import TeacherPreferences from "./components/TeacherPreferences";
import NotificationSettings from "./components/NotificationSettings";
import { useNavigate } from "react-router-dom";


const TeacherInfoComponent = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('info');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            // 模拟保存
            await new Promise(resolve => setTimeout(resolve, 1500));
            message.success('保存成功');
        } catch (error) {
            message.error('保存失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        message.info('已取消编辑');
        navigate(-1);
    };

    const tabItems = [
        {
            key: 'info',
            label: (
                <span className="flex items-center gap-2">
                    <UserOutlined />
                    个人档案
                </span>
            ),
            children: <TeacherInfoForm />,
        },
        {
            key: 'preferences',
            label: (
                <span className="flex items-center gap-2">
                    <SettingOutlined />
                    AI助手偏好
                </span>
            ),
            children: <TeacherPreferences />,
        },
        {
            key: 'notifications',
            label: (
                <span className="flex items-center gap-2">
                    <BellOutlined />
                    通知设置
                </span>
            ),
            children: <NotificationSettings />,
        },
    ];

    return (
        <div className="w-[100%] mx-auto">
            {/* 页面标题 */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">个人档案</h2>
                    <p className="text-sm text-gray-500 mt-1">管理您的个人信息和偏好设置</p>
                </div>
                <Space>
                    <Button 
                        icon={<ArrowLeftOutlined />}  
                        onClick={handleCancel}
                    >
                        取消并返回
                    </Button>
                    <Button 
                        type="primary" 
                        icon={<SaveOutlined />}
                        loading={loading}
                        onClick={handleSave}
                        className="bg-blue-500 hover:bg-blue-600"
                    >
                        保存设置
                    </Button>
                </Space>
            </div>

            {/* Tab 切换 */}
            <Card className="shadow-sm rounded-xl">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    className="teacher-profile-tabs"
                />
            </Card>
        </div>
    );

}

export {
    TeacherInfoComponent
}