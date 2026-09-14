import React, { useCallback, useEffect, useState } from 'react';
import { Button, Result, Spin, message } from 'antd';
import { useParams } from 'react-router-dom';
import { fileToDataUrl } from '@/utils/compressImage';
import { readQrTicket, submitQrTicket, type QrTicketView } from '@/features/qrUpload';
import PhotoPicker from './components/PhotoPicker';

const GradeUploadPage: React.FC = () => {
  const { token = '' } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState<QrTicketView | null>(null);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const load = useCallback(async () => {
    if (!token) {
      setError('二维码无效');
      setLoading(false);
      return;
    }
    try {
      setTicket(await readQrTicket(token));
      setError('');
    } catch (err: any) {
      setError(err?.message || '二维码无效或已过期');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const homework = ticket?.purpose === 'homework';
  const maxCount = ticket?.max_images || (homework ? 5 : 6);

  const handleSubmit = async () => {
    if (!files.length) {
      message.error('请先拍摄作业照片');
      return;
    }
    setSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (const file of files) {
        imageUrls.push(await fileToDataUrl(file));
      }
      const result = await submitQrTicket(token, imageUrls);
      if (result?.subject_mismatch || String(result?.ai_feedback || result?.message || '').includes('学科不对应')) {
        message.error('无法识别，学科不对应');
      } else {
        message.success(homework ? '已传到电脑，请回到电脑提交作业' : '已提交批改');
      }
      await load();
      setFiles([]);
    } catch (err: any) {
      message.error(err?.message || '提交失败');
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F4F9]">
        <Spin />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F0F4F9] p-6">
        <Result status="warning" title="无法上传" subTitle={error || '二维码无效或已过期'} />
      </div>
    );
  }

  const locked = ticket.status !== 'pending';

  return (
    <div className="min-h-screen bg-[#F0F4F9] px-4 py-6">
      <div className="mx-auto max-w-md space-y-4">
        <div>
          <h1 className="text-xl font-bold">{homework ? '上传作业照片' : '拍照批改'}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {ticket.student_name || '未指定学生'} · {ticket.subject} · {ticket.assignment_title}
          </p>
        </div>
        {locked ? (
          <Result
            status={ticket.status === 'failed' ? 'error' : 'success'}
            title={ticket.status === 'failed' ? ticket.message || '上传失败' : homework ? '已传到电脑' : '已提交'}
            subTitle={
              ticket.status === 'grading'
                ? '正在识别，请回到电脑查看批改记录'
                : homework
                  ? '请回到电脑确认并提交作业'
                  : '可关闭此页'
            }
          />
        ) : (
          <>
            <PhotoPicker files={files} maxCount={maxCount} onChange={setFiles} />
            <Button type="primary" block size="large" loading={submitting} onClick={handleSubmit}>
              {submitting ? (homework ? '上传中…' : '识别中…') : homework ? '上传到电脑' : '提交批改'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default GradeUploadPage;
