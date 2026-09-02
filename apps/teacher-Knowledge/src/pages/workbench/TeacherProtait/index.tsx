import { Spin, Empty, Button } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { ScheduleTimeline } from './components/ScheduleTimeline';
import { useTeacherProfile } from './hook/useTeacherProfile';
import { StatsRow } from './components/StatsRow';
import { DimensionGrid } from './components/DimensionGrid';
import { Achievements } from './components/Achievements';
import { RadarChart } from './components/RadarChart';
import { useNavigate } from 'react-router-dom';



const TeacherPortraitMini = () => {
  const { profile, loading, error, refresh } = useTeacherProfile("1");
  const navigate = useNavigate();

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
        {/* 页面标题 */}
        <div className="flex-shrink-0 flex justify-between items-center flex-wrap gap-3">
            <div>
            <div className="text-2xl font-bold text-gray-800">👨‍🏫 教师画像</div>
            <div className="text-sm text-gray-500 mt-0.5">
                教学 · 教研 · 效果 · 成长 · 每周日 03:00 自动更新
            </div>
            </div>
            <div className="flex gap-2">
            <Button 
                  icon={<ArrowLeftOutlined />}  
                  onClick={() => navigate('/workbench')}
              >
                返回
              </Button>
            <Button className="rounded-full">📊 导出报告</Button>
            <Button type="primary" className="rounded-full">📈 查看完整分析</Button>
            </div>
        </div>
        <div className='flex-1 overflow-y-auto min-h-0 bg-white rounded-2xl p-4 mt-4'>
            {/* 统计概览 */}
                <StatsRow stats={profile.stats} />

            {/* 四维画像 */}
            <div>
            <div className="text-lg font-semibold text-gray-700 mb-3">🧩 四维教学画像</div>
            <DimensionGrid dimensions={profile.dimensions} />
            </div>

            {/* 课程表 + 近期动态 */}
            <ScheduleTimeline
            schedule={profile.schedule}
            todayClass={profile.todayClass}
            timeline={profile.timeline}
            />

            {/* 教学成果 */}
            <Achievements achievements={profile.achievements} />

            {/* 能力雷达 */}
            <RadarChart data={profile.radar} />

            {/* 底部更新时间 */}
            <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-100">
            EducationOS V8.0 · 教师画像 · 数据每周日 03:00 自动更新
            </div>
        </div>
    </div>
  );
};

export {
    TeacherPortraitMini
}