import React, { useEffect, useMemo } from 'react';

type Props = {
  files: File[];
  maxCount?: number;
  onChange: (files: File[]) => void;
};

const PhotoPicker: React.FC<Props> = ({ files, maxCount = 6, onChange }) => {
  const remain = Math.max(0, maxCount - files.length);
  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => () => {
    previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  return (
    <div className="space-y-3">
      <label className="flex min-h-[168px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-indigo-200 bg-white text-gray-500">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={(event) => {
            const next = Array.from(event.target.files || []);
            onChange([...files, ...next].slice(0, maxCount));
            event.currentTarget.value = '';
          }}
        />
        <span className="text-3xl">📷</span>
        <span className="mt-2 text-sm">点击拍照或从相册选择</span>
        <span className="mt-1 text-xs text-gray-400">最多 {maxCount} 张，还可选 {remain} 张</span>
      </label>
      {files.length ? (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((src, index) => (
            <button
              key={src}
              type="button"
              className="relative overflow-hidden rounded-xl bg-gray-100"
              onClick={() => onChange(files.filter((_, i) => i !== index))}
            >
              <img src={src} alt="" className="h-24 w-full object-cover" />
              <span className="absolute right-1 top-1 rounded bg-black/60 px-1 text-[10px] text-white">删除</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default PhotoPicker;
