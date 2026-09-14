// components/StepUploadExercise.tsx
import React from 'react';
import { Radio, Input, Upload, Button, Progress } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd/es/upload/interface';
import type { StepUploadExerciseProps } from '../types';

export const StepUploadExercise: React.FC<StepUploadExerciseProps> = ({
  formData,
  onChange,
  onAIGenerate,
  aiGenerating,
}) => {
  const uploadProps: UploadProps = {
    beforeUpload: () => false,
    multiple: true,
    showUploadList: false,
    onChange: ({ fileList }) => {
      onChange({ exerciseFiles: fileList });
    },
  };

  const removeFile = (index: number) => {
    const newFiles = [...formData.exerciseFiles];
    newFiles.splice(index, 1);
    onChange({ exerciseFiles: newFiles });
  };

  return (
    <div className="space-y-5">

      {/* 选择方式 - 更美观的卡片选择 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-gray-700">🎯 选择方式</span>
        </div>
        <Radio.Group
          value={formData.exerciseType}
          onChange={(e) => onChange({ exerciseType: e.target.value })}
          className="w-full"
        >
          <div className="grid grid-cols-2 gap-3">
            <Radio.Button
              value="upload"
              className={`!block !w-full !h-auto !p-4 !rounded-xl !border-2 transition-all duration-200 ${
                formData.exerciseType === 'upload'
                  ? '!border-blue-500 !bg-blue-50 !shadow-md !shadow-blue-100'
                  : '!border-gray-200 !bg-white hover:!border-blue-300'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                  formData.exerciseType === 'upload'
                    ? 'bg-blue-100'
                    : 'bg-gray-100'
                }`}>
                  📤
                </div>
                <div className={`font-medium text-sm mt-2 ${
                  formData.exerciseType === 'upload' ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  上传练习题
                </div>
                <div className="text-xs text-gray-400">PDF / Word / 图片</div>
              </div>
            </Radio.Button>

            <Radio.Button
              value="ai"
              className={`!block !w-full !h-auto !p-4 !rounded-xl !border-2 transition-all duration-200 ${
                formData.exerciseType === 'ai'
                  ? '!border-purple-500 !bg-purple-50 !shadow-md !shadow-purple-100'
                  : '!border-gray-200 !bg-white hover:!border-purple-300'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${
                  formData.exerciseType === 'ai'
                    ? 'bg-purple-100'
                    : 'bg-gray-100'
                }`}>
                  🤖
                </div>
                <div className={`font-medium text-sm mt-2 ${
                  formData.exerciseType === 'ai' ? 'text-purple-600' : 'text-gray-700'
                }`}>
                  AI 生成
                </div>
                <div className="text-xs text-gray-400">输入指令自动生成</div>
              </div>
            </Radio.Button>
          </div>
        </Radio.Group>
      </div>

      {/* ===== 上传练习题模式 ===== */}
      {formData.exerciseType === 'upload' && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">📤 上传练习题文件</span>
            <span className="text-xs text-red-400">*</span>
          </div>

          <Upload {...uploadProps}>
            <div className={`
              relative border-2 border-dashed rounded-2xl p-8 text-center
              transition-all duration-200 cursor-pointer
              ${formData.exerciseFiles.length > 0 
                ? 'border-blue-400 bg-blue-50/30' 
                : 'border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/20'
              }
            `}>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-3xl shadow-sm">
                  📝
                </div>
                <div className="mt-3 font-medium text-gray-700">
                  {formData.exerciseFiles.length > 0 
                    ? `已上传 ${formData.exerciseFiles.length} 个文件` 
                    : '点击上传练习题文件'
                  }
                </div>
                <div className="text-sm text-gray-400">
                  支持 PDF / Word / 图片 · 可上传多个
                </div>
                {formData.exerciseFiles.length === 0 && (
                  <div className="mt-2 px-4 py-1 text-xs text-blue-500 bg-blue-50 rounded-full">
                    📎 点击选择文件
                  </div>
                )}
              </div>
            </div>
          </Upload>

          {/* 已上传文件列表 */}
          {formData.exerciseFiles.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {formData.exerciseFiles.map((file, index) => {
                const isImage = file.type?.startsWith('image/');
                const isPdf = file.type === 'application/pdf';
                const isWord = file.type?.includes('word') || file.name?.endsWith('.docx') || file.name?.endsWith('.doc');
                
                let icon = '📄';
                let color = 'border-blue-200 bg-blue-50';
                if (isImage) { icon = '🖼️'; color = 'border-green-200 bg-green-50'; }
                else if (isPdf) { icon = '📕'; color = 'border-red-200 bg-red-50'; }
                else if (isWord) { icon = '📝'; color = 'border-blue-200 bg-blue-50'; }

                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${color} transition-all group hover:shadow-sm`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{icon}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                          {file.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {(file.size ? (file.size / 1024).toFixed(1) : 0)} KB
                        </div>
                      </div>
                    </div>
                    <button
                      className="w-7 h-7 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500 transition-all flex items-center justify-center"
                      onClick={() => removeFile(index)}
                    >
                      <DeleteOutlined className="text-sm" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== AI 生成模式 ===== */}
      {formData.exerciseType === 'ai' && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">🤖 输入生成指令</span>
            <span className="text-xs text-red-400">*</span>
          </div>

          <Input.TextArea
            rows={3}
            placeholder="例如：生成10道关于导数的练习题，包含基础题和拓展题..."
            value={formData.aiPrompt}
            onChange={(e) => onChange({ aiPrompt: e.target.value })}
            className="rounded-xl border-gray-200 shadow-sm focus:border-purple-400 focus:shadow-purple-50 !resize-none"
          />

          <div className="flex items-center gap-3 mt-3">
            <Button
              type="primary"
              className="rounded-xl px-6 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 border-none shadow-sm shadow-purple-200 hover:shadow-purple-300 transition-all"
              onClick={onAIGenerate}
              loading={aiGenerating}
              disabled={!formData.aiPrompt.trim()}
            >
              🚀 AI 生成
            </Button>
            {formData.aiPrompt.trim() && !aiGenerating && !formData.aiGeneratedContent && (
              <span className="text-xs text-gray-400">输入指令后点击生成</span>
            )}
          </div>

          {/* AI 生成进度 */}
          {aiGenerating && (
            <div className="mt-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">⏳ AI 正在生成...</span>
                <span className="font-medium text-purple-500">{formData.aiProgress}%</span>
              </div>
              <Progress 
                percent={formData.aiProgress} 
                size="small" 
                showInfo={false}
                strokeColor={{
                  from: '#8b5cf6',
                  to: '#4f46e5',
                }}
                className="mt-1"
              />
            </div>
          )}

          {/* AI 生成结果 */}
          {formData.aiGeneratedContent && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-600">✅ 生成结果</span>
                <button
                  className="text-xs text-gray-400 hover:text-gray-600"
                  onClick={() => onChange({ aiGeneratedContent: '' })}
                >
                  清除
                </button>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 max-h-48 overflow-y-auto font-mono text-sm whitespace-pre-wrap leading-relaxed">
                {formData.aiGeneratedContent}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StepUploadExercise;