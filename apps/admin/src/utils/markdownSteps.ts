// utils/markdownSteps.ts

import type { StepData, TemplateType } from "@/pages/workbench/Instrument/types";

// 教案模板的步骤
const lessonPlanSteps: StepData[] = [
  {
    id: 'init',
    title: '初始化',
    type: 'init',
    status: 'pending',
    confirmable: true,
    confirmText: '进入学情分析',
    content: `# 📝 教案生成 · 初始化

## 基本信息
- **课题**: 导数的几何意义与切线方程
- **班级**: 高二(3)班 · 45人
- **学科**: 数学
- **课时**: 2课时

## 💡 教学想法
数形结合，从平均变化率过渡到瞬时变化率；
使用 GeoGebra 动态演示切线逼近过程

<callout type="info" title="教师想法必填">
教学思路、重点强调、特殊设计都已包含
</callout>`,
  },
  {
    id: 'analysis',
    title: '学情分析',
    type: 'analysis',
    status: 'pending',
    confirmable: true,
    confirmText: '确认学情',
    content: `## 📊 班级学情分析

<callout type="info" title="系统自动读取">
基于班级画像自动生成学情分析报告
</callout>

### 数据概览
- **掌握度**: 68%
- **薄弱点**: 极限概念、切线斜率
- **分层**: A层12人 · B层20人 · C层13人
- **最近发展区**: 从平均变化率到导数定义

### 能力雷达
- 计算能力: ████████░░ 78%
- 逻辑推理: ██████░░░░ 62%
- 空间想象: █████████░ 85%`,
  },
  {
    id: 'outline',
    title: '大纲生成',
    type: 'outline',
    status: 'pending',
    confirmable: true,
    confirmText: '确认大纲',
    content: `## 📌 教学大纲

<ai>
AI 生成的教学大纲，教师可根据需要进行调整
</ai>

### 教学流程
1. **情境导入**：物理中的瞬时速度
2. **平均变化率 → 瞬时变化率**（极限思想）
3. **导数的几何意义**：切线斜率
4. **切线方程的求法**（点斜式）
5. **例题精讲与变式训练**
6. **课堂小结与作业布置**

### 时间分配
| 环节 | 时间 | 内容 |
|------|------|------|
| 导入 | 5min | 情境创设 |
| 新授 | 25min | 概念讲解 + 探究 |
| 练习 | 10min | 例题 + 变式 |
| 小结 | 5min | 总结巩固 |`,
  },
  {
    id: 'content',
    title: '内容填充',
    type: 'content',
    status: 'pending',
    confirmable: true,
    confirmText: '确认内容',
    content: `## 📄 教学内容

<ai>
### 引入
播放"赛车加速"短视频，引导学生思考瞬时速度的概念
</ai>

<teacher>
### 教师修改
调整为：展示气温变化曲线，引导学生观察"陡峭程度"
</teacher>

<ai>
### 探究
计算 f(x)=x² 在 x=1 附近的平均变化率
当 Δx→0 时，平均变化率趋近于 2
</ai>

### 例题
求曲线 y = x² 在点 (1, 1) 处的切线方程

**解：**
f'(x) = 2x，f'(1) = 2
切线方程：y - 1 = 2(x - 1) → y = 2x - 1

<callout type="warning" title="教师批注">
增加分组讨论环节，让学生互相讲解
</callout>`,
  },
  {
    id: 'refine',
    title: '精修定稿',
    type: 'refine',
    status: 'pending',
    confirmable: true,
    confirmText: '完成生成',
    content: `## ✨ 精修定稿

✅ 最终版教案已生成
✅ 包含 GeoGebra 动态演示链接
✅ AI 生成内容已标注

<callout type="success" title="生成完成">
教案已保存至知识库，可提交审批或存入草稿箱
</callout>

### 教学反思
- 本节课通过数形结合的方式，帮助学生理解导数的几何意义
- 学生参与度高，课堂互动良好
- 建议后续增加更多实际应用案例

---
**生成时间**: 2026-09-02 14:35
**版本**: v3
**字数**: 1,234 字`,
  },
];

