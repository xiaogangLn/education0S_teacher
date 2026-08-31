import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { EducationOSEntrance } from '../pages/Entrance';
import { Home } from '../pages/Home';
import { Instrument } from '@/pages/Instrument';
import { TeacherInfoComponent } from '@/pages/TeacherInfo';
import { HistoryOrderComponent } from '@/pages/HistoryOrder';


export const router = createBrowserRouter([
    {
        path: '/',
        element: <EducationOSEntrance />,
    },
    {
        path: '/home',
        element: <MainLayout />,
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
            }
        ],
    },
])