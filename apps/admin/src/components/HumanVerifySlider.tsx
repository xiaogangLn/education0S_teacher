import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Spin } from 'antd';
import { CheckCircleFilled, ReloadOutlined } from '@ant-design/icons';
import { authService } from '@api/index';

interface ChallengeView {
  challenge_id: string;
  background_base64: string;
  piece_base64: string;
  piece_y: number;
  canvas_width: number;
  canvas_height: number;
  piece_size: number;
}

interface HumanVerifySliderProps {
  value?: string;
  onChange?: (humanToken: string) => void;
  disabled?: boolean;
}

function extractPayload<T = any>(response: any): T {
  return (response?.data ?? response) as T;
}

/**
 * 能力：Admin 登录用拼图滑块人机验证。
 * 输入：受控 value/onChange。
 * 输出：human_token。
 */
export const HumanVerifySlider: React.FC<HumanVerifySliderProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const [challenge, setChallenge] = useState<ChallengeView | null>(null);
  const [loading, setLoading] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [hint, setHint] = useState('拖动滑块完成拼图验证');
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);

  const maxOffset = Math.max(
    0,
    (challenge?.canvas_width || 300) - (challenge?.piece_size || 42),
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setStatus('idle');
    setOffsetX(0);
    setHint('拖动滑块完成拼图验证');
    onChange?.('');
    try {
      const res = await authService.getHumanChallenge();
      const payload = extractPayload<ChallengeView>(res);
      setChallenge({
        challenge_id: payload?.challenge_id || '',
        background_base64: payload?.background_base64 || '',
        piece_base64: payload?.piece_base64 || '',
        piece_y: payload?.piece_y ?? 40,
        canvas_width: payload?.canvas_width || 300,
        canvas_height: payload?.canvas_height || 150,
        piece_size: payload?.piece_size || 42,
      });
    } catch {
      setChallenge(null);
      setHint('人机挑战加载失败，请点击刷新');
    } finally {
      setLoading(false);
    }
  }, [onChange]);

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitVerify = useCallback(
    async (x: number) => {
      if (!challenge?.challenge_id) return;
      setLoading(true);
      try {
        const res = await authService.verifyHuman({
          challenge_id: challenge.challenge_id,
          offset_x: Math.round(x),
        });
        const payload = extractPayload<{ human_token: string }>(res);
        const token = payload?.human_token || '';
        if (!token) throw new Error('未返回人机令牌');
        setStatus('ok');
        setHint('验证通过');
        onChange?.(token);
      } catch (error: any) {
        setStatus('fail');
        setHint(error?.message || '验证失败，请重试');
        onChange?.('');
        setTimeout(() => void refresh(), 600);
      } finally {
        setLoading(false);
      }
    },
    [challenge, onChange, refresh],
  );

  const onPointerDown = (clientX: number) => {
    if (disabled || loading || status === 'ok' || !challenge) return;
    setDragging(true);
    startXRef.current = clientX;
    startOffsetRef.current = offsetX;
  };

  const onPointerMove = (clientX: number) => {
    if (!dragging) return;
    const next = Math.min(
      maxOffset,
      Math.max(0, startOffsetRef.current + (clientX - startXRef.current)),
    );
    setOffsetX(next);
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    void submitVerify(offsetX);
  };

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => onPointerMove(e.clientX);
    const up = () => onPointerUp();
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging, offsetX, maxOffset]);

  const verified = Boolean(value) && status === 'ok';

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm text-gray-600">{hint}</span>
        <button
          type="button"
          className="text-xs text-blue-500 hover:text-blue-600 inline-flex items-center gap-1"
          onClick={() => void refresh()}
          disabled={disabled || loading}
        >
          <ReloadOutlined /> 刷新
        </button>
      </div>

      <div
        className="relative overflow-hidden rounded-lg border border-gray-200 bg-slate-50 select-none"
        style={{
          width: '100%',
          maxWidth: challenge?.canvas_width || 300,
          height: challenge?.canvas_height || 150,
        }}
      >
        {loading && !challenge ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spin size="small" />
          </div>
        ) : null}
        {challenge?.background_base64 ? (
          <img
            src={challenge.background_base64}
            alt="人机验证背景"
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        ) : null}
        {challenge?.piece_base64 ? (
          <img
            src={challenge.piece_base64}
            alt="拼图块"
            className="absolute z-10 cursor-grab active:cursor-grabbing"
            style={{
              left: offsetX,
              top: challenge.piece_y,
              width: challenge.piece_size,
              height: challenge.piece_size,
              touchAction: 'none',
            }}
            draggable={false}
            onPointerDown={(e) => {
              e.preventDefault();
              onPointerDown(e.clientX);
            }}
          />
        ) : null}
        {verified ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-emerald-500/15">
            <CheckCircleFilled className="text-3xl text-emerald-500" />
          </div>
        ) : null}
      </div>

      <div
        className={`mt-2 h-10 rounded-full border relative overflow-hidden ${
          verified
            ? 'border-emerald-300 bg-emerald-50'
            : status === 'fail'
              ? 'border-red-300 bg-red-50'
              : 'border-gray-200 bg-gray-50'
        }`}
        style={{ maxWidth: challenge?.canvas_width || 300 }}
      >
        <div
          className={`absolute left-0 top-0 h-full ${verified ? 'bg-emerald-200/70' : 'bg-blue-100'}`}
          style={{ width: `${maxOffset ? (offsetX / maxOffset) * 100 : 0}%` }}
        />
        <div
          className={`absolute top-0.5 h-9 w-9 rounded-full bg-white shadow border flex items-center justify-center text-sm cursor-grab active:cursor-grabbing ${
            verified ? 'border-emerald-400 text-emerald-500' : 'border-blue-300 text-blue-500'
          }`}
          style={{ left: Math.min(offsetX, maxOffset) }}
          onPointerDown={(e) => {
            e.preventDefault();
            onPointerDown(e.clientX);
          }}
        >
          {verified ? '✓' : '≫'}
        </div>
        <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 pointer-events-none">
          {verified ? '人机验证通过' : '按住滑块拖动完成验证'}
        </span>
      </div>
    </div>
  );
};
