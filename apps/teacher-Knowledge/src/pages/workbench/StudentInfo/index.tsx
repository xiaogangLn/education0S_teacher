// pages/StudentPortraitPage.tsx
import React from 'react';
import { Spin, Alert, Drawer, Button } from 'antd';
import { useStudentPortrait } from './hook/useStudentPortrait';
import { useTrendData } from './hook/useTrendData';
import { StudentHeader } from './components/studentHeader';
import { ScoreOverview } from './components/scoreOverview';
import { TrendChart } from './components/trendChart';
import { SubjectScores } from './components/subjectScores';
import { AbilityRadar } from './components/abilityRadar';
import { WrongQuestions } from './components/wrongQuestions';
import { ExamRecords } from './components/examRecords';
import { ActionButtons } from './components/actionButtons';
import { StudyPlan } from './components/studyPlan';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';


interface StudentPortraitPageProps {
  studentId?: string;
}

const StudentPortraitPage: React.FC<StudentPortraitPageProps> = ({ studentId: studentIdProp }) => {
  const [searchParams] = useSearchParams();
  const studentId = studentIdProp || searchParams.get('id') || undefined;
  const {
    loading,
    portrait,
    error,
    DrawerOpen,
    setDrawerOpen,
    exportReport,
    generateStudyPlan,
    sendToParent,
  } = useStudentPortrait(studentId);
  const navigate = useNavigate();

  const { trendData } = useTrendData(portrait?.exams || []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="加载学生画像..." />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  if (!portrait) {
    return <Alert message="未找到学生数据" type="warning" showIcon />;
  }

  return (
    <div className='flex flex-col h-full '>
        {/* 页面标题 */}
        <div className='flex item-cneter justify-between'>
          <div className="mb-4 flex-shrink-0">
              <h2 className="text-xl font-bold">📊 学生学情报告</h2>
              <p className="text-sm text-gray-500">历史成绩 · 换班轨迹 · 错题归因 · 能力雷达</p>
          </div>
          <div>
              <Button onClick={() => navigate('/workbench/studentList')} icon={<ArrowLeftOutlined />} className="rounded-full">返回</Button>
          </div>
        </div>

        {/* 主卡片 */}
        <div className="flex-1 bg-white rounded-2xl p-5 overflow-y-auto min-h-0">
            <div>
                {/* 学生头部 */}
                <StudentHeader student={portrait.student} />

                {/* 学情概览 */}
                <ScoreOverview
                strengths={portrait.strengths}
                weaknesses={portrait.weaknesses}
                midtermScore={portrait.midtermScore}
                finalScore={portrait.finalScore}
                masteryRate={portrait.masteryRate}
                masteryTrend={portrait.masteryTrend}
                />
            </div>

            {/* 成绩趋势图 */}
            <TrendChart data={trendData} title="数学成绩趋势" />

            {/* 各科成绩 + 能力雷达 两列布局 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <SubjectScores scores={portrait.scores} />
                <AbilityRadar abilities={portrait.abilities} />
            </div>

            {/* 错题归因 */}
            <WrongQuestions questions={portrait.wrongQuestions} />

            {/* 考试记录 */}
            <ExamRecords records={portrait.exams} />

            {/* 操作按钮 */}
            <ActionButtons
                onExport={exportReport}
                onGeneratePlan={generateStudyPlan}
                onSendToParent={sendToParent}
                loading={loading}
            />
        </div>
        <Drawer
            title="学习计划"
            placement={'right'}
            closable={false}
            width='40%'
            onClose={() => setDrawerOpen(false)}
            open={DrawerOpen}
        >
            <StudyPlan studentId={studentId} />
      </Drawer>
    </div>
  );
};

export {
    StudentPortraitPage
}