import { Spin, Empty, Button } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { ScheduleTimeline } from './components/ScheduleTimeline';
import { useTeacherProfile } from './hook/useTeacherProfile';
import { StatsRow } from './components/StatsRow';
import { DimensionGrid } from './components/DimensionGrid';
import { Achievements } from './components/Achievements';
import { RadarChart } from './components/RadarChart';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import type { User } from '@/store/slices/userSlice';

function portraitRefreshHint(user?: User | null) {
  const policy = user?.tenant?.portraitRefreshPolicy;
  if (policy) return policy;
  const days = user?.tenant?.portraitRefreshIntervalDays;
  if (days == null) {
    const plan = user?.tenant?.planCode;
    if (plan === 'turbo') return '约每周更新 1 次（间隔 7 天）';
    if (plan === 'pro') return '约每月更新 1 次（间隔 30 天）';
    if (plan === 'basic') return '约每 2 个月更新 1 次（间隔 60 天）';
    return '约每天最多更新 1 次';
  }
  if (days >= 60) return `约每 ${Math.round(days / 30)} 个月更新 1 次（间隔 ${days} 天）`;
  if (days >= 28) return `约每月更新 1 次（间隔 ${days} 天）`;
  if (days >= 7) return `约每周更新 1 次（间隔 ${days} 天）`;
  return `最少间隔 ${days} 天更新 1 次`;
}

const TeacherPortraitMini = () => {
  const { profile, loading, error, refresh } = useTeacherProfile();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.current);
  const refreshHint = portraitRefreshHint(user);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" tip="加载教师画像..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <Empty description={error || '未找到教师数据'} />
        <Button icon={<ReloadOutlined />} onClick={refresh}>
          重新加载
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
        <div className="flex-shrink-0 flex justify-between items-center flex-wrap gap-3">
            <div>
            <div className="text-2xl font-bold text-gray-800">教师画像</div>
            <div className="text-sm text-gray-500 mt-0.5">
                教学 · 教研 · 效果 · 成长 · {refreshHint}（与学生画像间隔一致）
            </div>
            </div>
            <div className="flex gap-2">
            <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate('/workbench')}
              >
                返回
              </Button>
            <Button className="rounded-full">导出报告</Button>
            <Button type="primary" className="rounded-full">查看完整分析</Button>
            </div>
        </div>
        <div className='flex-1 overflow-y-auto min-h-0 bg-white rounded-2xl p-4 mt-4'>
                <StatsRow stats={profile.stats} />

            <div>
            <div className="text-lg font-semibold text-gray-700 mb-3">四维教学画像</div>
            <DimensionGrid dimensions={profile.dimensions} />
            </div>

            <ScheduleTimeline
            schedule={profile.schedule}
            todayClass={profile.todayClass}
            timeline={profile.timeline}
            />

            <Achievements achievements={profile.achievements} />

            <RadarChart data={profile.radar} />

            <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
            EducationOS · 教师画像 · {refreshHint}
            </div>
        </div>
    </div>
  );
};

export {
    TeacherPortraitMini
}
