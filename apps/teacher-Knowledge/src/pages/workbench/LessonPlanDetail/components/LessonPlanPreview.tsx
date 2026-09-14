import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Empty, Segmented, Select, Space, Spin, Tag } from 'antd';
import type { LessonAssignmentPayload, PracticeQuestion } from '@api/index';

interface LessonPlanPreviewProps {
  title?: string;
  className?: string;
  published?: boolean;
  generating?: boolean;
  generateError?: string | null;
  assignment?: LessonAssignmentPayload | null;
  onGenerate?: () => void;
}

function questionLabel(item: PracticeQuestion, index: number) {
  const typeMap = { choice: '选择', fill: '填空', answer: '解答' };
  const type = typeMap[item.type] || '解答';
  return `${index + 1}. 【${type} · ${item.score || 10}分】${item.content}`;
}

function QuestionList({ items, personalized, studentName }: { items: PracticeQuestion[]; personalized?: boolean; studentName?: string }) {
  if (!items.length) {
    return <div className="text-xs text-gray-400 py-2">暂无题目</div>;
  }
  return (
    <>
      {items.map((item, index) => (
        <div
          key={item.id || index}
          className={personalized ? 'border-l-2 border-orange-300 pl-3 border-b border-dashed border-gray-200 py-1' : 'border-b border-dashed border-gray-200 py-1'}
        >
          {personalized && studentName ? (
            <span className="text-xs bg-blue-50 text-blue-600 px-1 rounded mr-1">👤 {studentName}</span>
          ) : null}
          {questionLabel(item, index)}
          {item.options?.length ? (
            <div className="text-xs text-gray-500 mt-1 pl-4">
              {item.options.map((option, optionIndex) => (
                <div key={optionIndex}>{String.fromCharCode(65 + optionIndex)}. {option}</div>
              ))}
            </div>
          ) : null}
          {item.knowledge_point ? (
            <div className="text-xs text-gray-400 mt-1 pl-4">知识点：{item.knowledge_point}</div>
          ) : null}
        </div>
      ))}
    </>
  );
}

export const LessonPlanPreview: React.FC<LessonPlanPreviewProps> = ({
  title,
  className,
  published,
  generating,
  generateError,
  assignment,
  onGenerate,
}) => {
  const [section, setSection] = useState<'in_class' | 'homework'>('in_class');
  const current = section === 'in_class' ? assignment?.in_class : assignment?.homework;
  const students = current?.students || [];
  const [studentId, setStudentId] = useState<string>();
  const selected = useMemo(() => {
    if (!students.length) return undefined;
    return students.find((item) => item.id === studentId) || students[0];
  }, [students, studentId]);

  const common = current?.common || [];
  const personalized = selected?.personalized || [];
  const sectionTitle = section === 'in_class' ? '随堂练习' : '课后练习';

  if (!published) {
    return <Alert type="info" showIcon message="教案发布后，将由模型为全班生成随堂练习和课后练习（含全班必做题与个性化题）。" />;
  }

  if (generating) {
    return (
      <Card>
        <div className="py-10 text-center">
          <Spin />
          <div className="mt-3 text-gray-500">正在由模型生成全班必做题与个性化练习…</div>
        </div>
      </Card>
    );
  }

  if (generateError) {
    return (
      <Alert
        type="error"
        showIcon
        message={generateError}
        action={<Button size="small" onClick={onGenerate}>重试生成</Button>}
      />
    );
  }

  if (!assignment?.generated) {
    return (
      <Empty description="尚未生成练习题">
        <Button type="primary" onClick={onGenerate}>由模型生成随堂/课后练习</Button>
      </Empty>
    );
  }

  return (
    <Card
      size="small"
      title={
        <div className="flex justify-between items-center flex-wrap gap-2">
          <span>📄 作业预览 · {selected?.name || '全班'}</span>
          <Space size="small" wrap>
            <Tag color="blue">模型生成</Tag>
            <Tag color="green">必做题 {common.length}</Tag>
            <Tag color="orange">个性化 {personalized.length}</Tag>
            <Tag color="purple">共 {common.length + personalized.length} 题</Tag>
          </Space>
        </div>
      }
    >
      <div className="flex flex-wrap gap-3 mb-3">
        <Segmented
          value={section}
          onChange={(value) => setSection(value as 'in_class' | 'homework')}
          options={[
            { label: '随堂练习', value: 'in_class' },
            { label: '课后练习', value: 'homework' },
          ]}
        />
        <Select
          placeholder="选择学生查看个性化题"
          className="min-w-[180px]"
          value={selected?.id}
          onChange={setStudentId}
          options={students.map((item) => ({ label: item.name, value: item.id }))}
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed border border-gray-200">
        <div className="text-center font-bold text-base mb-2">{title} · {sectionTitle}</div>
        <div className="flex justify-between text-xs text-gray-400 border-b border-gray-300 pb-2 mb-3">
          <span>班级: {className || assignment.class_name || '—'}</span>
          <span>学生: {selected?.name || '—'}</span>
        </div>

        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-blue-600">📌 第一部分：全班必做题</span>
            <Tag color="green" className="text-xs">模型生成 · 共{common.reduce((sum, item) => sum + (item.score || 0), 0)}分</Tag>
          </div>
          <div className="text-xs text-gray-400 mb-2">所有同学必须完成</div>
          <QuestionList items={common} />
        </div>

        <div className="border-t-2 border-dashed border-gray-300 my-2" />

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-orange-500">🎯 第二部分：个性化题</span>
            <Tag color="purple" className="text-xs">👤 {selected?.name || '学生'} · 共{personalized.length}题</Tag>
          </div>
          <div className="text-xs text-gray-400 mb-2">根据该生分层与薄弱点由模型定制</div>
          <QuestionList items={personalized} personalized studentName={selected?.name} />
        </div>
      </div>
    </Card>
  );
};
