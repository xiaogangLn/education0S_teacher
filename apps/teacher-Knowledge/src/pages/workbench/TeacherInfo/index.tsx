import { ArrowLeftOutlined, CrownOutlined, SaveOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, message, Space, Tabs } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TeacherInfoForm from "./components/TeacherInfoForm";
import SubscriptionPanel from "./components/SubscriptionPanel";
import { authService } from "@api/index";
import { canShowBilling, isCommercialTenant, mapAuthUserToStore, persistCurrentUser } from "@/utils/currentUser";
import { extractPayload } from "@/utils/knowledgeMapper";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setUser } from "@/store/slices/userSlice";

const TeacherInfoComponent = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.user.current);
  const showBilling = canShowBilling(currentUser);
  const commercial = isCommercialTenant(currentUser);
  const [activeTab, setActiveTab] = useState("info");
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSave = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const response = await authService.updateProfile({
        real_name: values.name,
        email: values.email || "",
        ...(values.avatar_url ? { avatar_url: values.avatar_url } : {}),
        ...(commercial
          ? {}
          : {
              stage: values.stage,
              subjects: values.subjects,
            }),
      });
      const payload = extractPayload<any>(response);
      const mapped = mapAuthUserToStore(payload?.user ? payload : { user: payload, ...payload });
      persistCurrentUser(mapped);
      dispatch(setUser(mapped));
      form.setFieldsValue({
        name: mapped.realName,
        phone: mapped.phone,
        email: mapped.email || "",
        stage: mapped.stage || values.stage,
        subjects: mapped.subjects || values.subjects || [],
        avatar_url: mapped.avatarUrl || values.avatar_url || "",
      });
      message.success("保存成功");
    } catch (error: any) {
      message.error(error?.message || "保存失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    message.info("已取消编辑");
    navigate(-1);
  };

  const tabItems = [
    {
      key: "info",
      label: (
        <span className="flex items-center gap-2">
          <UserOutlined />
          个人档案
        </span>
      ),
    },
    ...(showBilling
      ? [
          {
            key: "subscription",
            label: (
              <span className="flex items-center gap-2">
                <CrownOutlined />
                订阅与开通
              </span>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">个人档案</h2>
          <p className="mt-1 text-sm text-gray-500">管理您的个人信息</p>
        </div>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
            取消并返回
          </Button>
          {activeTab === "info" ? (
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={handleSave}
              className="bg-blue-500 hover:bg-blue-600"
            >
              保存设置
            </Button>
          ) : null}
        </Space>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="shrink-0 border-b border-gray-100 px-4 pt-2">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="teacher-profile-tabs !mb-0 [&_.ant-tabs-nav]:mb-0"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {activeTab === "info" ? <TeacherInfoForm form={form} /> : null}
          {activeTab === "subscription" && showBilling ? <SubscriptionPanel /> : null}
        </div>
      </div>
    </div>
  );
};

export { TeacherInfoComponent };
