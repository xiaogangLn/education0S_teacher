import { useEffect, useState } from 'react';
import { Button, Result, Spin } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@api/index';
import { extractPayload } from '@/utils/knowledgeMapper';

/**
 * 能力：处理邮箱确认链接落地页。
 * 输入：URL ?token=。
 * 输出：确认成功/失败结果，引导登录。
 */
const ConfirmEmailPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ok, setOk] = useState(false);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    const token = params.get('token') || '';
    let cancelled = false;
    (async () => {
      if (!token) {
        setOk(false);
        setMessageText('确认链接无效');
        setLoading(false);
        return;
      }
      try {
        const res = await authService.confirmEmail(token);
        const payload = extractPayload<{ success?: boolean; message?: string }>(res) || (res as any);
        if (!cancelled) {
          setOk(Boolean(payload?.success ?? true));
          setMessageText(payload?.message || '邮箱确认成功，请登录');
        }
      } catch (error: any) {
        if (!cancelled) {
          setOk(false);
          setMessageText(error?.message || '确认失败，链接可能已过期');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spin size="large" tip="正在确认邮箱..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Result
        status={ok ? 'success' : 'error'}
        title={ok ? '邮箱确认成功' : '确认失败'}
        subTitle={messageText}
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            前往登录
          </Button>
        }
      />
    </div>
  );
};

export default ConfirmEmailPage;
