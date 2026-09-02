import React from 'react';
import { Button, Tag, Space } from 'antd';
import { EditOutlined, ShareAltOutlined } from '@ant-design/icons';
import type { TeacherProfile } from '../types/teacher';

interface TeacherHeaderProps {
  profile: TeacherProfile;
}

export const TeacherHeader: React.FC<TeacherHeaderProps> = ({ profile }) => {
  return (
    <div className="flex items-center gap-5 flex-wrap p-3 bg-white rounded-xl border border-gray-100">
      <div className="w-[72px] h-[72px] rounded-full bg-indigo-600 text-white flex items-center justify-center text-[28px] font-semibold flex-shrink-0">
        {profile.avatar}
      </div>
      <div className="flex-1">
        <div className="text-[22px] font-bold text-gray-800">{profile.name}</div>
        <div className="text-sm text-gray-500 mt-0.5">{profile.title}</div>
        <div className="flex gap-1.5 flex-wrap mt-1.5">
          {profile.tags.map((tag, idx) => (
            <Tag key={idx} className="m-0 text-xs">
              {tag}
            </Tag>
          ))}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap ml-auto">
        <Button icon={<EditOutlined />} className="rounded-full">
          编辑资料
        </Button>
        <Button icon={<ShareAltOutlined />} className="rounded-full">
          分享
        </Button>
      </div>
    </div>
  );
};