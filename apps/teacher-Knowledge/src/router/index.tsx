import { createBrowserRouter } from 'react-router-dom';
import { MainLayoutWorkbench } from '../layouts/workbench/MainLayout';
import { EducationOSEntrance } from '../pages/Entrance';
import { Home } from '@/pages/workbench/Home';
import { Instrument } from '@/pages/workbench/Instrument';
import { TeacherInfoComponent } from '@/pages/workbench/TeacherInfo';
import { HistoryOrderComponent } from '@/pages/workbench/HistoryOrder';
import { StudentList } from '@/pages/workbench/Student';
import { StudentPortraitPage } from '@/pages/workbench/StudentInfo';
import { TeacherPortraitMini } from '@/pages/workbench/TeacherProtait';
import { MainLayoutKnowledge } from '@/layouts/knowledge/MainLayout';
import KnowledgeBasePage from '@/pages/knowledge/KnowledgeBase';
import AllDocumentsPage from '@/pages/knowledge/AllDocuments';
import { DocumentEditorPage } from '@/pages/knowledge/DocumentEditor';
import LeaderDashboardPage from '@/pages/LeaderWindow/Statistics';
import { MainLayoutLeaderWindow } from '@/layouts/leaderWindow/LeaderWindowLayout';
import DetailedReportPage from '@/pages/LeaderWindow/Predict';
import TrendPredictionPage from '@/pages/LeaderWindow/TrendPrediction';
import { MainLayoutReview } from '@/layouts/review/MainLayout';
import ReviewCenterPage from '@/pages/ReviewCenter/Overview';
import LessonPlanDetailPage from '@/pages/workbench/LessonPlanDetail';
import StudentLearningRecordsPage from '@/pages/workbench/StudentLearningRecords';
import CoursewareDetailPage from '@/pages/workbench/CoursewareDetail';
import ExamDetailPage from '@/pages/workbench/ExamDetail';
import SmartGradingPage from '@/pages/workbench/SmartGrading';
import GradeUploadPage from '@/pages/mobile/GradeUpload';
import { RequireAuth } from '@/components/RequireAuth';
import { RequireStudentManage } from '@/components/RequireStudentManage';
import { RequireReviewCenter } from '@/components/RequireReviewCenter';
import { PrivacyPolicyPage, TermsOfServicePage } from '@/pages/Legal';
import ConfirmEmailPage from '@/pages/Entrance/ConfirmEmail';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <EducationOSEntrance />,
    },
    {
        path: '/auth/confirm-email',
        element: <ConfirmEmailPage />,
    },
    {
        path: '/legal/terms',
        element: <TermsOfServicePage />,
    },
    {
        path: '/legal/privacy',
        element: <PrivacyPolicyPage />,
    },
    {
        path: '/m/grade/:token',
        element: <GradeUploadPage />,
    },
    {
        path: '/workbench',
        element: (
            <RequireAuth>
                <MainLayoutWorkbench />
            </RequireAuth>
        ),
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: 'instrument',
                element: <Instrument />,
            },
            {
                path: 'teacherInfo',
                element: <TeacherInfoComponent />,
            },
            {
                path: 'historyOrder',
                element: <HistoryOrderComponent />,
            },
            {
                path: 'lessonPlanDetail',
                element: <LessonPlanDetailPage />,
            },
            {
                path: 'studentList',
                element: (
                    <RequireStudentManage>
                        <StudentList />
                    </RequireStudentManage>
                ),
            },
            {
                path: 'studentPortrait',
                element: (
                    <RequireStudentManage>
                        <StudentPortraitPage />
                    </RequireStudentManage>
                ),
            },
            {
                path: 'teacherPortrait',
                element: <TeacherPortraitMini />
            },
            {
                path: 'studentLearningRecords',
                element: (
                    <RequireStudentManage>
                        <StudentLearningRecordsPage />
                    </RequireStudentManage>
                ),
            },
            {
                path: 'coursewareDetail',
                element: <CoursewareDetailPage />
            },
            {
                path: 'examDetail',
                element: <ExamDetailPage />
            },
            {
                path: 'smartGrading',
                element: <SmartGradingPage />
            }
        ],
    },
    {
        path: '/smartGrading',
        element: (
            <RequireAuth>
                <MainLayoutWorkbench />
            </RequireAuth>
        ),
        children: [
            {
                index: true,
                element: <SmartGradingPage />,
            },
        ],
    },
    {
        path: '/knowledge',
        element: (
            <RequireAuth>
                <MainLayoutKnowledge />
            </RequireAuth>
        ),
        children: [
            {
                index: true,
                element: <KnowledgeBasePage />,
            },
            {
                path: 'allDocuments',
                element: <AllDocumentsPage />
            },
            {
                path: 'DocumentEditor',
                element: <DocumentEditorPage />
            }
        ]
    },
    {
        path: '/leaderWindow',
        element: (
            <RequireAuth>
                <MainLayoutLeaderWindow />
            </RequireAuth>
        ),
        children: [
            {
                index: true,
                element: <LeaderDashboardPage />,
            },
            {
                path: 'detailedReport',
                element: <DetailedReportPage />
            },
            {
                path: 'trendPrediction',
                element: <TrendPredictionPage />
            }
        ]
    },
    {
        path: 'reviewCenter',
        element: (
            <RequireAuth>
                <RequireReviewCenter>
                    <MainLayoutReview />
                </RequireReviewCenter>
            </RequireAuth>
        ),
        children: [
            {
                index: true,
                element: <ReviewCenterPage />,
            }
        ]
    }
])
