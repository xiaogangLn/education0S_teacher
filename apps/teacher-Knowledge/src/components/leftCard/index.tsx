import { BookOutlined, EditOutlined, FileTextOutlined, PlusOutlined, TeamOutlined, UploadOutlined, UserOutlined } from "@ant-design/icons"
import { Button, Input, Menu } from "antd"

const menuItems = [
    { key: 'material', icon: <BookOutlined />, label: '校本资源' },
    { key: 'exam', icon: <FileTextOutlined />, label: '试卷' },
    { key: 'personal', icon: <UserOutlined />, label: '个人文件' },
    { key: 'draft', icon: <EditOutlined />, label: '草稿' },
    { key: 'shared', icon: <TeamOutlined />, label: '共享库' },
    { key: 'research', icon: <TeamOutlined />, label: '教研组' },
];

const { Search } = Input;

const LeftPanel = () => {
    return (
        <div className="h-full flex flex-col bg-white">
            {/* 标题 */}
            <div className="flex items-center justify-between p-4 border-b">
                <span className="font-semibold text-base">素材库</span>
                <Button type="text" size="small" icon={<PlusOutlined />}>上传</Button>
            </div>
            {/* 搜索 */}
            <div className="p-4 pr-5 border-b">
                <Search placeholder="搜索..." className="w-full" />
            </div>
            {/* 菜单 */}
            <div className="flex-1 overflow-auto">
                <Menu
                    mode="inline"
                    defaultSelectedKeys={['material']}
                    className="border-r-0"
                    items={menuItems.map(item => ({
                        ...item,
                        icon: <span className="text-gray-400">{item.icon}</span>
                    }))}
                />
            </div>
            {/* 底部上传 */}
            <div className="p-4 pr-5 border-t bg-gray-50">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <UploadOutlined className="text-gray-400 text-xl" />
                    <div className="text-xs text-gray-400 mt-1">拖拽上传</div>
                    <div className="text-xs text-gray-400 mt-0.5">支持PDF/Word/PPT/视频</div>
                </div>
                <div className="text-xs text-gray-400 mt-2 text-center">
                    历史记录 <span className="mx-1">·</span> 今天 2条 <span className="mx-1">·</span> 昨天 5条
                </div>
            </div>
        </div>
    )
}

export {
    LeftPanel
}