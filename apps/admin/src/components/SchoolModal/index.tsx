// pages/Schools/SchoolModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Cascader,
  Alert,
  message,
} from 'antd';
import { organizationsService, type AiModelCatalogItem } from '@api/index';
import { extractPayload } from '@/utils/api';
import { chinaRegionOptions, resolveRegionPath } from '@/utils/chinaRegion';

interface SchoolModalProps {
  visible: boolean;
  onClose: () => void;
  editingSchool?: any;
  onSubmit: (values: any) => Promise<void>;
}

export const SchoolModal: React.FC<SchoolModalProps> = ({
  visible,
  onClose,
  editingSchool,
  onSubmit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generationModels, setGenerationModels] = useState<AiModelCatalogItem[]>([]);
  const [gradingModels, setGradingModels] = useState<AiModelCatalogItem[]>([]);
  const isEducation = !editingSchool || editingSchool.type !== 'commercial';

  useEffect(() => {
    if (!visible) return;
    void organizationsService.getAiModels().then((response) => {
      const payload = extractPayload<{ generation: AiModelCatalogItem[]; grading: AiModelCatalogItem[] }>(response);
      const generation = payload?.generation || [];
      const grading = payload?.grading || [];
      setGenerationModels(generation);
      setGradingModels(grading);
      if (!generation.length || !grading.length) {
        message.warning('模型目录为空或加载不完整，请先在「模型目录」启用模型');
      }
      if (editingSchool) {
        const next: Record<string, unknown> = {};
        if (editingSchool.generation_model && !generation.some((item) => item.id === editingSchool.generation_model)) {
          next.generation_model = undefined;
        }
        if (editingSchool.grading_model && !grading.some((item) => item.id === editingSchool.grading_model)) {
          next.grading_model = undefined;
        }
        if (Object.keys(next).length) {
          form.setFieldsValue(next);
          message.error('该校已配置的模型不在目录中，请重新选择');
        }
      }
    }).catch((error: any) => {
      setGenerationModels([]);
      setGradingModels([]);
      message.error(error?.message || '加载模型目录失败');
    });
  }, [visible, editingSchool, form]);

  useEffect(() => {
    if (!visible) return;
    if (editingSchool) {
      form.setFieldsValue({
        name: editingSchool.name,
        code: editingSchool.code,
        region: resolveRegionPath(editingSchool.province, editingSchool.city, editingSchool.district),
        address: editingSchool.address || '',
        contact_person: editingSchool.contact_person || '',
        contact_phone: editingSchool.contact_phone || '',
        status: editingSchool.status || 'active',
        generation_model: editingSchool.generation_model || undefined,
        grading_model: editingSchool.grading_model || undefined,
        generation_base_url: editingSchool.generation_base_url || '',
        generation_api_key: '',
      });
    } else {
      form.resetFields();
    }
  }, [editingSchool, form, visible]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const region = Array.isArray(values.region) ? values.region : [];
      const [province, city, district] = region;
      if (!province || !city || !district) {
        message.error('请完整选择省 / 市 / 区');
        return;
      }

      await onSubmit({
        name: values.name,
        code: values.code,
        province,
        city,
        district,
        address: values.address || '',
        contact_person: values.contact_person || '',
        contact_phone: values.contact_phone || '',
        status: values.status || 'active',
        generation_model: values.generation_model,
        grading_model: values.grading_model,
        generation_base_url: values.generation_base_url || undefined,
        generation_api_key: values.generation_api_key || undefined,
      });
    } catch (error) {
      // 表单验证失败
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={editingSchool ? '编辑学校' : '新增学校'}
      open={visible}
      onCancel={onClose}
      width={640}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {editingSchool ? '保存' : '创建'}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ status: 'active' }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="学校名称"
              rules={[{ required: true, message: '请输入学校名称' }]}
            >
              <Input placeholder="请输入学校名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="code"
              label="学校编码"
              rules={[{ required: true, message: '请输入学校编码' }]}
            >
              <Input placeholder="请输入学校编码" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="region"
          label="所在地"
          rules={[
            { required: true, message: '请选择省市区' },
            {
              validator: async (_, value) => {
                if (!Array.isArray(value) || value.length < 3) {
                  throw new Error('请完整选择省 / 市 / 区');
                }
              },
            },
          ]}
        >
          <Cascader
            options={chinaRegionOptions}
            placeholder="请选择省 / 市 / 区"
            changeOnSelect={false}
            showSearch={{
              filter: (inputValue, path) =>
                path.some((option) =>
                  String(option.label || '').toLowerCase().includes(inputValue.toLowerCase()),
                ),
            }}
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item name="address" label="详细地址">
          <Input placeholder="请输入详细地址" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="contact_person"
              label="联系人"
              rules={[{ required: true, message: '请输入联系人' }]}
            >
              <Input placeholder="请输入联系人姓名" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="contact_phone"
              label="联系电话"
              rules={[
                { required: true, message: '请输入联系电话' },
                { pattern: /^[\d\-]+$/, message: '请输入正确的电话号码' },
              ]}
            >
              <Input placeholder="请输入联系电话" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="status" label="状态">
          <Select>
            <Select.Option value="active">已激活</Select.Option>
            <Select.Option value="inactive">已停用</Select.Option>
          </Select>
        </Form.Item>

        {isEducation ? (
          <>
            <Alert
              className="mb-4"
              type="info"
              showIcon
              message="教育版模型须写进线下合同"
              description="系统内不收费。指定的生成/批改模型、是否自带密钥和专线地址，都要在政府采购或线下合同里写清，并在此选择模型目录中的启用项。未配置模型时教师端调用会直接报错，无默认兜底。qwen-vl 系列预计下架，请改用 3.6/3.7 Flash 或 3.7 Plus/Max。"
            />
            <Form.Item
              name="generation_model"
              label="生成模型（教案/课件/试卷）"
              rules={[
                { required: true, message: '请选择生成模型' },
                {
                  validator: async (_, value) => {
                    if (!generationModels.length) {
                      throw new Error('生成模型目录为空，请先在「模型目录」启用模型');
                    }
                    if (value && !generationModels.some((item) => item.id === value)) {
                      throw new Error('请选择目录中的有效生成模型');
                    }
                  },
                },
              ]}
            >
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder={generationModels.length ? '请选择生成模型' : '暂无可用生成模型'}
                disabled={!generationModels.length}
                notFoundContent="目录中没有可用生成模型"
                options={generationModels.map((item) => ({
                  value: item.id,
                  label: item.note ? `${item.label}（${item.note}）` : item.label,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="grading_model"
              label="批改模型（识别 / 阅卷）"
              rules={[
                { required: true, message: '请选择批改模型' },
                {
                  validator: async (_, value) => {
                    if (!gradingModels.length) {
                      throw new Error('批改模型目录为空，请先在「模型目录」启用模型');
                    }
                    if (value && !gradingModels.some((item) => item.id === value)) {
                      throw new Error('请选择目录中的有效批改模型');
                    }
                  },
                },
              ]}
            >
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder={gradingModels.length ? '请选择批改模型' : '暂无可用批改模型'}
                disabled={!gradingModels.length}
                notFoundContent="目录中没有可用批改模型"
                options={gradingModels.map((item) => ({
                  value: item.id,
                  label: item.note ? `${item.label}（${item.note}）` : item.label,
                }))}
              />
            </Form.Item>
            <Form.Item name="generation_base_url" label="自定义生成接口（可选）" extra="合同约定自有网关时填写 OpenAI 兼容地址">
              <Input placeholder="例如 https://dashscope.aliyuncs.com/compatible-mode/v1" />
            </Form.Item>
            <Form.Item
              name="generation_api_key"
              label="自定义密钥（可选）"
              extra={editingSchool?.has_generation_api_key ? '已配置密钥，留空则保持不变' : '不填则使用平台密钥'}
            >
              <Input.Password placeholder="合同指定的 API Key" />
            </Form.Item>
          </>
        ) : (
          <Alert
            type="warning"
            showIcon
            message="商业租户的模型由套餐决定"
            description="基础版 / Pro / Turbo 的生成与批改模型请到「应用管理 → 套餐能力」分别配置。不要在学校上单独改。"
          />
        )}
      </Form>
    </Modal>
  );
};
