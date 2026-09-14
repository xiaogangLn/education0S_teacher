import { useEffect, useMemo, useState } from 'react';
import { Form, Input, Modal, Select, Switch, message } from 'antd';
import {
  organizationsService,
  promptOpsService,
  type AiModelCatalogAdminItem,
  type PromptFragmentItem,
  type PromptRecipeItem,
} from '@api/index';
import { extractPayload } from '@/utils/api';
import { SCENE_OPTIONS, STAGE_OPTIONS } from '../constants';

type FormValues = {
  code: string;
  title: string;
  scene: string;
  stage: string;
  hasStudents?: boolean | 'any';
  fragment_keys: string[];
  model_hint?: string;
  locked: boolean;
  changelog?: string;
};

type Props = {
  open: boolean;
  editing: PromptRecipeItem | null;
  onClose: () => void;
  onSaved: () => void;
};

export const RecipeEditor = ({ open, editing, onClose, onSaved }: Props) => {
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);
  const [fragments, setFragments] = useState<PromptFragmentItem[]>([]);
  const [models, setModels] = useState<AiModelCatalogAdminItem[]>([]);
  const isEdit = Boolean(editing);

  useEffect(() => {
    if (!open) return;
    void (async () => {
      try {
        const [pubRes, draftRes, modelRes] = await Promise.all([
          promptOpsService.listFragments({ status: 'published' }),
          promptOpsService.listFragments({ status: 'draft' }),
          organizationsService.listAiModelCatalog({ kind: 'generation', include_disabled: false }),
        ]);
        const published = extractPayload<{ items: PromptFragmentItem[] }>(pubRes)?.items || [];
        const drafts = extractPayload<{ items: PromptFragmentItem[] }>(draftRes)?.items || [];
        const map = new Map<string, PromptFragmentItem>();
        for (const item of [...drafts, ...published]) {
          map.set(item.key, item);
        }
        setFragments([...map.values()]);
        setModels(extractPayload<{ items: AiModelCatalogAdminItem[] }>(modelRes)?.items || []);
      } catch (error: any) {
        message.error(error?.message || '加载选项失败');
      }
    })();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      const hasStudents =
        typeof editing.conditions?.hasStudents === 'boolean'
          ? editing.conditions.hasStudents
          : 'any';
      form.setFieldsValue({
        code: editing.code,
        title: editing.title,
        scene: editing.scene,
        stage: editing.stage,
        hasStudents,
        fragment_keys: editing.fragment_keys || [],
        model_hint: editing.model_hint || undefined,
        locked: editing.locked,
        changelog: '',
      });
    } else {
      form.setFieldsValue({
        code: '',
        title: '',
        scene: 'lesson_plan',
        stage: 'analysis',
        hasStudents: true,
        fragment_keys: [],
        model_hint: undefined,
        locked: false,
        changelog: '',
      });
    }
  }, [open, editing, form]);

  const fragmentOptions = useMemo(
    () =>
      fragments.map((item) => ({
        value: item.key,
        label: `${item.key}（${item.title} · v${item.version} · ${item.status}）`,
      })),
    [fragments],
  );

  const modelOptions = useMemo(
    () =>
      models
        .filter((item) => item.enabled)
        .map((item) => ({
          value: item.code,
          label: `${item.code}（${item.label}）`,
        })),
    [models],
  );

  const persist = async () => {
    const values = await form.validateFields();
    if (!values.fragment_keys?.length) {
      message.error('请至少选择一个片段');
      return;
    }
    const conditions =
      values.hasStudents === 'any' || values.hasStudents === undefined
        ? {}
        : { hasStudents: Boolean(values.hasStudents) };

    setSaving(true);
    try {
      if (editing) {
        await promptOpsService.updateRecipe(editing.id, {
          title: values.title,
          scene: values.scene,
          stage: values.stage,
          conditions,
          fragment_keys: values.fragment_keys,
          model_hint: values.model_hint || null,
          changelog: values.changelog,
        });
        message.success('已保存为新草稿（线上发布版仍生效，需重新发布才切换）');
      } else {
        await promptOpsService.createRecipe({
          code: values.code.trim(),
          title: values.title.trim(),
          scene: values.scene,
          stage: values.stage,
          conditions,
          fragment_keys: values.fragment_keys,
          model_hint: values.model_hint || null,
          locked: values.locked,
          changelog: values.changelog,
        });
        message.success('已创建草稿');
      }
      onSaved();
    } catch (error: any) {
      message.error(error?.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isEdit ? `编辑配方 · ${editing?.code}` : '新建配方'}
      open={open}
      onCancel={onClose}
      onOk={() => void persist()}
      confirmLoading={saving}
      width={720}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-2">
        <Form.Item name="code" label="Code" rules={[{ required: true, message: '请输入 code' }]}>
          <Input disabled={isEdit} placeholder="如 lesson_plan.analysis.has_students" />
        </Form.Item>
        <Form.Item name="title" label="标题" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <div className="grid grid-cols-2 gap-3">
          <Form.Item name="scene" label="场景" rules={[{ required: true }]}>
            <Select options={SCENE_OPTIONS.map((item) => ({ value: item.value, label: item.label }))} />
          </Form.Item>
          <Form.Item name="stage" label="阶段" rules={[{ required: true }]}>
            <Select options={STAGE_OPTIONS.map((item) => ({ value: item.value, label: item.label }))} />
          </Form.Item>
        </div>
        <Form.Item name="hasStudents" label="学情条件">
          <Select
            options={[
              { value: true, label: '有学情（班级有学生）' },
              { value: false, label: '无学情' },
              { value: 'any', label: '不限' },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="fragment_keys"
          label="有序片段（先 system/rule，再 stage_ask）"
          rules={[{ required: true, message: '请选择片段' }]}
        >
          <Select
            mode="multiple"
            options={fragmentOptions}
            optionFilterProp="label"
            placeholder="按拼装顺序选择"
          />
        </Form.Item>
        <Form.Item
          name="model_hint"
          label="绑定生成模型（可选）"
          extra="留空则用学校/套餐模型；填写后该配方优先用模型目录中的对应 code"
        >
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            options={modelOptions}
            placeholder={modelOptions.length ? '选择模型目录中的生成模型' : '暂无可用生成模型'}
            notFoundContent="请先在「模型目录」启用生成模型"
          />
        </Form.Item>
        {!isEdit && (
          <Form.Item name="locked" label="锁定" valuePropName="checked">
            <Switch />
          </Form.Item>
        )}
        <Form.Item name="changelog" label="变更说明">
          <Input placeholder="可选" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
