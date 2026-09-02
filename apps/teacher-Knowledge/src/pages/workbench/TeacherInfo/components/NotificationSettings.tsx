import React from 'react';
import { Form, Switch, Card } from 'antd';
import { 
    CheckCircleOutlined, 
    TeamOutlined,
    ToolOutlined,  
} from '@ant-design/icons';

const NotificationSettings: React.FC = () => {
    const [form] = Form.useForm();

    return (
        <div className="p-4">
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    auditResult: true,
                    collaborationInvite: true,
                    systemUpdate: false,
                }}
            >
                <Card className="bg-gray-50 rounded-xl border-0">
                    <div className="space-y-4">
                        {/* 审核结果 */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                                    <CheckCircleOutlined className="text-lg" />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-800">审核结果</div>
                                    <div className="text-xs text-gray-400">内容审核通过或拒绝时通知</div>
                                </div>
                            </div>
                            <Form.Item name="auditResult" valuePropName="checked" className="mb-0">
                                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                            </Form.Item>
                        </div>

                        {/* 协作邀请 */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                                    <TeamOutlined className="text-lg" />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-800">协作邀请</div>
                                    <div className="text-xs text-gray-400">收到协作邀请时通知</div>
                                </div>
                            </div>
                            <Form.Item name="collaborationInvite" valuePropName="checked" className="mb-0">
                                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                            </Form.Item>
                        </div>

                        {/* 系统更新 */}
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-500">
                                    <ToolOutlined className="text-lg" />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-800">系统更新</div>
                                    <div className="text-xs text-gray-400">系统版本更新时通知</div>
                                </div>
                            </div>
                            <Form.Item name="systemUpdate" valuePropName="checked" className="mb-0">
                                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                            </Form.Item>
                        </div>
                    </div>
                </Card>
            </Form>
        </div>
    );
};

export default NotificationSettings;