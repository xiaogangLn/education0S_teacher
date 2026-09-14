/** 将思考过程中的英文阶段名/常见标签转为中文展示 */

const STAGE_LABEL: Record<string, string> = {
  init: '初始化',
  initialization: '初始化',
  analysis: '学情分析',
  outline: '大纲生成',
  content: '内容填充',
  refine: '精修定稿',
  refinement: '精修定稿',
  confirm: '确认完成',
};

const PHRASE_RULES: Array<[RegExp, string]> = [
  [/thinking\s*(process|steps?)?\s*[:：]?\s*/gi, '思考过程：'],
  [/reason(?:ing)?\s*(process|steps?)?\s*[:：]?\s*/gi, '推理过程：'],
  [/step\s*(\d+)\s*[:：.]?\s*/gi, '步骤$1：'],
  [/lesson\s*plan/gi, '教案'],
  [/courseware/gi, '课件'],
  [/exam(?:ination)?\s*paper/gi, '试卷'],
];

export function localizeThinkingText(input: string): string {
  let text = String(input || '');
  if (!text.trim()) return text;

  text = text.replace(
    /(?:阶段|stage|步骤|step)\s*[「"'【\[]?\s*(init|initialization|analysis|outline|content|refine|refinement|confirm)\s*[」"'】\]]?/gi,
    (_m, key: string) => `阶段「${STAGE_LABEL[key.toLowerCase()] || key}」`,
  );

  text = text.replace(
    /[「"'【\[]\s*(init|initialization|analysis|outline|content|refine|refinement|confirm)\s*[」"'】\]]/gi,
    (_m, key: string) => `「${STAGE_LABEL[key.toLowerCase()] || key}」`,
  );

  text = text.replace(
    /\b(init|initialization|analysis|outline|refine|refinement)\b/gi,
    (key) => STAGE_LABEL[key.toLowerCase()] || key,
  );

  for (const [pattern, replacement] of PHRASE_RULES) {
    text = text.replace(pattern, replacement);
  }

  return text.replace(/\n{3,}/g, '\n\n').trimStart();
}
