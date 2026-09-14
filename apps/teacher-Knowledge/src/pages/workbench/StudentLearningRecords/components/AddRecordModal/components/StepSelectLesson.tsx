// components/StepSelectLesson.tsx
import React from 'react';
import { Select, Input, Upload, Button, message, Empty } from 'antd';
import { DeleteOutlined, FileOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import type { StepSelectLessonProps } from '../types';

export const StepSelectLesson: React.FC<StepSelectLessonProps> = ({
  formData,
  onChange,
  lessonPlans,
}) => {
  const uploadProps: UploadProps = {
    beforeUpload: () => false,
    multiple: true,
    showUploadList: false,
    onChange: ({ fileList }) => {
      onChange({ uploadedFiles: fileList });
    },
  };

  const removeFile = (index: number) => {
    const newFiles = [...formData.uploadedFiles];
    newFiles.splice(index, 1);
    onChange({ uploadedFiles: newFiles });
  };

  return (
    <div className="space-y-5">
      {/* 选择已有教案 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">📚 选择已有教案</span>
          <span className="text-xs text-gray-400">（可选）</span>
        </div>
        <Select
            className='w-full'
            placeholder="搜索或选择已有教案..."
            value={formData.selectedLessonPlan || undefined}
            onChange={(value) => onChange({ selectedLessonPlan: value, documentTitle: '' })}
            options={lessonPlans.map(p => ({
                label: (
                <div className="flex items-center justify-between py-0.5">
                    <span className="font-medium">{p.title}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {p.subject}
                    </span>
                </div>
                ),
                value: p.id,
            }))}
            showSearch
            optionFilterProp="label"
        />
      </div>

      {/* 或 分隔线 */}
      <div className="relative flex items-center">
        <div className="flex-1 border-t border-gray-200" />
        <span className="px-4 text-xs text-gray-400 bg-white">或</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      {/* 上传新文档 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">📤 上传新文档</span>
          <span className="text-xs text-red-400">*</span>
        </div>

        <Upload {...uploadProps}>
          <div className={`
            relative border-2 border-dashed rounded-2xl p-8 text-center
            transition-all duration-200 cursor-pointer
            ${formData.uploadedFiles.length > 0 
              ? 'border-blue-400 bg-blue-50/30' 
              : 'border-gray-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/20'
            }
          `}>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-3xl shadow-sm">
                📄
              </div>
              <div className="mt-3 font-medium text-gray-700">
                {formData.uploadedFiles.length > 0 
                  ? `已上传 ${formData.uploadedFiles.length} 个文件` 
                  : '点击上传或拖拽文档到这里'
                }
              </div>
              <div className="text-sm text-gray-400">
                支持 PDF / Word / PPT / 图片
              </div>
              {formData.uploadedFiles.length === 0 && (
                <div className="mt-2 px-4 py-1 text-xs text-blue-500 bg-blue-50 rounded-full">
                  📎 点击选择文件
                </div>
              )}
            </div>
          </div>
        </Upload>

        {/* 已上传文件列表 */}
        {formData.uploadedFiles.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {formData.uploadedFiles.map((file, index) => {
              const isImage = file.type?.startsWith('image/');
              const isPdf = file.type === 'application/pdf';
              const isWord = file.type?.includes('word') || file.name?.endsWith('.docx') || file.name?.endsWith('.doc');
              const isPpt = file.type?.includes('presentation') || file.name?.endsWith('.pptx') || file.name?.endsWith('.ppt');
              
              let icon = '📄';
              let color = 'border-blue-200 bg-blue-50';
              if (isImage) { icon = '🖼️'; color = 'border-green-200 bg-green-50'; }
              else if (isPdf) { icon = '📕'; color = 'border-red-200 bg-red-50'; }
              else if (isWord) { icon = '📝'; color = 'border-blue-200 bg-blue-50'; }
              else if (isPpt) { icon = '📊'; color = 'border-orange-200 bg-orange-50'; }

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

      {/* 文档标题 */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">📌 文档标题</span>
          <span className="text-xs text-red-400">*</span>
          {formData.selectedLessonPlan && (
            <span className="text-xs text-gray-400">（已选择教案，自动填充）</span>
          )}
        </div>
        <Input
          placeholder="请输入文档标题..."
          value={formData.documentTitle}
          onChange={(e) => onChange({ documentTitle: e.target.value })}
          disabled={!!formData.selectedLessonPlan}
          className="h-11 rounded-xl border-gray-200 shadow-sm focus:border-blue-400 focus:shadow-blue-50"
          prefix={<span className="text-gray-300">📌</span>}
        />
        <div className="mt-1 text-xs text-gray-400">
          {formData.selectedLessonPlan 
            ? '💡 标题将自动使用所选教案名称' 
            : '💡 建议使用有意义的标题，方便后续查找'
          }
        </div>
      </div>
    </div>
  );
};

export default StepSelectLesson;