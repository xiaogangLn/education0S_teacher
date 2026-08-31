import { useState } from "react";
import { BookOutlined, BulbOutlined, EditOutlined, ExportOutlined, EyeOutlined, FileSearchOutlined, FileTextOutlined, SendOutlined, StarOutlined } from "@ant-design/icons";
import { Avatar, Button, Input, message, Space, Tag, Tooltip } from "antd";


const CenterPanel = () => {
    const [messageValue, setMessageValue] = useState('');
    
    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* 对话头部 */}
            <div className="p-4 bg-white border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-medium">对话区</span>
                    <Tag color="blue">张老师</Tag>
                    <span className="text-sm text-gray-400">14:30</span>
                </div>
                <Space>
                    <Tooltip title="编辑"><Button type="text" size="small" icon={<EditOutlined />} /></Tooltip>
                    <Tooltip title="预览"><Button type="text" size="small" icon={<EyeOutlined />} /></Tooltip>
                    <Tooltip title="导出"><Button type="text" size="small" icon={<ExportOutlined />} /></Tooltip>
                    <Tooltip title="收藏"><Button type="text" size="small" icon={<StarOutlined />} /></Tooltip>
                </Space>
            </div>
            
            {/* 对话内容 */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
                {/* 用户消息 */}
                <div className="flex justify-end">
                    <div className="max-w-[70%] bg-blue-500 text-white rounded-lg p-3">
                        <div className="text-sm">帮我生成九年级数学《二次函数图像与性质》的教案</div>
                        <div className="text-xs opacity-70 mt-1 text-right">张老师·14:30</div>
                    </div>
                </div>
                
                {/* AI 回复 */}
                <div className="flex items-start gap-3">
                    <Avatar size="small" className="bg-green-500">AI</Avatar>
                    <div className="flex-1">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium">AI思考</span>
                                <span className="text-xs text-gray-400">14:30</span>
                                <Tag color="processing" className="text-xs">正在分析文档...</Tag>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                                    <FileSearchOutlined /><span>识别3个知识点</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                                    <BookOutlined /><span>匹配课标要求</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 p-2 rounded">
                                    <FileTextOutlined /><span>检索到2份相关教案</span>
                                </div>
                            </div>
                            
                            <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                                <div className="flex items-center gap-2 text-sm font-medium text-yellow-700">
                                    <BulbOutlined /><span>AI建议</span>
                                </div>
                                <div className="text-sm text-gray-700 mt-1">
                                    教学目标：<br/>
                                    1.理解开口方向与a的关系<br/>
                                    2.掌握平移规律<br/>
                                    3.判断二次函数性质
                                </div>
                                <div className="text-sm text-gray-700 mt-2">
                                    教学重点：<br/>
                                    开口方向判定、对称轴公式
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="text-right text-xs text-gray-400">
                    字数 1,234 · 知识点 3 · v2
                </div>
            </div>
            
            {/* 输入框 */}
            <div className="p-6 pr-4 bg-white border-t">
                <div className="flex gap-2 items-center">
                    <Input.TextArea
                        value={messageValue}
                        onChange={(e) => setMessageValue(e.target.value)}
                        placeholder="输入消息..."
                        autoSize={{ minRows: 1, maxRows: 4 }}
                        className="flex-1 !min-h-[50px] !rounded-[10px]"
                        onPressEnter={(e) => {
                            if (!e.shiftKey && messageValue.trim()) {
                                e.preventDefault();
                                message.success('消息已发送');
                                setMessageValue('');
                            }
                        }}
                    />
                    <Button 
                        type="primary" 
                        icon={<SendOutlined />}
                        shape="circle"
                        size='large'
                        onClick={() => {
                            if (messageValue.trim()) {
                                message.success('消息已发送');
                                setMessageValue('');
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export {
    CenterPanel
}