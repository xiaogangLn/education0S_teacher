import { useMemo, useState } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Switch,
  message,
} from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { promptOpsService, type PromptRecipeItem } from '@api/index';
import { extractPayload } from '@/utils/api';
import {
  PREVIEW_SAMPLE_VARS,
  SCENE_OPTIONS,
  STAGE_OPTIONS,
} from '../constants';

type FormValues = {
  mode: 'scene' | 'recipe';
  recipe_id?: string;
  scene: string;
  stage: string;
  has_students: boolean;
  subject: string;
  lessonTopic: string;
  call_model: boolean;
  max_tokens: number;
};

type DryRunResult = {
  system_prompt: string;
  stage_ask: string;
  user_prompt: string;
  output: string;
  latency_ms: number;
  model_error?: string | null;
  call_model: boolean;
  meta?: Record<string, unknown>;
};

type Props = {
  recipes: PromptRecipeItem[];
};

export const DryRunPanel = ({ recipes }: Props) => {
  const [form] = Form.useForm<FormValues>();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<DryRunResult | null>(null);
  const mode = Form.useWatch('mode', form) ?? 'scene';

  const recipeOptions = useMemo(
    () =>
      recipes.map((item) => ({
        value: item.id,
        label: `${item.code}（${item.title} · ${item.status}）`,
      })),
    [recipes],
  );

  const run = async () => {
    const values = await form.validateFields();
    setRunning(true);
    try {
      const variables = {
        ...PREVIEW_SAMPLE_VARS,
        subject: values.subject,
        lessonTopic: values.lessonTopic,
        stage: values.stage,
        learnerRule: values.has_students
          ? '使用画像数字，禁止编造班级人数。'
          : '当前没有学生：禁止编造班级学情，禁止匹配教师画像，按课题、模板和素材生成通用内容。',
        roleLabel:
          values.scene === 'exam' ? '命题' : values.scene === 'courseware' ? '课件设计' : '备课',
        typeLabel:
          values.scene === 'exam' ? '试卷' : values.scene === 'courseware' ? '课件' : '教案',
      };
      const res = await promptOpsService.dryRun({
        recipe_id: values.mode === 'recipe' ? values.recipe_id : undefined,
        scene: values.scene,
        stage: values.stage,
        has_students: values.has_students,
        subject: values.subject,
        variables,
        call_model: values.call_model,
        max_tokens: values.max_tokens,
      });
      const payload = extractPayload<DryRunResult>(res);
      setResult(payload);
      if (payload?.model_error) {
        message.warning(payload.model_error);
      } else if (values.call_model) {
        message.success(`试跑完成（${payload?.latency_ms ?? 0}ms）`);
      } else {
        message.success('已拼装（未调模型）');
      }
    } catch (error: any) {
      message.error(error?.message || '试跑失败');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          mode: 'scene',
          scene: 'lesson_plan',
          stage: 'analysis',
          has_students: true,
          subject: '数学',
          lessonTopic: '导数的几何意义',
          call_model: true,
          max_tokens: 1024,
        }}
      >
        <Form.Item name="mode" label="试跑方式">
          <Select
            options={[
              { value: 'scene', label: '按场景 / 阶段匹配已发布配方' },
              { value: 'recipe', label: '指定配方' },
            ]}
          />
        </Form.Item>
        {mode === 'recipe' ? (
          <Form.Item
            name="recipe_id"
            label="配方"
            rules={[{ required: true, message: '请选择配方' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={recipeOptions}
              placeholder="选择配方"
            />
          </Form.Item>
        ) : (
          <>
            <Form.Item name="scene" label="场景" rules={[{ required: true }]}>
              <Select options={SCENE_OPTIONS.map((i) => ({ value: i.value, label: i.label }))} />
            </Form.Item>
            <Form.Item name="stage" label="阶段" rules={[{ required: true }]}>
              <Select options={STAGE_OPTIONS.map((i) => ({ value: i.value, label: i.label }))} />
            </Form.Item>
            <Form.Item name="has_students" label="有学情" valuePropName="checked">
              <Switch />
            </Form.Item>
          </>
        )}
        <Form.Item name="subject" label="学科">
          <Input />
        </Form.Item>
        <Form.Item name="lessonTopic" label="课题">
          <Input />
        </Form.Item>
        <Form.Item name="call_model" label="调用模型" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="max_tokens" label="max_tokens">
          <InputNumber min={256} max={4096} style={{ width: '100%' }} />
        </Form.Item>
        <Space>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            loading={running}
            onClick={() => void run()}
          >
            开始试跑
          </Button>
        </Space>
      </Form>

      <div className="min-h-[320px] space-y-4 overflow-auto rounded border border-slate-200 bg-white p-4 text-sm">
        {!result && <div className="text-slate-400">试跑结果会显示在这里</div>}
        {result && (
          <>
            <div>
              <div className="mb-1 font-medium">System</div>
              <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-slate-50 p-3">
                {result.system_prompt}
              </pre>
            </div>
            <div>
              <div className="mb-1 font-medium">Stage Ask</div>
              <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-slate-50 p-3">
                {result.stage_ask}
              </pre>
            </div>
            <div>
              <div className="mb-1 font-medium">模型输出</div>
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded bg-slate-50 p-3">
                {result.output || result.model_error || '（无输出）'}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