// 课件模板的步骤
const coursewareSteps: StepData[] = [
  {
    id: 'init',
    title: '初始化',
    type: 'init',
    status: 'pending',
    confirmable: true,
    confirmText: '开始设计',
    content: `# 🎨 课件设计 · 初始化

## 基本信息
- **课件主题**: 二次函数图像与性质
- **适用年级**: 九年级
- **学科**: 数学
- **课时**: 1课时

## 💡 设计想法
通过动态演示直观展示二次函数图像的变化规律；
使用交互式元素让学生自主探索

<callout type="info" title="设计想法必填">
课件风格、交互方式、重点展示内容
</callout>`,
  },
  {
    id: 'analysis',
    title: '内容分析',
    type: 'analysis',
    status: 'pending',
    confirmable: true,
    confirmText: '确认分析',
    content: `## 📊 内容分析

<callout type="info" title="围绕学情与教师能力做教学判断">
先看清学生、课、知识问题和老师适合怎么上，再决定课件怎么设计
</callout>

### 学生分析
- **掌握度**: 68%
- **分层**: A层12人 · B层20人 · C层13人
- **已会**: 能画出二次函数草图
- **卡住**: 系数对图像的影响说不清，C 层仍把顶点公式当记忆题

### 教学分析
本课不宜一次讲完定义、图像、平移。先用动态图建立表象，再用对照页突破系数，最后用分层练习检验。

### 当前知识的问题
- 把开口方向与 a 的正负记反
- 顶点坐标只会套公式，不会从图上看
- 平移规律与解析式对不上

### 老师能力的分析
教师擅长启发式提问与数形结合，适合把关键问句做成可见页；抽象推导环节用图示补足，降低连续讲授压力。`,
  },
  {
    id: 'outline',
    title: '框架设计',
    type: 'outline',
    status: 'pending',
    confirmable: true,
    confirmText: '确认框架',
    content: `## 📌 框架设计

<ai>
根据内容分析决定怎么教，而不是先列页码
</ai>

### 教学决策
- **对学生**: C 层先过关开口与顶点，A 层再做平移与变式
- **对知识问题**: 用对照页同时显示 a 变化与图像变化，打断死记公式
- **对老师能力**: 启发提问做成逐步揭示，教师少讲、学生多看图说话

### 页面结构
1. **封面页**：点明本节要解决「系数如何改变图像」
2. **学习目标页**：按 A/B/C 分层写出可检测目标
3. **情境导入页**：投篮轨迹引出抛物线
4. **知识梳理页**：定义 + 图像对照
5. **探究页**：滑块看 a、b、c（突破知识问题）
6. **例题页**：从图读顶点与开口
7. **分层练习页**：C 层识图，A 层平移
8. **小结页**：回扣三个易错点

### 交互与呈现
滑块实时出图、关键点可点击；颜色只用来对照，不做装饰动画。`,
  },
  {
    id: 'content',
    title: '内容填充',
    type: 'content',
    status: 'pending',
    confirmable: true,
    confirmText: '确认内容',
    content: `## 📄 课件内容

<ai>
### 封面页
标题：二次函数图像与性质
副标题：探索抛物线的奥秘
</ai>

<teacher>
### 教师修改
添加：班级、姓名、日期信息
</teacher>

<ai>
### 引入页
情境：篮球投篮轨迹 → 二次函数图像
</ai>

<teacher>
### 教师修改
补充：展示更多生活中的抛物线实例（喷泉、拱桥）
</teacher>

<ai>
### 探究页
交互式滑块控制 a 值变化
实时绘制 y=ax² 图像
</ai>

<callout type="warning" title="教师批注">
增加对比模式：同时显示多个系数图像
</callout>`,
  },
  {
    id: 'refine',
    title: '精修定稿',
    type: 'refine',
    status: 'pending',
    confirmable: true,
    confirmText: '完成设计',
    content: `## ✨ 精修定稿

✅ 课件已生成
✅ 包含交互式元素
✅ 设计内容已标注

<callout type="success" title="设计完成">
课件已保存至知识库，可提交审批或继续优化
</callout>

### 设计亮点
- 交互式滑块探索系数与图像关系
- 动态演示图像变换过程
- 直观展示函数性质

---
**生成时间**: 2026-09-02 14:35
**版本**: v2
**页数**: 12 页`,
  },
];

// 根据模板获取步骤
export const getMarkdownStepsByTemplate = (template: TemplateType): StepData[] => {
  if (template === '教案模板') {
    return lessonPlanSteps;
  }
  if (template === '课件模板') {
    return coursewareSteps;
  }
  return [];
};

// 判断模板是否有步骤
export const hasStepsByTemplate = (template: TemplateType): boolean => {
  return ['教案模板', '课件模板'].includes(template);
};