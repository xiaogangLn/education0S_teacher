export const SCENE_OPTIONS = [
  { value: 'lesson_plan', label: '教案' },
  { value: 'courseware', label: '课件' },
  { value: 'exam', label: '试卷' },
] as const;

export const STAGE_OPTIONS = [
  { value: 'init', label: '初始化' },
  { value: 'analysis', label: '学情/分析' },
  { value: 'outline', label: '大纲/框架' },
  { value: 'content', label: '正文' },
  { value: 'refine', label: '精修' },
] as const;

export const KIND_OPTIONS = [
  { value: 'system', label: '系统角色' },
  { value: 'stage_ask', label: '阶段任务' },
  { value: 'rule', label: '硬规则' },
  { value: 'format', label: '输出格式' },
] as const;

export const STATUS_COLOR: Record<string, string> = {
  draft: 'default',
  published: 'success',
  archived: 'warning',
};

export const STATUS_LABEL: Record<string, string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档',
};

export const SCENE_LABEL: Record<string, string> = Object.fromEntries(
  SCENE_OPTIONS.map((item) => [item.value, item.label]),
);

export const STAGE_LABEL: Record<string, string> = Object.fromEntries(
  STAGE_OPTIONS.map((item) => [item.value, item.label]),
);

export const KIND_LABEL: Record<string, string> = Object.fromEntries(
  KIND_OPTIONS.map((item) => [item.value, item.label]),
);

/** 预览时常用变量占位 */
export const PREVIEW_SAMPLE_VARS: Record<string, string> = {
  teachingStage: '高中',
  subject: '数学',
  roleLabel: '备课',
  typeLabel: '教案',
  stage: 'analysis',
  learnerRule: '使用画像数字，禁止编造班级人数。',
  lessonTopic: '导数的几何意义',
  typeExtraRule: '',
  examPlanText: '- 选择题 5 题\n- 填空题 3 题',
  examLevelLabel: '中等',
  examLevelMix: '易:中:难 = 3:5:2',
  examQuestionDigest: '1. …\n2. …',
};
