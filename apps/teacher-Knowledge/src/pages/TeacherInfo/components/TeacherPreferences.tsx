import React from 'react';
import { Form, Select, Card } from 'antd';
import { RobotOutlined } from '@ant-design/icons';

const { Option } = Select;

const TeacherPreferences: React.FC = () => {
    const [form] = Form.useForm();

    return (
        <div className="p-4">
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    aiModel: 'gpt-4',
                    style: 'detailed',
                    language: 'zh-CN',
                }}
            >
                <Card className="bg-gray-50 rounded-xl border-0">
                    <div className="flex items-center gap-2 mb-4">
                        <RobotOutlined className="text-blue-500 text-xl" />
                        <span className="font-medium text-base">AI助手偏好</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Form.Item
                            label="AI模型"
                            name="aiModel"
                        >
                            <Select size="large">
                                <Option value="gpt-4">GPT-4</Option>
                                <Option value="gpt-3.5">GPT-3.5</Option>
                                <Option value="claude-3">Claude-3</Option>
                                <Option value="gemini">Gemini Pro</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="生成风格"
                            name="style"
                        >
                            <Select size="large">
                                <Option value="detailed">详细</Option>
                                <Option value="concise">简洁</Option>
                                <Option value="standard">标准</Option>
                                <Option value="creative">创意</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="语言"
                            name="language"
                        >
                            <Select size="large">
                                <Option value="zh-CN">中文（简体）</Option>
                                <Option value="zh-TW">中文（繁体）</Option>
                                <Option value="en-US">English</Option>
                            </Select>
                        </Form.Item>
                    </div>
                </Card>
            </Form>
        </div>
    );
};

export default TeacherPreferences;