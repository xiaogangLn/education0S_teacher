import { useState } from "react";
import {
  EditOutlined,
  ExportOutlined,
  EyeOutlined,
  SendOutlined,
  StarOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Input, message, Space, Tag, Tooltip } from "antd";
import React from "react";

// ============================================================
// 五阶段步骤指示器组件
// ============================================================

interface StepIndicatorProps {
  currentStep: number; // 1-5
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { num: 1, label: "初始化" },
    { num: 2, label: "学情分析" },
    { num: 3, label: "大纲生成" },
    { num: 4, label: "内容填充" },
    { num: 5, label: "精修定稿" },
  ];

  const getStepStatus = (index: number) => {
    if (index + 1 < currentStep) return "done";
    if (index + 1 === currentStep) return "active";
    return "pending";
  };

  return (
    <div className="flex items-center gap-1 px-4 py-2.5 bg-gray-50 border-b border-gray-100 overflow-x-auto">
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.num}>
            <div
              className={`
                flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all
                ${status === "done" ? "bg-green-100 text-green-700" : ""}
                ${status === "active" ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : ""}
                ${status === "pending" ? "bg-gray-100 text-gray-400" : ""}
              `}
            >
              <span className="text-[10px] font-bold">{step.num}</span>
              {step.label}
              {status === "done" && <CheckCircleOutlined className="text-[10px]" />}
              {status === "active" && <LoadingOutlined className="text-[10px] animate-spin" />}
            </div>
            {!isLast && (
              <span
                className={`
                  text-xs font-light
                  ${status === "done" ? "text-green-400" : "text-gray-300"}
                `}
              >
                →
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ============================================================
// 主组件
// ============================================================

const CenterPanel = () => {
  const [messageValue, setMessageValue] = useState("");
  const [currentStep] = useState(4); // 当前在"内容填充"阶段

  const handleSend = () => {
    if (messageValue.trim()) {
      message.success("消息已发送");
      setMessageValue("");
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
      {/* ===== 对话头部 ===== */}
      <div className="p-3.5 bg-white border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">💬 对话区</span>
          <Tag color="blue" className="text-xs">五阶段交互</Tag>
          <Tag color="red" className="text-xs">非一次性生成</Tag>
          <span className="text-sm text-gray-400">张老师 · 14:30</span>
        </div>
        <Space size={2}>
          <Tooltip title="编辑">
            <Button type="text" size="small" icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="预览">
            <Button type="text" size="small" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="导出">
            <Button type="text" size="small" icon={<ExportOutlined />} />
          </Tooltip>
          <Tooltip title="收藏">
            <Button type="text" size="small" icon={<StarOutlined />} />
          </Tooltip>
        </Space>
      </div>

      {/* ===== 五阶段步骤指示器 ===== */}
      <StepIndicator currentStep={currentStep} />

      {/* ===== 对话内容 ===== */}
      <div className="flex-1 overflow-auto p-4 space-y-4 bg-gray-50/50">
        {/* --- 阶段①：初始化 --- */}
        <div className="flex justify-end">
          <div className="max-w-[78%] bg-indigo-600 text-white rounded-2xl rounded-br-sm p-3.5 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Tag color="red" className="text-[10px] border-none bg-white/20 text-white">
                阶段① 初始化
              </Tag>
            </div>
            <div className="text-sm leading-relaxed">
              <strong>帮我生成九年级数学《二次函数图像与性质》的教案</strong>
            </div>
            <div className="text-sm leading-relaxed mt-2 opacity-85 bg-white/10 rounded-lg p-2.5 text-[13px]">
              📌 教学想法：从图像入手，先感性再理性，结合几何画板动态演示
            </div>
            <div className="text-[11px] opacity-60 mt-1.5 text-right">张老师 · 14:30</div>
          </div>
        </div>

        {/* --- 阶段②：学情分析 --- */}
        <div className="flex items-start gap-3">
          <Avatar size="small" className="bg-indigo-500 flex-shrink-0 text-white text-xs">
            AI
          </Avatar>
          <div className="flex-1">
            <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Tag color="blue" className="text-[10px]">阶段② 学情分析</Tag>
                <Tag color="purple" className="text-[10px]">🤖 AI自动分析</Tag>
                <Tag color="green" className="text-[10px]">系统读取班级画像</Tag>
              </div>

              <div className="bg-blue-50/60 rounded-xl p-3.5 border border-blue-100/60">
                <div className="text-sm text-gray-700">
                  <span className="font-medium text-indigo-600">📊 班级掌握度：68%</span>
                  <span className="mx-2 text-gray-300">·</span>
                  薄弱点：<span className="font-medium text-amber-600">开口方向判定、对称轴公式</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  📌 分层：A层12人 · B层20人 · C层13人
                </div>
                <div className="text-sm text-gray-600 mt-0.5">
                  🧠 最近发展区：从图像观察到代数推导
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-gray-400">🤖 AI · 14:30</span>
                <Tag color="green" className="text-[10px] border-none bg-green-50 text-green-600 flex items-center gap-0.5">
                  <CheckCircleOutlined /> 已完成
                </Tag>
              </div>

              <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-gray-100">
                <Button size="small" type="primary" className="text-xs h-7 px-3 rounded-full">
                  ✅ 教师确认
                </Button>
                <Button size="small" className="text-xs h-7 px-3 rounded-full border-gray-200">
                  ✏️ 调整
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* --- 阶段③：大纲生成 --- */}
        <div className="flex items-start gap-3">
          <Avatar size="small" className="bg-indigo-500 flex-shrink-0 text-white text-xs">
            AI
          </Avatar>
          <div className="flex-1">
            <div className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Tag color="purple" className="text-[10px]">阶段③ 大纲生成</Tag>
                <Tag color="gold" className="text-[10px]">🤖 AI生成 · 教师可调整</Tag>
              </div>

              <div className="bg-purple-50/60 rounded-xl p-3.5 border border-purple-100/60">
                <div className="text-sm text-gray-700 space-y-1">
                  <div>1. 情境导入：生活中的抛物线</div>
                  <div>2. 图像绘制：y=x² 与 y=-x² 对比</div>
                  <div>3. 开口方向与 a 的关系探究</div>
                  <div>4. 对称轴与顶点坐标公式推导</div>
                  <div>5. 典型例题精讲</div>
                  <div>6. 课堂小结与作业布置</div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-gray-400">🤖 AI · 14:31</span>
                <Tag color="green" className="text-[10px] border-none bg-green-50 text-green-600 flex items-center gap-0.5">
                  <CheckCircleOutlined /> 已完成
                </Tag>
              </div>

              <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-gray-100">
                <Button size="small" type="primary" className="text-xs h-7 px-3 rounded-full">
                  ✅ 确认
                </Button>
                <Button size="small" className="text-xs h-7 px-3 rounded-full border-gray-200">
                  ✏️ 调整大纲
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* --- 阶段④：内容填充（当前进行中，高亮） --- */}
        <div className="flex items-start gap-3">
          <Avatar size="small" className="bg-indigo-500 flex-shrink-0 text-white text-xs">
            AI
          </Avatar>
          <div className="flex-1">
            <div
              className="bg-white rounded-2xl rounded-bl-sm p-4 shadow-md border-2 border-indigo-400/60"
              style={{ boxShadow: "0 4px 20px rgba(79, 70, 229, 0.10)" }}
            >
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Tag color="gold" className="text-[10px] bg-amber-50 border-amber-200 text-amber-700">
                  阶段④ 内容填充 · 进行中
                </Tag>
                <Tag color="blue" className="text-[10px]">🤖 AI生成</Tag>
                <Tag color="gold" className="text-[10px]">✏️ 教师修改</Tag>
                <Tag color="processing" className="text-[10px] flex items-center gap-0.5">
                  <LoadingOutlined className="animate-spin" /> 生成中
                </Tag>
              </div>

              <div className="bg-amber-50/60 rounded-xl p-3.5 border border-amber-100/60">
                <div className="text-sm text-gray-700 space-y-2">
                  <div>
                    <Tag color="blue" className="text-[10px]">🤖 AI生成</Tag>
                    引入：播放"投篮抛物线"短视频
                  </div>
                  <div className="bg-white/60 rounded-lg p-2.5 -mx-1">
                    <Tag color="gold" className="text-[10px]">✏️ 教师修改</Tag>
                    调整为：展示校园喷泉照片，引导学生观察"水流轨迹"
                  </div>
                  <div>
                    <Tag color="blue" className="text-[10px]">🤖 AI生成</Tag>
                    探究：列表描点绘制 y=x² 图像
                  </div>
                  <div className="bg-blue-50/70 rounded-lg p-2.5 -mx-1 border border-blue-100/50">
                    📝 教师批注：增加分组合作绘制环节，每组绘制不同系数图像
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-gray-400">🤖 AI · 14:32</span>
                <Tag color="processing" className="text-[10px] flex items-center gap-0.5 border-none bg-indigo-50 text-indigo-600">
                  <LoadingOutlined className="animate-spin" /> 进行中
                </Tag>
              </div>

              <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-gray-100 flex-wrap">
                <Button size="small" type="primary" className="text-xs h-7 px-3 rounded-full bg-green-500 border-green-500">
                  ✅ 确认
                </Button>
                <Button size="small" className="text-xs h-7 px-3 rounded-full border-gray-200">
                  ✏️ 继续修改
                </Button>
                <Button size="small" className="text-xs h-7 px-3 rounded-full border-gray-200">
                  🔄 重新生成
                </Button>
              </div>

              <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-400">
                <span>📊 字数 1,234</span>
                <span>·</span>
                <span>知识点 3</span>
                <span>·</span>
                <span>v2</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- 阶段⑤：精修定稿（待进入，灰显预览） --- */}
        <div className="flex items-start gap-3 opacity-50">
          <Avatar size="small" className="bg-gray-300 flex-shrink-0 text-white text-xs">
            AI
          </Avatar>
          <div className="flex-1">
            <div className="bg-gray-50 rounded-2xl rounded-bl-sm p-4 border border-gray-200 border-dashed">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Tag color="green" className="text-[10px]">阶段⑤ 精修定稿</Tag>
                <Tag color="gray" className="text-[10px]">✨ AI润色 · 待开始</Tag>
              </div>

              <div className="bg-gray-100/60 rounded-xl p-3.5 border border-gray-200 border-dashed">
                <div className="text-sm text-gray-500">
                  <div>✅ 最终版教案将在此生成 · 包含几何画板动态演示链接</div>
                  <div className="text-xs text-gray-400 mt-1.5">
                    🤖 AI生成内容将自动标注 · 教师可最终确认
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-gray-200">
                <Button size="small" className="text-xs h-7 px-3 rounded-full border-gray-300 text-gray-400" disabled>
                  📤 提交审批
                </Button>
                <Button size="small" className="text-xs h-7 px-3 rounded-full border-gray-300 text-gray-400" disabled>
                  📥 草稿箱
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 底部输入框（保持不变） ===== */}
      <div className="p-3.5 pr-3.5 bg-white border-t border-gray-100">
        <div className="flex gap-2 items-end">
          <Input.TextArea
            value={messageValue}
            onChange={(e) => setMessageValue(e.target.value)}
            placeholder="💬 输入消息或指令..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            className="flex-1 !min-h-[44px] !rounded-2xl !border-gray-200 hover:!border-indigo-300 focus:!border-indigo-500 !shadow-none !text-sm !leading-relaxed"
            onPressEnter={(e) => {
              if (!e.shiftKey && messageValue.trim()) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            shape="circle"
            size="large"
            className="flex-shrink-0 shadow-sm"
            onClick={handleSend}
          />
        </div>
      </div>
    </div>
  );
};

export { CenterPanel };