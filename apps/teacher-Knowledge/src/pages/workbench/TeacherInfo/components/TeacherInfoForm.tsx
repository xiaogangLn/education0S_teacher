import React, { useEffect, useMemo, useState } from 'react';
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
  message,
} from 'antd';
import {
  UserOutlined,
  CameraOutlined,
  PhoneOutlined,
  MailOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { authService } from '@api/index';
import {
  isCommercialTenant,
  loadPersistedUser,
  mapAuthUserToStore,
  persistCurrentUser,
} from '@/utils/currentUser';
import { extractPayload } from '@/utils/knowledgeMapper';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/slices/userSlice';
import type { UploadProps } from 'antd';

const { Text, Title } = Typography;

const SUBJECT_OPTIONS = [
  '语文',
  '数学',
  '英语',
  '物理',
  '化学',
  '生物',
  '历史',
  '地理',
  '政治',
];

const STAGE_OPTIONS = ['小学', '初中', '高中'];

interface TeacherInfoFormData {
  name: string;
  phone: string;
  email: string;
  stage?: string;
  subjects: string[];
  grade?: string;
  classes?: string[];
  role?: string;
}

const TeacherInfoForm: React.FC<{ form?: any }> = ({ form: outerForm }) => {
  const [innerForm] = Form.useForm<TeacherInfoFormData>();
  const form = outerForm || innerForm;
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.user.current);
  const user = currentUser || loadPersistedUser();
  const commercial = isCommercialTenant(user);
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl || '');
  const [avatarUploading, setAvatarUploading] = useState(false);

  const studentCount = user?.quotas?.students?.used ?? 0;

  const subtitle = useMemo(() => {
    if (!user) return '';
    if (commercial) {
      const stage = user.stage || '';
      const subjects = (user.subjects || []).join('、') || '未设置学科';
      return `${stage ? `${stage} · ` : ''}${subjects} · 带教 ${studentCount} 人`;
    }
    const school = user.schoolName || '学校';
    const grade = user.gradeName ? ` · ${user.gradeName}` : '';
    const roleLabel = user.role === 'is_grade_admin' ? '年级主任' : '教师';
    const subjects = (user.subjects || []).join('、') || roleLabel;
    return `${school}${grade} · ${subjects}`;
  }, [commercial, studentCount, user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authService.getMe();
        const payload = extractPayload<any>(res) || res;
        const mapped = mapAuthUserToStore(payload);
        if (cancelled) return;
        persistCurrentUser(mapped);
        dispatch(setUser(mapped));
        form.setFieldsValue({
          name: mapped.realName || '',
          phone: mapped.phone || '',
          email: mapped.email || '',
          stage: (mapped as any).stage || '',
          subjects: mapped.subjects || [],
          ...(commercial
            ? {}
            : {
                grade: mapped.gradeName || '',
                classes: mapped.classNames?.length
                  ? mapped.classNames
                  : mapped.className
                    ? [mapped.className]
                    : [],
                role: mapped.role || 'teacher',
              }),
        });
        if (mapped.avatarUrl) {
          setAvatarUrl(mapped.avatarUrl);
          form.setFieldValue('avatar_url', mapped.avatarUrl);
        }
      } catch {
        form.setFieldsValue({
          name: user?.realName || '',
          phone: user?.phone || '',
          email: user?.email || '',
          stage: (user as any)?.stage || '',
          subjects: user?.subjects || [],
          ...(commercial
            ? {}
            : {
                grade: user?.gradeName || '',
                classes: user?.classNames?.length
                  ? user.classNames
                  : user?.className
                    ? [user.className]
                    : [],
                role: user?.role || 'teacher',
              }),
        });
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadProps: UploadProps = {
    name: 'file',
    accept: 'image/jpeg,image/png,image/webp,image/gif',
    showUploadList: false,
    disabled: avatarUploading,
    beforeUpload: async (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('请上传图片文件');
        return Upload.LIST_IGNORE;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('图片大小不能超过 2MB');
        return Upload.LIST_IGNORE;
      }

      setAvatarUploading(true);
      const localPreview = URL.createObjectURL(file);
      setAvatarUrl(localPreview);

      try {
        const res = await authService.uploadAvatar(file);
        const payload = extractPayload<{ avatar_url?: string; user?: any }>(res) || (res as any);
        const nextUrl = payload?.avatar_url || payload?.user?.avatar_url || '';
        if (!nextUrl) {
          throw new Error('上传成功但未返回头像地址');
        }
        setAvatarUrl(nextUrl);
        form.setFieldValue('avatar_url', nextUrl);

        const mapped = payload?.user
          ? mapAuthUserToStore({ user: payload.user, ...payload })
          : { ...(user as any), avatarUrl: nextUrl };
        const withAvatar = { ...mapped, avatarUrl: nextUrl || mapped.avatarUrl };
        persistCurrentUser(withAvatar);
        dispatch(setUser(withAvatar));
        message.success('头像上传成功');
      } catch (error: any) {
        setAvatarUrl(user?.avatarUrl || '');
        message.error(error?.message || '头像上传失败，请重试');
      } finally {
        setAvatarUploading(false);
        // 等 React 切换到远程 URL 后再释放本地预览，避免闪断
        setTimeout(() => URL.revokeObjectURL(localPreview), 300);
      }
      return false;
    },
  };

  return (
    <div className="p-4">
      <Form form={form} layout="vertical">
        <Form.Item name="avatar_url" hidden>
          <Input />
        </Form.Item>
        <div className="flex items-center gap-8 mb-6 p-6 bg-gray-50 rounded-xl">
          <div className="relative">
            <Avatar
              size={80}
              src={avatarUrl || undefined}
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
              <Title level={4} className="mb-0">
                {user?.realName || '教师'}
              </Title>
              <Tag color="blue" className="flex items-center gap-1">
                <CheckCircleOutlined /> 已认证
              </Tag>
              {!commercial && user?.role === 'is_grade_admin' ? (
                <Tag color="purple">年级主任</Tag>
              ) : null}
            </div>
            <Text type="secondary">{subtitle}</Text>
            <div className="mt-2">
              <Upload {...uploadProps}>
                <Button type="dashed" size="small" loading={avatarUploading}>
                  更换头像
                </Button>
              </Upload>
            </div>
          </div>
        </div>

        <Divider className="my-4" />

        <Row gutter={[24, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
              <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="请输入姓名" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="手机号"
              name="phone"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1\d{10}$/, message: '请输入正确的手机号' },
              ]}
            >
              <Input
                prefix={<PhoneOutlined className="text-gray-400" />}
                placeholder="请输入手机号"
                size="large"
                disabled
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="邮箱"
              name="email"
              rules={[{ type: 'email', message: '请输入正确的邮箱格式' }]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="请输入邮箱（选填）"
                size="large"
              />
            </Form.Item>
          </Col>

          {commercial ? (
            <>
              <Col xs={24} sm={12}>
                <Form.Item label="任教学段" name="stage">
                  <Select
                    disabled
                    placeholder="注册时已确定"
                    size="large"
                    options={STAGE_OPTIONS.map((item) => ({ value: item, label: item }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="教学科目" name="subjects">
                  <Select
                    disabled
                    mode="multiple"
                    placeholder="注册时已确定"
                    size="large"
                    maxTagCount={4}
                    options={SUBJECT_OPTIONS.map((item) => ({ value: item, label: item }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="带教人数">
                  <Input size="large" disabled value={`${studentCount} 人（已添加学生）`} />
                </Form.Item>
              </Col>
            </>
          ) : (
            <>
              <Col xs={24} sm={12}>
                <Form.Item label="教学科目" name="subjects">
                  <Select
                    mode="multiple"
                    placeholder="请选择教学科目"
                    size="large"
                    maxTagCount={4}
                    options={SUBJECT_OPTIONS.map((item) => ({ value: item, label: item }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="任教年级" name="grade">
                  <Input size="large" disabled placeholder="由管理员分配" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="任教班级" name="classes">
                  <Select
                    mode="multiple"
                    disabled
                    placeholder="由管理员分配（最多3个）"
                    size="large"
                    maxTagCount={3}
                    options={(user?.classNames || []).map((name) => ({ value: name, label: name }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="身份">
                  <div className="flex items-center h-10">
                    {user?.role === 'is_grade_admin' ? (
                      <Tag color="purple">年级主任</Tag>
                    ) : user?.role === 'admin' ? (
                      <Tag color="magenta">管理员</Tag>
                    ) : (
                      <Tag>教师</Tag>
                    )}
                  </div>
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
      </Form>
    </div>
  );
};

export default TeacherInfoForm;
