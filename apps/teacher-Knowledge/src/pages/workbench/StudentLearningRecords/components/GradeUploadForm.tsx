// components/GradeUploadModal.tsx
import React, { useState } from 'react';
import { Modal, Input, Select, Button, DatePicker, Upload, message, Image } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';

interface GradeUploadModalProps {
  open: boolean;
  loading?: boolean;
  formData: {
    name: string;
    score: string;
    subject: string;
    date: string;
    images: string[];
  };
  onFormChange: (data: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const GradeUploadModal: React.FC<GradeUploadModalProps> = ({
  open,
  loading = false,
  formData,
  onFormChange,
  onSubmit,
  onCancel,
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const subjectOptions = ['数学', '语文', '英语', '物理', '化学', '生物', '历史', '地理', '政治'];

  // 处理图片上传
  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    // 将上传的图片URL添加到formData
    const imageUrls = newFileList
      .filter(file => file.status === 'done' || file.url)
      .map(file => file.url || file.thumbUrl || '');
    if (imageUrls.length > 0) {
      onFormChange({ ...formData, images: [...formData.images, ...imageUrls] });
    }
  };

  // 删除图片
  const handleRemoveImage = (index: number) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    onFormChange({ ...formData, images: newImages });
  };

  const uploadButton = (
    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors cursor-pointer bg-gray-50">
      <PlusOutlined className="text-2xl text-gray-400" />
      <div className="text-xs text-gray-400 mt-1">上传图片</div>
    </div>
  );

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      message.warning('请输入测验名称');
      return;
    }
    if (!formData.score.trim()) {
      message.warning('请输入成绩');
      return;
    }
    onSubmit();
  };

  return (
    <Modal
      title="📤 上传成绩"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="保存成绩"
      cancelText="取消"
      confirmLoading={loading}
      width={680}
      className="grade-upload-modal"
    >
      <div className="py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              📝 测验名称 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="如：期中考试、单元测验..."
              value={formData.name}
              onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              📊 成绩 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="如：85/100"
              value={formData.score}
              onChange={(e) => onFormChange({ ...formData, score: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">📅 测验日期</label>
            <DatePicker
              className="w-full"
              value={formData.date ? dayjs(formData.date) : null}
              onChange={(date) => onFormChange({ ...formData, date: date?.format('YYYY-MM-DD') || '' })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">📚 科目</label>
            <Select
              className="w-full"
              value={formData.subject}
              onChange={(value) => onFormChange({ ...formData, subject: value })}
              options={subjectOptions.map(s => ({ label: s, value: s }))}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 block mb-2">📸 上传试卷图片</label>
          
          <div className="flex flex-wrap gap-3">
            {/* 已上传的图片 */}
            {formData.images.map((img, idx) => (
              <div key={idx} className="relative group">
                <Image
                  src={img}
                  alt={`试卷${idx + 1}`}
                  width={100}
                  height={75}
                  className="rounded-lg object-cover border border-gray-200"
                  preview={{
                    mask: '预览',
                  }}
                />
                <button
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  onClick={() => handleRemoveImage(idx)}
                >
                  ×
                </button>
                <div className="text-[10px] text-gray-400 text-center mt-0.5">试卷{idx + 1}</div>
              </div>
            ))}
            
            {/* 上传按钮 */}
            {formData.images.length < 5 && (
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={() => false}
                multiple
                showUploadList={false}
                className="upload-trigger"
              >
                <div className="w-[100px] h-[75px] rounded-lg  transition-colors cursor-pointer flex flex-col items-center justify-center bg-gray-50">
                  <div className="text-2xl">📷</div>
                  <div className="text-[10px] text-gray-400">点击上传</div>
                </div>
              </Upload>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            共 {formData.images.length} 张图片 · 支持 JPG/PNG · 最多 5 张 · 点击图片可预览
          </div>
        </div>
      </div>
    </Modal>
  );
};