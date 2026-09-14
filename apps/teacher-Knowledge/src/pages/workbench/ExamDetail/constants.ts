// constants.ts
import type { ExamDetail } from './types';

export const mockExam: ExamDetail = {
  id: 'exam-001',
  name: '函数单元复习卷',
  lessonPlanId: 'lp-001',
  lessonPlanTitle: '二次函数图像与性质',
  grade: '九年级',
  className: '九年级1班',
  subject: '数学',
  totalScore: 100,
  questionTypes: [
    { type: '选择题', count: 10, score: 40 },
    { type: '填空题', count: 6, score: 24 },
    { type: '解答题', count: 4, score: 36 },
  ],
  version: 3,
  status: 'reviewing',
  createdAt: '2026-08-29 10:00',
  updatedAt: '2026-08-30 14:30',
  estimatedTime: 45,
  isAIGenerated: true,
  questions: [
    // 选择题
    { id: 'q1', number: 1, type: 'choice', content: '二次函数 y = x² 的顶点坐标是（  ）', options: ['A. (0,0)', 'B. (1,1)', 'C. (0,1)', 'D. (1,0)'], score: 4 },
    { id: 'q2', number: 2, type: 'choice', content: '函数 y = 2x² 的图像开口方向为（  ）', options: ['A. 向上', 'B. 向下', 'C. 向左', 'D. 向右'], score: 4 },
    { id: 'q3', number: 3, type: 'choice', content: '二次函数 y = x² - 4x + 3 的对称轴是（  ）', options: ['A. x = 2', 'B. x = -2', 'C. x = 1', 'D. x = 3'], score: 4 },
    { id: 'q4', number: 4, type: 'choice', content: '以下哪个是二次函数（  ）', options: ['A. y = 2x + 1', 'B. y = x² + 3', 'C. y = 1/x', 'D. y = |x|'], score: 4 },
    { id: 'q5', number: 5, type: 'choice', content: '抛物线 y = x² 向右平移 2 个单位后解析式为（  ）', options: ['A. y = (x+2)²', 'B. y = (x-2)²', 'C. y = x² + 2', 'D. y = x² - 2'], score: 4 },
    { id: 'q6', number: 6, type: 'choice', content: '二次函数 y = x² - 4x + 3 的图像与 x 轴的交点个数是（  ）', options: ['A. 0', 'B. 1', 'C. 2', 'D. 3'], score: 4 },
    { id: 'q7', number: 7, type: 'choice', content: '函数 y = -x² + 4x - 3 的最大值是（  ）', options: ['A. 1', 'B. 2', 'C. 3', 'D. 4'], score: 4 },
    { id: 'q8', number: 8, type: 'choice', content: '二次函数 y = 2(x-1)² + 3 的顶点坐标是（  ）', options: ['A. (1,3)', 'B. (-1,3)', 'C. (1,-3)', 'D. (-1,-3)'], score: 4 },
    { id: 'q9', number: 9, type: 'choice', content: '下列函数中，开口向上的是（  ）', options: ['A. y = -x²', 'B. y = 2x²', 'C. y = -2x²', 'D. y = -x² + 1'], score: 4 },
    { id: 'q10', number: 10, type: 'choice', content: '抛物线 y = x² 向左平移 1 个单位再向下平移 2 个单位得到（  ）', options: ['A. y = (x+1)² - 2', 'B. y = (x-1)² - 2', 'C. y = (x+1)² + 2', 'D. y = (x-1)² + 2'], score: 4 },
    // 填空题
    { id: 'q11', number: 11, type: 'fill', content: '函数 y = x² - 1 的顶点坐标是 ______', score: 4 },
    { id: 'q12', number: 12, type: 'fill', content: '二次函数 y = 2(x-1)² + 3 的对称轴是 ______', score: 4 },
    { id: 'q13', number: 13, type: 'fill', content: '抛物线 y = x² + 2x 的顶点坐标是 ______', score: 4 },
    { id: 'q14', number: 14, type: 'fill', content: '函数 y = -x² + 4x - 3 的最大值是 ______', score: 4 },
    { id: 'q15', number: 15, type: 'fill', content: '二次函数 y = x² - 6x + 9 与 x 轴的交点个数是 ______', score: 4 },
    { id: 'q16', number: 16, type: 'fill', content: '抛物线 y = x² 向左平移 3 个单位再向上平移 2 个单位得到 ______', score: 4 },
    // 解答题
    { id: 'q17', number: 17, type: 'answer', content: '已知二次函数 y = x² - 4x + 3，求：\n(1) 顶点坐标\n(2) 对称轴\n(3) 与 x 轴交点', score: 9 },
    { id: 'q18', number: 18, type: 'answer', content: '已知抛物线 y = ax² + bx + c 经过点 (0,3)，(1,0)，(2,-1)，求解析式', score: 9 },
    { id: 'q19', number: 19, type: 'answer', content: '二次函数 y = x² + bx + c 的最小值为 -4，且经过点 (1,0)，求 b, c', score: 9 },
    { id: 'q20', number: 20, type: 'answer', content: '综合题：抛物线 y = x² - 2x - 3 与直线 y = 2x - 3 的交点坐标', score: 9 },
  ],
};