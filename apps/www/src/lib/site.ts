/** 站点配置：SEO、外链、套餐与产品文案（与老师工作站 / Admin 现网能力对齐） */

export const siteConfig = {
  name: 'EducationOS',
  tagline: '给老师的 AI 教学工作台',
  description:
    'EducationOS 把教案、课件、试卷的五阶段生成，与个人备课习惯（文风指纹）、智能组卷、拍照批改、学情画像、知识库连成闭环；课件可按需接入 OpenMAIC。老师自助商业版；学校扫码教育版，系统内零收费。',
  locale: 'zh-CN',
  twitter: '',
};

export const appUrl = (import.meta.env.PUBLIC_APP_URL || 'http://47.114.77.74:8081').replace(/\/$/, '');
export const siteUrl = (import.meta.env.PUBLIC_SITE_URL || 'https://www.educationos.cn').replace(/\/$/, '');

export const links = {
  login: `${appUrl}/?from=www`,
  register: `${appUrl}/?from=www&mode=register`,
  start: `${appUrl}/?from=www`,
};

export const nav = [
  { href: '/product', label: '产品' },
  { href: '/pricing', label: '定价' },
  { href: '/schools', label: '合作' },
  { href: '/guide', label: '指南' },
] as const;

/** 商业版套餐（与商业租户配额对齐；Admin 可改价后对外再同步） */
export const plans = [
  {
    code: 'basic',
    name: '基础版',
    price: 0,
    period: '月',
    blurb: '注册默认开通，先试用生成与批改',
    students: '体验 15 天 / 10 人',
    generate: '教案 4 · 课件 4 · 试卷 1',
    grading: '拍照批改 30 人次/月',
    portrait: '画像约 2 个月更新',
    highlight: false,
  },
  {
    code: 'pro',
    name: 'Pro',
    price: 30,
    period: '月',
    blurb: '带班教学，学生管理与更高配额',
    students: '学生上限 50',
    generate: '教案 18 · 课件 18 · 试卷 6',
    grading: '拍照批改 600 人次/月',
    portrait: '画像约每月更新',
    highlight: true,
  },
  {
    code: 'turbo',
    name: 'Turbo',
    price: 99,
    period: '月',
    blurb: '高频生成、批改与画像刷新',
    students: '学生上限 100',
    generate: '教案 24 · 课件 24 · 试卷 8',
    grading: '拍照批改 1200 人次/月',
    portrait: '画像约每周更新',
    highlight: false,
  },
] as const;

/** 首页「为什么是 EducationOS」 */
export const homeReasons = [
  {
    n: '01',
    title: '五阶段可控生成',
    desc: '课题确认 → 学情分析 → 大纲 → 正文 → 精修，每步可改指令再推进',
  },
  {
    n: '02',
    title: '越用越像你自己',
    desc: '从历史定稿抽取教案/课件/试卷习惯，生成时强制贴近你的文风',
  },
  {
    n: '03',
    title: '出题到阅卷闭环',
    desc: '智能组卷、作业分发/打印，纸笔作业拍照批改回写系统',
  },
  {
    n: '04',
    title: '学情驱动再教学',
    desc: '班级与学生画像支撑个性化作业与下一次生成（按套餐开放）',
  },
  {
    n: '05',
    title: '知识库 + 可选增强引擎',
    desc: '素材与成品沉淀复用；课件可按需旁路 OpenMAIC（校内部署）',
  },
  {
    n: '06',
    title: '双轨开通更省心',
    desc: '老师自助商业订阅；学校扫码教育版，整校导入、系统内零收费',
  },
] as const;

/** 产品页能力（与老师工作台 / education-workflow 现网对齐） */
export const productFeatures = [
  {
    n: '01',
    title: '五阶段生成',
    lead: '教案、课件、试卷同一套可控流程，不是一次性糊墙。',
    points: [
      '阶段：课题确认 · 学情分析 · 大纲 · 正文 · 精修',
      '中途可改指令，只优化当前阶段',
      '流式输出，终稿可继续精修与版本沉淀',
    ],
    visual: 'steps' as const,
  },
  {
    n: '02',
    title: '个人备课习惯',
    lead: '从你的历史定稿学习文风，让下一份教案更像「你写的」。',
    points: [
      '抽取口吻、教案习惯、课件习惯、试卷习惯与禁令表述',
      '生成时注入风格指纹，强制模仿可执行习惯（如分层、易错点、例题变式）',
      '随定稿沉淀持续重建，越用越贴合个人教学风格',
    ],
    visual: 'style' as const,
  },
  {
    n: '03',
    title: '智能组卷与作业',
    lead: '先定题型、题量、难度，再出卷、分发、打印。',
    points: [
      '题型题量与难度可视化配置',
      '试卷与答案分层输出',
      '作业 PDF 预览、批量打印与分发',
    ],
    visual: 'exam' as const,
  },
  {
    n: '04',
    title: '拍照批改',
    lead: '纸笔作业进系统，出分、批注，错因回写学情。',
    points: [
      '工作台拍照批改，配额清晰可追踪',
      '支持扫码移动端上传（课堂/课后）',
      '批改结果可确认与修正',
    ],
    visual: 'grade' as const,
  },
  {
    n: '05',
    title: '学情与画像',
    lead: '有学生时，生成与作业会贴合班级和个人画像。',
    points: [
      '学生五维画像与班级学情汇总',
      'Pro / Turbo 开放学生管理与个性化作业',
      '画像按套餐频率刷新（约 60 / 30 / 7 天）',
    ],
    visual: 'radar' as const,
  },
  {
    n: '06',
    title: '知识库与 OpenMAIC',
    lead: '成果沉淀复用；课件可按需接入 OpenMAIC 增强引擎。',
    points: [
      '个人知识库：文档分类、搜索收藏、教材与模板复用',
      'OpenMAIC：清华 MAIC 开源课件引擎，可校内本地化部署',
      '未开通或额度用尽时自动回退原生工作流，不影响备课',
    ],
    visual: 'engine' as const,
  },
  {
    n: '07',
    title: '账号与双轨开通',
    lead: '个人老师自助；行政学校走教育版合作通道。',
    points: [
      '商业注册：邮箱确认后激活，图片验证码 + 人机校验防刷',
      '忘记密码：绑定邮箱验证码重置（一周一次）',
      '教育版：线下合同、Admin 导入师生，系统内零收费',
    ],
    visual: 'access' as const,
  },
] as const;

export const guideSteps = [
  {
    n: '01',
    title: '注册并确认邮箱',
    desc: '手机号开个人空间，查收邮件完成确认后登录；默认基础版配额',
  },
  {
    n: '02',
    title: '五阶段生成（带个人习惯）',
    desc: '新建教案 / 课件 / 试卷逐步确认；系统会学习你的定稿习惯，生成更贴你的文风',
  },
  {
    n: '03',
    title: '组卷、批改与学情',
    desc: '出卷分发、拍照批改；有学生后贴合画像再教学；学校可按需开通 OpenMAIC 课件引擎',
  },
] as const;

/** 产品页底部信任说明 */
export const productTrustNotes = [
  '配额清晰：生成次数与批改人次按套餐展示',
  '过期只降权，不删你的备课数据',
  'OpenMAIC 为可选增强：未配置或额度用尽时自动走原生课件流程',
  '学校请走合作页扫码，勿用公开注册开成个人空间',
] as const;
