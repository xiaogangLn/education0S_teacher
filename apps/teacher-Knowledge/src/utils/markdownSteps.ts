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

### 知识点结构
1. 二次函数定义
2. 图像特征（开口、对称轴、顶点）
3. 系数 a、b、c 对图像的影响
4. 图像平移变换

### 学生认知难点
- 系数 a 与开口方向的关系
- 顶点坐标的推导
- 图像平移规律

### 教学目标
- **知识与技能**: 掌握二次函数图像特征
- **过程与方法**: 通过图像观察发现规律
- **情感态度**: 感受数学之美`,
  },
  {
    id: 'outline',
    title: '框架设计',
    type: 'outline',
    status: 'pending',
    confirmable: true,
    confirmText: '确认框架',
    content: `## 📌 课件框架

### 页面结构
1. **封面页**：标题、作者、年级
2. **引入页**：生活情境导入
3. **探究页**：函数图像绘制（交互式）
4. **规律页**：系数与图像关系
5. **练习页**：巩固练习
6. **总结页**：课堂小结

### 交互设计
- 滑块控制系数 a、b、c
- 实时显示图像变化
- 点击显示关键点坐标

### 视觉风格
- 颜色主题：蓝色系 + 橙色点缀
- 字体：清晰易读
- 动画：平滑过渡`,
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