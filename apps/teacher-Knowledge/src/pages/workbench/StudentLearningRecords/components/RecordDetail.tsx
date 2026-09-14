import React, { useEffect, useState } from 'react';
import { Modal, Tag, Button, Image, Input, InputNumber, message } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import type { LearningRecord } from '../types';
import { HomeworkImageField } from './HomeworkImageField';

export type RecordDetailMode = 'view' | 'submit' | 'grade' | 'images';

interface RecordDetailProps {
  open: boolean;
  record: LearningRecord | null;
  loading?: boolean;
  mode?: RecordDetailMode;
  studentId?: string;
  onClose: () => void;
  onSubmit?: (recordId: string, data: { images: string[]; comment: string; rating: number }) => void;
  onGrade?: (recordId: string, data: { score: number; feedback: string }) => void;
}

export const RecordDetail: React.FC<RecordDetailProps> = ({
  open,
  record,
  loading = false,
  mode = 'view',
  studentId,
  onClose,
  onSubmit,
  onGrade,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!open) return;
    setRating(0);
    setComment('');
    setFileList([]);
    setUploadedImages([]);
    setScore(Number(record?.score || 0));
    setFeedback(record?.teacherFeedback || '');
  }, [open, record?.id, record?.score, record?.teacherFeedback]);

  const resetForm = () => {
    setRating(0);
    setComment('');
    setFileList([]);
    setUploadedImages([]);
    setScore(0);
    setFeedback('');
  };

  if (!record) return null;

  const commonQuestions = record.commonQuestions || [];
  const personalizedQuestions = record.personalizedQuestions || [];
  const recordImages = (record.images || []).filter(Boolean);
  const isSubmitMode = mode === 'submit';
  const isGradeMode = mode === 'grade';
  const isImagesMode = mode === 'images';

  const renderQuestions = () => (
    <div className="mb-4">
      <div className="font-semibold text-sm mb-2">📝 练习题目</div>
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-blue-600">全班必做题</span>
            <Tag color="green">{commonQuestions.length} 题</Tag>
          </div>
          {commonQuestions.length ? commonQuestions.map((item, index) => (
            <div key={item.id || index} className="text-sm py-1 border-b border-dashed border-gray-200 last:border-0">
              {index + 1}. {item.content}
              {item.options?.length ? (
                <div className="text-xs text-gray-500 pl-4 mt-1">
                  {item.options.map((option, optionIndex) => (
                    <div key={optionIndex}>{String.fromCharCode(65 + optionIndex)}. {option}</div>
                  ))}
                </div>
              ) : null}
            </div>
          )) : <div className="text-xs text-gray-400">暂无必做题</div>}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-orange-500">个性化题</span>
            <Tag color="orange">{personalizedQuestions.length} 题</Tag>
          </div>
          {personalizedQuestions.length ? personalizedQuestions.map((item, index) => (
            <div key={item.id || index} className="text-sm py-1 border-l-2 border-orange-300 pl-3 border-b border-dashed border-gray-200 last:border-0">
              {index + 1}. {item.content}
            </div>
          )) : <div className="text-xs text-gray-400">暂无个性化题</div>}
        </div>
      </div>
    </div>
  );

  const handleSubmit = () => {
    if (uploadedImages.length === 0) {
      message.warning('请上传作业图片');
      return;
    }
    onSubmit?.(record.id, {
      images: uploadedImages,
      comment: comment.trim(),
      rating,
    });
  };

  const handleGrade = () => {
    if (!score) {
      message.warning('请填写分数');
      return;
    }
    onGrade?.(record.id, { score, feedback: feedback.trim() || '批改完成' });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const titleMap = {
    view: '题目详情',
    submit: '提交作业',
    grade: '批改作业',
    images: '作业图片',
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={isImagesMode ? 720 : 820}
      title={
        <div className="flex items-center gap-2">
          <span>📄 {titleMap[mode]} - {record.title}</span>
          {isSubmitMode && <Tag color="blue">待提交</Tag>}
          {isGradeMode && <Tag color="warning">待批改</Tag>}
          {mode === 'view' && record.section === 'in_class' && <Tag color="blue">随堂练习</Tag>}
          {mode === 'view' && record.section === 'homework' && <Tag color="purple">课后练习</Tag>}
        </div>
      }
      confirmLoading={loading}
    >
      {isImagesMode ? (
        <div>
          {recordImages.length ? (
            <Image.PreviewGroup>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {recordImages.map((img, idx) => (
                  <Image key={idx} src={img} alt={`作业${idx + 1}`} className="rounded-lg object-cover border border-gray-200" />
                ))}
              </div>
            </Image.PreviewGroup>
          ) : (
            <div className="text-center text-gray-400 py-10">暂无作业图片</div>
          )}
          <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
            <Button className="rounded-full" onClick={handleClose}>关闭</Button>
          </div>
        </div>
      ) : isSubmitMode ? (
        <div className="space-y-4">
          {renderQuestions()}
          <HomeworkImageField
            images={uploadedImages}
            fileList={fileList}
            studentId={studentId}
            assignmentTitle={record.title}
            subject={record.subject}
            learningRecordId={record.id}
            onImagesChange={(nextImages, nextFiles) => {
              setUploadedImages(nextImages);
              setFileList(nextFiles);
            }}
          />
          <div>
            <div className="font-semibold text-sm mb-2">课堂反馈</div>
            <Input.TextArea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="可填写课堂表现或说明" />
          </div>
          <div className="flex gap-3 pt-3 border-t border-gray-100">
            <Button type="primary" className="rounded-full" onClick={handleSubmit} loading={loading}>📤 提交作业</Button>
            <Button className="rounded-full" onClick={handleClose}>取消</Button>
          </div>
        </div>
      ) : isGradeMode ? (
        <div className="space-y-4">
          {renderQuestions()}
          {recordImages.length > 0 && (
            <div>
              <div className="font-semibold text-sm mb-2">作业图片</div>
              <Image.PreviewGroup>
                <div className="flex flex-wrap gap-2">
                  {recordImages.map((img, idx) => (
                    <Image key={idx} src={img} width={96} height={72} className="rounded-lg object-cover" />
                  ))}
                </div>
              </Image.PreviewGroup>
            </div>
          )}
          <div>
            <div className="font-semibold text-sm mb-2">得分</div>
            <InputNumber min={0} max={record.totalScore || 100} value={score} onChange={(value) => setScore(Number(value || 0))} addonAfter={` / ${record.totalScore || 100}`} />
          </div>
          <div>
            <div className="font-semibold text-sm mb-2">评语</div>
            <Input.TextArea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="请填写批改评语" />
          </div>
          <div className="flex gap-3 pt-3 border-t border-gray-100">
            <Button type="primary" className="rounded-full" onClick={handleGrade} loading={loading}>确认批改</Button>
            <Button className="rounded-full" onClick={handleClose}>取消</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {renderQuestions()}
          <div className="flex justify-end pt-3 border-t border-gray-100">
            <Button className="rounded-full" onClick={handleClose}>关闭</Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
