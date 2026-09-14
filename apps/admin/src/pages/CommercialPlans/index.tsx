import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Divider, Empty, Form, Input, InputNumber, Modal, Row, Select, Spin, Switch, Tag, message } from 'antd';
import { ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import { commercialService, organizationsService, PLAN_LABELS, type AiModelCatalogItem, type CommercialPlanItem } from '@api/index';
import { extractPayload } from '@/utils/api';

const PLAN_COLOR: Record<string, string> = {
  basic: 'blue',
  pro: 'purple',
  turbo: 'gold',
};

const numberInputStyle = { width: '100%' as const };

type PlanFormValues = {
  name: string;
  period_days: number;
  /** 表单按「元」编辑，提交时再换成分 */
  price_yuan: number;
  student_limit: number | null;
  student_trial_days: number | null;
  student_trial_limit: number | null;
  lesson_plan_quota_monthly: number | null;
  courseware_quota_monthly: number | null;
  exam_quota_monthly: number | null;
  ai_quota_monthly: number | null;
  has_student_management: boolean;
  generate_personalized_homework: boolean;
  update_student_portrait: boolean;
  portrait_refresh_interval_days: number;
  generation_model?: string;
  grading_model?: string;
};

function fenToYuan(fen?: number | null) {
  return Math.round(((fen ?? 0) / 100) * 100) / 100;
}

function yuanToFen(yuan?: number | null) {
  return Math.max(0, Math.round((yuan ?? 0) * 100));
}

function formatPlanPrice(fen?: number | null) {
  const yuan = fenToYuan(fen);
  if (yuan === 0) return '¥0 / 月';
  return Number.isInteger(yuan) ? `¥${yuan} / 月` : `¥${yuan.toFixed(2)} / 月`;
}

function toFormValues(plan: CommercialPlanItem): PlanFormValues {
  return {
    name: plan.name,
    period_days: plan.period_days,
    price_yuan: fenToYuan(plan.price_fen),
    student_limit: plan.student_limit,
    student_trial_days: plan.student_trial_days,
    student_trial_limit: plan.student_trial_limit,
    lesson_plan_quota_monthly: plan.lesson_plan_quota_monthly,
    courseware_quota_monthly: plan.courseware_quota_monthly,
    exam_quota_monthly: plan.exam_quota_monthly,
    ai_quota_monthly: plan.ai_quota_monthly,
    has_student_management: Boolean(plan.has_student_management),
    generate_personalized_homework: Boolean(plan.generate_personalized_homework),
    update_student_portrait: Boolean(plan.update_student_portrait),
    portrait_refresh_interval_days: plan.portrait_refresh_interval_days ?? (
      plan.code === 'turbo' ? 7 : plan.code === 'pro' ? 30 : 60
    ),
    generation_model: plan.generation_model,
    grading_model: plan.grading_model,
  };
}

function modelOptions(catalog: AiModelCatalogItem[]) {
  return catalog.map((item) => ({
    value: item.id,
    label: item.note ? `${item.label}（${item.note}）` : item.label,
  }));
}

function isModelInCatalog(catalog: AiModelCatalogItem[], id?: string | null) {
  if (!id) return false;
  return catalog.some((item) => item.id === id);
}

function modelLabel(catalog: AiModelCatalogItem[], id?: string) {
  if (!id) return '未配置';
  return catalog.find((item) => item.id === id)?.label || '已失效，请重选';
}

function catalogModelRule(catalog: AiModelCatalogItem[], kindLabel: string) {
  return [
    { required: true, message: `请选择${kindLabel}` },
    {
      validator: async (_: unknown, value?: string) => {
        if (!catalog.length) {
          throw new Error(`${kindLabel}目录为空，请先在「模型目录」启用可用模型`);
        }
        if (!value || !isModelInCatalog(catalog, value)) {
          throw new Error(`请从目录中选择有效的${kindLabel}`);
        }
      },
    },
  ];
}

function PlanCard({
  plan,
  generationModels,
  gradingModels,
  onSaved,
}: {
  plan: CommercialPlanItem;
  generationModels: AiModelCatalogItem[];
  gradingModels: AiModelCatalogItem[];
  onSaved: (next: CommercialPlanItem) => void;
}) {
  const [form] = Form.useForm<PlanFormValues>();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const hasStudentManagement = Boolean(Form.useWatch('has_student_management', form));
  const watchedGeneration = Form.useWatch('generation_model', form);
  const watchedGrading = Form.useWatch('grading_model', form);
  const watchedPriceYuan = Form.useWatch('price_yuan', form);

  const generationInvalid = Boolean(plan.generation_model) && !isModelInCatalog(generationModels, plan.generation_model);
  const gradingInvalid = Boolean(plan.grading_model) && !isModelInCatalog(gradingModels, plan.grading_model);
  const catalogEmpty = !generationModels.length || !gradingModels.length;

  useEffect(() => {
    form.setFieldsValue({
      ...toFormValues(plan),
      generation_model: isModelInCatalog(generationModels, plan.generation_model)
        ? plan.generation_model
        : undefined,
      grading_model: isModelInCatalog(gradingModels, plan.grading_model)
        ? plan.grading_model
        : undefined,
    });
    setDirty(false);
  }, [form, plan, generationModels, gradingModels]);

  const persist = async (values: PlanFormValues) => {
    if (!isModelInCatalog(generationModels, values.generation_model) || !isModelInCatalog(gradingModels, values.grading_model)) {
      message.error('请从模型目录选择有效的生成/批改模型后再保存');
      return;
    }
    setSaving(true);
    try {
      const response = await commercialService.updatePlan(plan.code, {
        name: values.name,
        period_days: values.period_days,
        student_limit: values.student_limit ?? null,
        student_trial_days: values.student_trial_days ?? null,
        student_trial_limit: values.student_trial_limit ?? null,
        lesson_plan_quota_monthly: values.lesson_plan_quota_monthly ?? null,
        courseware_quota_monthly: values.courseware_quota_monthly ?? null,
        exam_quota_monthly: values.exam_quota_monthly ?? null,
        ai_quota_monthly: values.ai_quota_monthly ?? null,
        has_student_management: Boolean(values.has_student_management),
        generate_personalized_homework: Boolean(values.generate_personalized_homework),
        update_student_portrait: Boolean(values.update_student_portrait),
        portrait_refresh_interval_days: values.portrait_refresh_interval_days ?? 60,
        price_fen: yuanToFen(values.price_yuan),
        generation_model: values.generation_model,
        grading_model: values.grading_model,
      });
      const next = extractPayload<CommercialPlanItem>(response);
      if (next?.code) onSaved(next);
      setDirty(false);
      message.success(`${PLAN_LABELS[plan.code] || plan.name} 已保存`);
    } catch (error: any) {
      message.error(error?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = (values: PlanFormValues) => {
    Modal.confirm({
      title: `保存 ${PLAN_LABELS[plan.code] || plan.name}？`,
      content: '保存后立即对所有该档商业用户生效（含生成/批改模型）。',
      okText: '确认保存',
      cancelText: '取消',
      onOk: () => persist(values),
    });
  };

  return (
    <Card
      title={
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Tag color={PLAN_COLOR[plan.code]}>{PLAN_LABELS[plan.code] || plan.code}</Tag>
            <span>{plan.name}</span>
          </div>
          <div className="text-xs font-normal text-gray-500">
            {formatPlanPrice(
              watchedPriceYuan !== undefined && watchedPriceYuan !== null
                ? yuanToFen(watchedPriceYuan)
                : plan.price_fen,
            )}
            {' · '}
            生成 {modelLabel(generationModels, watchedGeneration || plan.generation_model)}
            {' · '}
            批改 {modelLabel(gradingModels, watchedGrading || plan.grading_model)}
            {' · '}
            画像 {plan.portrait_refresh_policy
              || (plan.code === 'turbo'
                ? '师生约每周更新 1 次'
                : plan.code === 'pro'
                  ? '师生约每月更新 1 次'
                  : '师生约每 2 个月更新 1 次')}
          </div>
        </div>
      }
      extra={
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => form.submit()}>
          {dirty ? '保存*' : '保存'}
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        onValuesChange={() => setDirty(true)}
        initialValues={toFormValues(plan)}
      >
        <Divider orientation="left" plain>
          模型（可配置）
        </Divider>
        {(catalogEmpty || generationInvalid || gradingInvalid) && (
          <Alert
            className="mb-4"
            type="error"
            showIcon
            message={
              catalogEmpty
                ? '模型目录为空或加载失败'
                : '当前套餐模型已失效'
            }
            description={
              catalogEmpty
                ? '请先到「模型目录」启用可用模型。目录为空时无法保存套餐。'
                : `请重新选择${[
                    generationInvalid ? '生成模型' : null,
                    gradingInvalid ? '批改模型' : null,
                  ]
                    .filter(Boolean)
                    .join(' / ')}。已删除或不在目录中的模型不会再作为选项回显。`
            }
          />
        )}
        <Form.Item
          name="generation_model"
          label="生成模型（教案 / 课件 / 试卷）"
          rules={catalogModelRule(generationModels, '生成模型')}
          extra="推荐阅卷档：3.7 Plus（性价比）/ 3.7 Max / 3.8 Max；思考过程始终开启"
        >
          <Select
            showSearch
            allowClear
            optionFilterProp="label"
            options={modelOptions(generationModels)}
            placeholder={generationModels.length ? '选择生成模型' : '暂无可用生成模型'}
            disabled={!generationModels.length}
            notFoundContent="目录中没有可用生成模型"
          />
        </Form.Item>
        <Form.Item
          name="grading_model"
          label="批改模型（识别 / 阅卷）"
          rules={catalogModelRule(gradingModels, '批改模型')}
          extra="识别用 3.6/3.7 Flash（替代即将下架的 qwen-vl）；阅卷用 3.7 Plus / Max / 3.8 Max"
        >
          <Select
            showSearch
            allowClear
            optionFilterProp="label"
            options={modelOptions(gradingModels)}
            placeholder={gradingModels.length ? '选择批改模型' : '暂无可用批改模型'}
            disabled={!gradingModels.length}
            notFoundContent="目录中没有可用批改模型"
          />
        </Form.Item>

        <Divider orientation="left" plain>
          配额与权限
        </Divider>
        <Form.Item name="name" label="显示名称" rules={[{ required: true, message: '请填写名称' }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="price_yuan"
          label="月价（元）"
          rules={[{ required: true, message: '请填写价格' }]}
          extra="对外展示与开通计价；0 表示免费档。支持小数，如 29.9"
        >
          <InputNumber
            min={0}
            step={1}
            precision={2}
            style={numberInputStyle}
            addonAfter="元 / 月"
            placeholder="例如 30"
          />
        </Form.Item>
        <Form.Item name="period_days" label="订阅周期（天）" rules={[{ required: true, message: '请填写天数' }]}>
          <InputNumber min={1} style={numberInputStyle} />
        </Form.Item>
        <Form.Item
          name="has_student_management"
          label="学生管理"
          valuePropName="checked"
          normalize={(value) => Boolean(value)}
        >
          <Switch checkedChildren="有正式权限" unCheckedChildren="仅体验" />
        </Form.Item>
        <Form.Item
          name="student_limit"
          label="可管理学生数"
          extra="空表示不限"
          hidden={!hasStudentManagement}
        >
          <InputNumber min={0} style={numberInputStyle} placeholder="空=不限" />
        </Form.Item>
        <Form.Item
          name="student_trial_days"
          label="体验天数"
          extra="到期后隐藏学生管理"
          hidden={hasStudentManagement}
        >
          <InputNumber min={0} style={numberInputStyle} placeholder="例如 15" />
        </Form.Item>
        <Form.Item name="student_trial_limit" label="体验学生数" hidden={hasStudentManagement}>
          <InputNumber min={0} style={numberInputStyle} placeholder="例如 10" />
        </Form.Item>
        <Form.Item name="lesson_plan_quota_monthly" label="教案次数 / 月" extra="空表示不限">
          <InputNumber min={0} style={numberInputStyle} placeholder="空=不限" />
        </Form.Item>
        <Form.Item name="courseware_quota_monthly" label="课件次数 / 月" extra="空表示不限">
          <InputNumber min={0} style={numberInputStyle} placeholder="空=不限" />
        </Form.Item>
        <Form.Item name="exam_quota_monthly" label="试卷次数 / 月" extra="空表示不限">
          <InputNumber min={0} style={numberInputStyle} placeholder="空=不限" />
        </Form.Item>
        <Form.Item name="ai_quota_monthly" label="批改次数 / 月" extra="空表示不限">
          <InputNumber min={0} style={numberInputStyle} placeholder="空=不限" />
        </Form.Item>
        <Form.Item
          name="generate_personalized_homework"
          label="个性化作业（调模型）"
          valuePropName="checked"
          normalize={(value) => Boolean(value)}
        >
          <Switch />
        </Form.Item>
        <Form.Item
          name="update_student_portrait"
          label="更新师生画像（调模型）"
          valuePropName="checked"
          normalize={(value) => Boolean(value)}
          extra="关闭后该档不回写教师/学生画像；开启后按下方间隔控频（师生共用）"
        >
          <Switch />
        </Form.Item>
        <Form.Item
          name="portrait_refresh_interval_days"
          label="师生画像更新间隔（天）"
          extra={
            plan.code === 'basic'
              ? '默认 60 天：师生约每 2 个月各更新 1 次'
              : plan.code === 'pro'
                ? '默认 30 天：师生约每月各更新 1 次'
                : '默认 7 天：师生约每周各更新 1 次'
          }
          rules={[{ required: true, message: '请填写间隔天数' }]}
        >
          <InputNumber min={0} style={numberInputStyle} placeholder="天" />
        </Form.Item>
      </Form>
    </Card>
  );
}

export const CommercialPlansPage = () => {
  const [items, setItems] = useState<CommercialPlanItem[]>([]);
  const [generationModels, setGenerationModels] = useState<AiModelCatalogItem[]>([]);
  const [gradingModels, setGradingModels] = useState<AiModelCatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [planRes, modelRes] = await Promise.all([
        commercialService.getPlans(),
        organizationsService.getAiModels(),
      ]);
      const payload = extractPayload<{ items: CommercialPlanItem[] }>(planRes);
      const models = extractPayload<{ generation: AiModelCatalogItem[]; grading: AiModelCatalogItem[] }>(modelRes);
      setItems(payload?.items || []);
      setGenerationModels(models?.generation || []);
      setGradingModels(models?.grading || []);
    } catch (error: any) {
      setItems([]);
      message.error(error?.message || '加载套餐失败');
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const modelHint = useMemo(() => {
    if (!generationModels.length || !gradingModels.length) {
      return '模型目录为空时无法配置套餐模型。请先到「模型目录」启用模型后刷新本页。';
    }
    return '只能选择模型目录中的启用项。识别请选 3.6/3.7 Flash；阅卷请选 3.7 Plus（性价比）或 Max。保存后立即对该档全部商业用户生效。教师端调用时若模型未配置、已删除或供应商欠费，将直接报错，无默认兜底模型。';
  }, [generationModels.length, gradingModels.length]);

  const catalogBroken = loaded && (!generationModels.length || !gradingModels.length);

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-lg font-medium">套餐能力</div>
          <div className="text-sm text-gray-500">
            配置基础版 / Pro / Turbo 的模型、月配额与价格。师生画像更新频率一致：基础约 2 个月 / Pro 约每月 / Turbo 约每周。
          </div>
        </div>
        <Button icon={<ReloadOutlined />} loading={loading} onClick={() => void loadData()}>
          刷新
        </Button>
      </div>
      <Alert
        className="mb-4"
        type={catalogBroken ? 'error' : 'info'}
        showIcon
        message={catalogBroken ? '模型目录不可用' : '商业版模型在此配置'}
        description={modelHint}
      />
      {loading && !loaded ? (
        <div className="flex justify-center py-24">
          <Spin size="large" />
        </div>
      ) : items.length === 0 ? (
        <Empty description="没有套餐数据" />
      ) : (
        <Row gutter={[16, 16]} className="mt-6">
          {items.map((plan) => (
            <Col xs={24} lg={8} key={plan.code}>
              <PlanCard
                plan={plan}
                generationModels={generationModels}
                gradingModels={gradingModels}
                onSaved={(next) => {
                  setItems((prev) => prev.map((item) => (item.code === next.code ? next : item)));
                }}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};
