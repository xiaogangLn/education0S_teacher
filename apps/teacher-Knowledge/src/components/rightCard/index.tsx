import { AppstoreOutlined, EditOutlined, ExportOutlined, EyeOutlined, FileOutlined, FileTextOutlined, MoreOutlined, StarOutlined } from "@ant-design/icons"
import { Button, Divider, Tag, Tooltip } from "antd"

const templateItems = [
    { title: '教案模板', icon: <FileOutlined />, tag: '校本资源' },
    { title: '课件模板', icon: <AppstoreOutlined />, tag: '校本资源' },
    { title: '试卷模板', icon: <FileTextOutlined />, tag: '个人文件' },
    { title: 'PDF', icon: <FileTextOutlined />, tag: '个人文件' },
    { title: 'Doc', icon: <FileTextOutlined />, tag: '个人文件' },
    { title: 'Excel', icon: <FileTextOutlined />, tag: '个人文件' },
    { title: 'Mp3', icon: <FileTextOutlined />, tag: '个人文件' },
    { title: 'Mp4', icon: <FileTextOutlined />, tag: '个人文件' },
];

const RightPanel = () => {
    return (
        <div className="h-full flex flex-col bg-white">
        <div className="flex items-center justify-between p-4 pl-7 border-b">
            <span className="font-semibold text-base">模板与产物</span>
            {/* <Button type="text" size="small" icon={<MoreOutlined />} /> */}
            </div>
            
            <div className="flex-1 overflow-auto p-4 pl-7 space-y-4">
                {/* 选用模板 - 一行两个卡片 */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">选用模板</span>
                        <Button type="link" size="small">查看全部</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {templateItems.map((item, index) => (
                            <div 
                                key={index} 
                                className="group bg-white p-3 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-100 transition-colors">
                                        {item.icon}
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-sm font-medium text-gray-800">{item.title}</div>
                                        <Tag color="blue" className="text-xs mt-1">{item.tag}</Tag>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <Divider className="my-2" />
                
                {/* 本次生成记录 - 一行两个卡片 */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">本次生成记录</span>
                        <Button type="link" size="small">查看全部</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {/* 卡片 1 */}
                        <div className="bg-white p-3 rounded-xl border border-blue-200 hover:shadow-lg transition-shadow cursor-pointer group">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                        <FileTextOutlined />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm text-gray-800 truncate">二次函数教案</div>
                                        <div className="text-xs text-gray-400 truncate">v3 · 14:31</div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Tooltip title="编辑">
                                        <Button type="text" size="small" icon={<EditOutlined />} className="hover:text-blue-500" />
                                    </Tooltip>
                                    <Tooltip title="预览">
                                        <Button type="text" size="small" icon={<EyeOutlined />} className="hover:text-green-500" />
                                    </Tooltip>
                                    <Tooltip title="导出">
                                        <Button type="text" size="small" icon={<ExportOutlined />} className="hover:text-purple-500" />
                                    </Tooltip>
                                    <Tooltip title="收藏">
                                        <Button type="text" size="small" icon={<StarOutlined />} className="hover:text-yellow-500" />
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                        
                        {/* 卡片 2 */}
                        <div className="bg-white p-3 rounded-xl border border-green-200 hover:shadow-lg transition-shadow cursor-pointer group">
                            <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                                        <FileTextOutlined />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm text-gray-800 truncate">函数图像课件</div>
                                        <div className="text-xs text-gray-400 truncate">V1 · 14:15</div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Tooltip title="编辑">
                                        <Button type="text" size="small" icon={<EditOutlined />} className="hover:text-blue-500" />
                                    </Tooltip>
                                    <Tooltip title="预览">
                                        <Button type="text" size="small" icon={<EyeOutlined />} className="hover:text-green-500" />
                                    </Tooltip>
                                    <Tooltip title="导出">
                                        <Button type="text" size="small" icon={<ExportOutlined />} className="hover:text-purple-500" />
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <Divider className="my-2" />
                
                {/* 历史记录 - 一行两个卡片 */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">历史记录</span>
                        <Button type="link" size="small">查看全部</Button>
                    </div>
                    
                    <div className="text-xs text-gray-400 mb-2">今天 2条</div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors group">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                                    <FileTextOutlined className="text-xs" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-gray-800 truncate">二次函数教案</div>
                                    <div className="text-xs text-gray-400 truncate">v3 · 14:31</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors group">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 flex-shrink-0">
                                    <FileTextOutlined className="text-xs" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-gray-800 truncate">三角函数练习</div>
                                    <div className="text-xs text-gray-400 truncate">v2 · 13:20</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-xs text-gray-400 mb-2 mt-3">昨天 5条</div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors group">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center text-green-500 flex-shrink-0">
                                    <FileTextOutlined className="text-xs" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-gray-800 truncate">函数图像课件</div>
                                    <div className="text-xs text-gray-400 truncate">V1 · 14:15</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors group">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
                                    <FileTextOutlined className="text-xs" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-gray-800 truncate">概率统计复习</div>
                                    <div className="text-xs text-gray-400 truncate">v1 · 11:30</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export {
    RightPanel
}