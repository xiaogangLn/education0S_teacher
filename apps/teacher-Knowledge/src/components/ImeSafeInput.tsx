import React, { useEffect, useRef, useState } from 'react';
import { Input } from 'antd';
import type { InputProps, InputRef } from 'antd';

export type ImeSafeInputProps = Omit<InputProps, 'value' | 'defaultValue' | 'onChange'> & {
  /** 仅在 resetKey 变化时写入；输入过程非受控，避免中文输入法首字母被卡住 */
  initialValue?: string;
  /** 外部重置信号（打开抽屉、切换分类、清空等），变化时 remount */
  resetKey?: string | number;
  onValueChange?: (value: string) => void;
  /** 进入 IME 组合时回调（用于取消首字母误触发的防抖搜索） */
  onImeStart?: () => void;
};

function eventIsComposing(
  e: React.ChangeEvent<HTMLInputElement> | React.CompositionEvent<HTMLInputElement>,
) {
  return Boolean((e.nativeEvent as InputEvent).isComposing);
}

/**
 * 对中文等 IME 友好的搜索输入：
 * - 输入过程非受控，避免受控 value 回写打断拼音组合
 * - 兼容「首字母 onChange 早于 compositionStart」的浏览器竞态
 */
export const ImeSafeInput: React.FC<ImeSafeInputProps> = ({
  initialValue = '',
  resetKey = '',
  onValueChange,
  onImeStart,
  onPressEnter,
  ...rest
}) => {
  const inputRef = useRef<InputRef>(null);
  const composingRef = useRef(false);
  const confirmedRef = useRef(initialValue);
  const prevResetKeyRef = useRef<string | number | null>(null);
  const [mountKey, setMountKey] = useState(0);
  const [seed, setSeed] = useState(initialValue);

  useEffect(() => {
    if (prevResetKeyRef.current === null) {
      prevResetKeyRef.current = resetKey;
      confirmedRef.current = initialValue;
      setSeed(initialValue);
      return;
    }
    if (prevResetKeyRef.current === resetKey) return;
    prevResetKeyRef.current = resetKey;
    composingRef.current = false;
    confirmedRef.current = initialValue;
    setSeed(initialValue);
    setMountKey((k) => k + 1);
  }, [resetKey, initialValue]);

  const emit = (value: string) => {
    onValueChange?.(value);
  };

  return (
    <Input
      {...rest}
      key={mountKey}
      ref={inputRef}
      defaultValue={seed}
      onChange={(e) => {
        const value = e.target.value;
        if (composingRef.current || eventIsComposing(e)) {
          return;
        }
        // 先对外同步；若紧接着进入 IME，再在 compositionStart / microtask 里回退
        emit(value);
        queueMicrotask(() => {
          if (composingRef.current) {
            emit(confirmedRef.current);
            return;
          }
          confirmedRef.current = value;
        });
      }}
      onCompositionStart={() => {
        composingRef.current = true;
        onImeStart?.();
        emit(confirmedRef.current);
      }}
      onCompositionEnd={(e) => {
        composingRef.current = false;
        const value = (e.target as HTMLInputElement).value;
        confirmedRef.current = value;
        emit(value);
      }}
      onPressEnter={(e) => {
        if (composingRef.current || (e.nativeEvent as KeyboardEvent).isComposing) {
          return;
        }
        onPressEnter?.(e);
      }}
    />
  );
};
