import { useEffect, useState } from 'react';
import { Form, Input, Modal, Select, Switch, message } from 'antd';
import { promptOpsService, type PromptFragmentItem } from '@api/index';
import { KIND_OPTIONS } from '../constants';

type FormValues = {
  key: string;
  title: string;
  kind: string;
  body: string;
  locked: boolean;
  changelog?: string;
};

type Props = {
  open: boolean;
  editing: PromptFragmentItem | null;
  onClose: () => void;
  onSaved: () => void;
};

export const FragmentModal = ({ open, editing, onClose, onSaved }: Props) => {
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(editing);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.setFieldsValue({
        key: editing.key,
        title: editing.title,
        kind: editing.kind,
        body: editing.body,
        locked: editing.locked,
        changelog: '',
      });
    } else {
      form.setFieldsValue({
        key: '',
        title: '',
        kind: 'stage_ask',
        body: '',
        locked: false,
        changelog: '',
      });
    }
  }, [open, editing, form]);

  const persist = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (editing) {
        await promptOpsService.updateFragment(editing.id, {
          title: values.title,
          kind: values.kind,
          body: values.body,
          changelog: values.changelog,
        });
        message.success('已保存为新草稿（线上发布版仍生效，需重新发布才切换）');
      } else {
        await promptOpsService.createFragment({
          key: values.key.trim(),
          title: values.title.trim(),
          kind: values.kind,
          body: values.body,
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
      title={isEdit ? `编辑片段 · ${editing?.key}` : '新建片段'}
      open={open}
      onCancel={onClose}
      onOk={() => void persist()}
      confirmLoading={saving}
      width={820}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-2">
        <Form.Item
          name="key"
          label="Key"
          rules={[{ required: true, message: '请输入唯一 key' }]}
        >
          <Input disabled={isEdit} placeholder="如 lesson_plan.analysis.stage_ask.custom" />
        </Form.Item>
        <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="kind" label="类型" rules={[{ required: true }]}>
          <Select options={KIND_OPTIONS.map((item) => ({ value: item.value, label: item.label }))} />
        </Form.Item>
        <Form.Item
          name="body"
          label="正文（支持 {{变量}}）"
          rules={[{ required: true, message: '请输入正文' }]}
        >
          <Input.TextArea rows={14} className="font-mono text-sm" />
        </Form.Item>
        {!isEdit && (
          <Form.Item name="locked" label="锁定（防删）" valuePropName="checked">
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
