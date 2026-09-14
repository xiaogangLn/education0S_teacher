// packages/shared/src/mocks/handlers/prediction.ts
import { http, HttpResponse } from 'msw';

export const predictionHandlers = [
  http.get('/api/v1/predict/stream', async () => {
    const encoder = new TextEncoder();
    const steps = [
      { type: 'step', data: { type: 'info', title: '📊 数据加载', content: '已加载近6周数据', timestamp: new Date().toISOString() } },
      { type: 'step', data: { type: 'analysis', title: '📈 趋势分析', content: '### 趋势分析\n- 起始值: 65%\n- 当前值: 78%', timestamp: new Date().toISOString() } },
      { type: 'progress', progress: 50 },
      { type: 'step', data: { type: 'calculation', title: '🧮 模型计算', content: '### 线性回归\n- R²: 0.87', timestamp: new Date().toISOString() } },
      { type: 'complete', data: { summary: '预测完成', accuracy: 87, trend: 'up', generated_at: new Date().toISOString() } },
    ];

    const stream = new ReadableStream({
      async start(controller) {
        for (const step of steps) {
          await new Promise(resolve => setTimeout(resolve, 400));
          controller.enqueue(new TextEncoder().encode(`event: ${step.type}\ndata: ${JSON.stringify(step)}\n\n`));
        }
        controller.close();
      },
    });
    return new HttpResponse(stream, { headers: { 'Content-Type': 'text/event-stream' } });
  }),
];