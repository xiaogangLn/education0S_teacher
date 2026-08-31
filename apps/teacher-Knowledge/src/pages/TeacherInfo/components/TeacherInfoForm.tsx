import React, { useState } from 'react';
import { 
    Form, 
    Input, 
    Button, 
    Avatar, 
    Upload, 
    Row, 
    Col,
    Select,
    Divider,
    Tag,
    Typography,
    message
} from 'antd';
import { 
    UserOutlined, 
    CameraOutlined, 
    PhoneOutlined, 
    MailOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Text, Title } = Typography;
const { Option } = Select;

interface TeacherInfoFormData {
    name: string;
    phone: string;
    email: string;
    grade: string;
    classes: string[];
    role: string;
}

const TeacherInfoForm: React.FC = () => {
    const [form] = Form.useForm<TeacherInfoFormData>();
    const [avatarUrl, setAvatarUrl] = useState<string>('');

    // 头像上传配置
    const uploadProps: UploadProps = {
        name: 'avatar',
        showUploadList: false,
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('请上传图片文件');
                return false;
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('图片大小不能超过 2MB');
                return false;
            }
            // 模拟上传
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setAvatarUrl(reader.result as string);
                message.success('头像上传成功');
            };
            return false;
        },
    };

    // 年级选项
    const gradeOptions = [
        { value: '2024届', label: '2024届 (现初一)' },
        { value: '2025届', label: '2025届 (现初二)' },
        { value: '2026届', label: '2026届 (现初三)' },
    ];

    // 班级选项
    const classOptions = [
        { value: '九年级1班', label: '九年级1班' },
        { value: '九年级2班', label: '九年级2班' },
        { value: '九年级3班', label: '九年级3班' },
        { value: '九年级4班', label: '九年级4班' },
        { value: '九年级5班', label: '九年级5班' },
    ];

    return (
        <div className="p-4">
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    name: '张老师',
                    phone: '138****1234',
                    email: 'zhang@xxschool.com',
                    grade: '2026届',
                    classes: ['九年级1班', '九年级2班'],
                    role: 'admin',
                }}
            >
                {/* 头像区域 */}
                <div className="flex items-center gap-8 mb-6 p-6 bg-gray-50 rounded-xl">
                    <div className="relative">
                        <Avatar
                            size={80}
                            src={avatarUrl}
                            icon={<UserOutlined />}
                            className="border-4 border-white shadow-lg"
                        />
                        <Upload {...uploadProps}>
                            <div className="absolute bottom-0 flex item-center justify-center right-0 bg-blue-500 h-[30px] w-[30px] rounded-[60px] p-1.5 cursor-pointer hover:bg-blue-600 transition-colors shadow-lg">
                                <CameraOutlined className="!text-[#fff] text-[15px]" />
                            </div>
                        </Upload>
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <Title level={4} className="mb-0">张老师</Title>
                            <Tag color="blue" className="flex items-center gap-1">
                                <CheckCircleOutlined /> 已认证
                            </Tag>
                        </div>
                        <Text type="secondary">XX中学 · 九年级数学（2026届）</Text>
                        <div className="mt-2">
                            <Button type="dashed" size="small">更换头像</Button>
                        </div>
                    </div>
                </div>

                <Divider className="my-4" />

                {/* 基本信息 */}
                <Row gutter={[24, 16]}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="姓名"
                            name="name"
                            rules={[{ required: true, message: '请输入姓名' }]}
                        >
                            <Input 
                                prefix={<UserOutlined className="text-gray-400" />}
                                placeholder="请输入姓名"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="手机号"
                            name="phone"
                            rules={[
                                { required: true, message: '请输入手机号' },
                                { pattern: /^1\d{10}$/, message: '请输入正确的手机号' }
                            ]}
                        >
                            <Input 
                                prefix={<PhoneOutlined className="text-gray-400" />}
                                placeholder="请输入手机号"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="邮箱"
                            name="email"
                            rules={[
                                { required: true, message: '请输入邮箱' },
                                { type: 'email', message: '请输入正确的邮箱格式' }
                            ]}
                        >
                            <Input 
                                prefix={<MailOutlined className="text-gray-400" />}
                                placeholder="请输入邮箱"
                                size="large"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="所属届别"
                            name="grade"
                            rules={[{ required: true, message: '请选择所属届别' }]}
                        >
                            <Select placeholder="请选择所属届别" size="large">
                                {gradeOptions.map(opt => (
                                    <Option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="任教班级"
                            name="classes"
                            rules={[{ required: true, message: '请选择任教班级' }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="请选择任教班级"
                                size="large"
                                maxTagCount={2}
                            >
                                {classOptions.map(opt => (
                                    <Option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            label="换班管理权限"
                            name="role"
                        >
                            <Select placeholder="请选择权限" size="large">
                                <Option value="admin">可调配</Option>
                                <Option value="viewer">仅查看</Option>
                                <Option value="none">无权限</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <div className="mt-4 text-xs text-gray-400">
                    带 <span className="text-red-500">*</span> 的为必填项
                </div>
            </Form>
        </div>
    );
};

export default TeacherInfoForm;