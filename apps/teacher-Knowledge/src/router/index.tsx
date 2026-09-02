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


export const router = createBrowserRouter([
    {
        path: '/',
        element: <EducationOSEntrance />,
    },
    {
        path: '/workbench',
        element: <MainLayoutWorkbench />,
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
                path: 'studentList',
                element: <StudentList />,
            },
            {
                path: 'studentPortrait',
                element: <StudentPortraitPage />,
            },
            {
                path: 'teacherPortrait',
                element: <TeacherPortraitMini />
            }
        ],
    },
    {
        path: '/knowledge',
        element: <MainLayoutKnowledge />,
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
        element: <MainLayoutLeaderWindow />,
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
        element: <MainLayoutReview />,
        children: [
            {
                index: true,
                element: <ReviewCenterPage />,
            }
        ] 
    }
])