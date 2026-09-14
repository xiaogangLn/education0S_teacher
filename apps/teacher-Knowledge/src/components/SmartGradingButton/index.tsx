// ============================================================
// 文件: components/SmartGradingButton/index.tsx
// 智能批改按钮 - 修复悬停下边框断裂问题
// ============================================================

import React, { useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { LoadingOutlined } from '@ant-design/icons';

// ============================================================
// 类型定义
// ============================================================

export interface SmartGradingButtonProps {
  /** 点击回调函数 */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  /** 按钮文本 */
  text?: string;
  /** 是否显示 AI 徽章 */
  showBadge?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 按钮尺寸 */
  size?: 'sm' | 'md' | 'lg' | 'auto';
  /** 图标 */
  icon?: React.ReactNode;
  /** 徽章文本 */
  badgeText?: string;
  /** 是否启用波纹效果 */
  ripple?: boolean;
  /** 自适应高度 */
  height?: string | number;
  /** 自适应内边距 */
  padding?: string;
  /** 自适应字体大小 */
  fontSize?: string | number;
  /** 自适应图标大小 */
  iconSize?: string | number;
  /** 是否占满父容器宽度 */
  fullWidth?: boolean;
}

// ============================================================
// 组件实现
// ============================================================

const SmartGradingButton: React.FC<SmartGradingButtonProps> = ({
  onClick,
  text = '智能批改',
  showBadge = true,
  loading = false,
  disabled = false,
  className,
  size = 'md',
  icon = '🤖',
  badgeText = 'AI',
  ripple = true,
  height,
  padding,
  fontSize,
  iconSize,
  fullWidth = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // ============================================================
  // 尺寸映射
  // ============================================================
  const sizeClasses = useMemo(() => {
    const map = {
      sm: {
        button: 'px-4 py-1.5 text-xs gap-1.5',
        icon: 'text-base',
        badge: 'text-[9px] px-1.5 py-0 -top-1.5 -right-1.5 min-w-[16px] h-[16px]',
      },
      md: {
        button: 'px-5 py-2 text-sm gap-2',
        icon: 'text-lg',
        badge: 'text-[10px] px-2 py-0 -top-2 -right-2 min-w-[20px] h-[20px]',
      },
      lg: {
        button: 'px-8 py-3 text-base gap-3',
        icon: 'text-2xl',
        badge: 'text-[11px] px-2.5 py-0.5 -top-2.5 -right-2.5 min-w-[24px] h-[24px]',
      },
      auto: {
        button: '',
        icon: '',
        badge: 'text-[10px] px-2 py-0 -top-2 -right-2 min-w-[20px] h-[20px]',
      },
    };
    return map[size] || map.md;
  }, [size]);

  // ============================================================
  // 计算样式
  // ============================================================
  const computedStyle = useMemo<React.CSSProperties>(() => {
    const style: React.CSSProperties = {};

    if (fullWidth) {
      style.width = '100%';
    }

    if (size === 'auto') {
      if (height !== undefined) {
        style.height = typeof height === 'number' ? `${height}px` : height;
      }
      if (padding !== undefined) {
        style.padding = padding;
      }
      if (fontSize !== undefined) {
        style.fontSize = typeof fontSize === 'number' ? `${fontSize}px` : fontSize;
      }
    }

    return style;
  }, [size, height, padding, fontSize, fullWidth]);

  // ============================================================
  // 图标样式
  // ============================================================
  const iconStyle = useMemo<React.CSSProperties>(() => {
    if (size === 'auto' && iconSize !== undefined) {
      return {
        fontSize: typeof iconSize === 'number' ? `${iconSize}px` : iconSize,
      };
    }
    return {};
  }, [size, iconSize]);

  // ============================================================
  // 处理点击
  // ============================================================
  const handleClick = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;
      try {
        await onClick?.(event);
      } catch (error) {
        console.error('[SmartGradingButton] 点击失败:', error);
      }
    },
    [disabled, loading, onClick]
  );

  // ============================================================
  // 按钮基础类名
  // ============================================================
  const buttonClasses = classNames(
    // 布局
    'relative inline-flex items-center justify-center',
    'border-none rounded-full',
    'transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
    
    // 渐变背景
    'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400',
    'bg-[length:200%_200%]',
    'animate-gradient-shift',
    
    // 文字
    'font-bold text-white whitespace-nowrap',
    
    // 阴影 - 修复下边框问题
    // 使用多个 box-shadow 确保底部完整
    'shadow-[0_4px_16px_rgba(99,102,241,0.35)]',
    'hover:shadow-[0_6px_24px_rgba(99,102,241,0.45),0_2px_8px_rgba(139,92,246,0.2)]',
    
    // 尺寸
    sizeClasses.button,
    
    // 宽度
    {
      'w-full': fullWidth,
    },
    
    // 状态
    {
      'opacity-50 cursor-not-allowed hover:scale-100 hover:-translate-y-0': disabled,
      'cursor-wait': loading,
    },
    
    className
  );

  // ============================================================
  // ⚠️ 关键修复: 使用伪元素实现发光边框
  // 避免 hover 时底部边框断裂
  // ============================================================
  const borderClasses = classNames(
    // 伪元素基础
    'absolute -inset-[3px] rounded-[64px]',
    'pointer-events-none',
    // 渐变边框
    'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400',
    'bg-[length:300%_300%]',
    'animate-border-rotate',
    // 默认透明，hover 时显示
    'opacity-0',
    'transition-opacity duration-300',
    {
      'opacity-100': isHovered && !disabled && !loading,
    }
  );

  // ============================================================
  // ⚠️ 关键修复: 内部遮罩层 - 确保边框不被裁剪
  // ============================================================
  const maskClasses = classNames(
    'absolute inset-[3px] rounded-[60px]',
    'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400',
    'pointer-events-none'
  );

  // ============================================================
  // 文本类名
  // ============================================================
  const textClasses = classNames(
    'relative z-10',
    {
      'truncate': true,
    }
  );

  // ============================================================
  // 徽章类名
  // ============================================================
  const badgeClasses = classNames(
    'absolute',
    'flex items-center justify-center',
    'font-bold text-white',
    'bg-red-500 rounded-full',
    'shadow-md shadow-red-500/40',
    'animate-pulse-badge',
    'z-20',
    sizeClasses.badge
  );

  // ============================================================
  // 渲染
  // ============================================================
  return (
    <div 
      className={classNames('relative inline-block', {
        'w-full': fullWidth,
      })}
      style={fullWidth ? { width: '100%' } : undefined}
    >
      {/* 
        ============================================================
        ⚠️ 修复方案: 使用两层结构
        外层：渐变边框（伪元素）
        内层：按钮主体（带遮罩）
        这样边框不会被裁剪，底部完整显示
        ============================================================
      */}
      
      {/* 外层 - 渐变边框容器 */}
      <div
        className={classNames(
          'absolute -inset-[3px] rounded-[64px]',
          'pointer-events-none',
          'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400',
          'bg-[length:300%_300%]',
          'animate-border-rotate',
          'opacity-0',
          'transition-opacity duration-300',
          {
            'opacity-100': isHovered && !disabled && !loading,
          }
        )}
        style={{
          // 防止边框被裁剪
          willChange: 'transform, opacity',
        }}
      />

      {/* 按钮主体 */}
      <button
        className={buttonClasses}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        disabled={disabled || loading}
        type="button"
        style={{
          backgroundSize: '200% 200%',
          ...computedStyle,
          // 确保按钮在边框之上
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* 按钮内部渐变遮罩（保持背景一致性） */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'linear-gradient(to right, #6366f1, #8b5cf6, #ec4899)',
            backgroundSize: '200% 200%',
            animation: 'gradientShift 3s ease-in-out infinite',
            opacity: 0.95,
          }}
        />

        {/* 内容 - 在遮罩之上 */}
        <div className="relative z-10 flex items-center justify-center gap-2">
          {/* 图标 */}
          <span 
            className={classNames('leading-none flex-shrink-0', sizeClasses.icon)}
            style={iconStyle}
          >
            {loading ? (
              <LoadingOutlined className="animate-spin" />
            ) : (
              icon
            )}
          </span>

          {/* 文字 */}
          <span className={textClasses}>
            {loading ? '处理中...' : text}
          </span>
        </div>

        {/* AI 徽章 */}
        {showBadge && !loading && (
          <span className={badgeClasses}>
            {badgeText}
          </span>
        )}
      </button>

      {/* 波纹效果 */}
      {ripple && isHovered && !disabled && !loading && (
        <span 
          className="absolute inset-0 rounded-full animate-ping bg-indigo-500/20 pointer-events-none"
          style={computedStyle}
        />
      )}
    </div>
  );
};

export default SmartGradingButton;