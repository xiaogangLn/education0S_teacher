import React, { useCallback, useRef } from 'react';
import { Button, Image, Upload, message } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { QrUploadModal, useQrUploadTicket } from '@/features/qrUpload';
import type { QrTicketView } from '@/features/qrUpload';

const MAX_IMAGES = 5;

type Props = {
  images: string[];
  fileList: UploadFile[];
  studentId?: string;
  assignmentTitle: string;
  subject?: string;
  learningRecordId: string;
  onImagesChange: (images: string[], fileList: UploadFile[]) => void;
};

async function readFilesAsDataUrls(files: UploadFile[]) {
  return Promise.all(
    files.map(
      (file) =>
        new Promise<string>((resolve) => {
          if (file.url || file.thumbUrl) {
            resolve(file.url || file.thumbUrl || '');
            return;
          }
          const raw = file.originFileObj;
          if (!raw) {
            resolve('');
            return;
          }
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => resolve('');
          reader.readAsDataURL(raw);
        }),
    ),
  );
}

export const HomeworkImageField: React.FC<Props> = ({
  images,
  fileList,
  studentId,
  assignmentTitle,
  subject,
  learningRecordId,
  onImagesChange,
}) => {
  const imagesRef = useRef(images);
  imagesRef.current = images;
  const fileListRef = useRef(fileList);
  fileListRef.current = fileList;
  const onImagesChangeRef = useRef(onImagesChange);
  onImagesChangeRef.current = onImagesChange;

  const handleDone = useCallback((ticket: QrTicketView) => {
    const incoming = (ticket.images || []).filter(Boolean);
    if (!incoming.length) {
      message.success('手机已上传，但没有收到图片');
      return;
    }
    const merged = [...imagesRef.current, ...incoming].slice(0, MAX_IMAGES);
    onImagesChangeRef.current(merged, fileListRef.current);
    message.success(`已从手机收到 ${incoming.length} 张照片`);
  }, []);

  const ticket = useQrUploadTicket({ onDone: handleDone });

  const handleUploadChange: UploadProps['onChange'] = async ({ fileList: next }) => {
    const urls = (await readFilesAsDataUrls(next)).filter(Boolean);
    onImagesChange(urls, next);
  };

  const handleRemove = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index), fileList.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="font-semibold text-sm">
          📸 作业图片 <span className="text-red-500">*</span>
        </div>
        <Button
          size="small"
          icon={<QrcodeOutlined />}
          loading={ticket.creating}
          onClick={() =>
            ticket.create({
              purpose: 'homework',
              student_id: studentId,
              subject,
              assignment_title: assignmentTitle,
              learning_record_id: learningRecordId,
            })
          }
        >
          扫码上传
        </Button>
      </div>
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <div className="flex flex-wrap gap-3">
          {images.map((img, idx) => (
            <div key={`${img.slice(0, 24)}-${idx}`} className="relative group">
              <Image src={img} alt={`作业${idx + 1}`} width={100} height={75} className="rounded-lg object-cover border border-gray-200" preview={{ mask: '预览' }} />
              <button
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100"
                onClick={() => handleRemove(idx)}
              >
                ×
              </button>
            </div>
          ))}
          {images.length < MAX_IMAGES && (
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false}
              multiple
              showUploadList={false}
              className="[&_.ant-upload]:!m-0 [&_.ant-upload-select]:!h-[148px] [&_.ant-upload-select]:!w-[196px] [&_.ant-upload-select]:!rounded-xl [&_.ant-upload-select]:!border-dashed"
            >
              <div className="flex h-full w-full flex-col items-center justify-center">
                <div className="text-4xl leading-none">📷</div>
                <div className="mt-2 text-sm text-gray-500">点击上传</div>
              </div>
            </Upload>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-2">共 {images.length} 张 · 支持 JPG/PNG · 最多 {MAX_IMAGES} 张 · 可用手机扫码上传</div>
      </div>
      <QrUploadModal open={ticket.open} qrUrl={ticket.qrUrl} ticket={ticket.ticket} onClose={ticket.close} />
    </div>
  );
};
