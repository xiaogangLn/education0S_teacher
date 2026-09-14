import { createBrowserRouter } from 'react-router-dom';
import { MainLayoutWorkbench } from '../layouts/workbench/MainLayout';
import { EducationOSEntrance } from '../pages/Entrance';
import { SchoolsPage } from '@/pages/Schools';
import { GradesPage } from '@/pages/Grades';
import { ClassesPage } from '@/pages/Classs';
import { StudentsPage } from '@/pages/Students';
import { TeachersPage } from '@/pages/Teachers';
import { CommercialTenantsPage } from '@/pages/CommercialTenants';
import { CommercialPlansPage } from '@/pages/CommercialPlans';
import { AiModelsPage } from '@/pages/AiModels';
import { PaymentsPage } from '@/pages/Payments';
import { PromptOpsPage } from '@/pages/PromptOps';
import { DashboardPage } from '@/pages/Home';
import { RequireAdmin } from '@/components/RequireAdmin';
import { PrivacyPolicyPage, TermsOfServicePage } from '@/pages/Legal';


export const router = createBrowserRouter([
    {
        path: '/',
        element: <EducationOSEntrance />,
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
        path: '/application',
        element: (
            <RequireAdmin>
                <MainLayoutWorkbench />
            </RequireAdmin>
        ),
        children: [
            {
                index: true,
                element: <DashboardPage />,
            },
            {
                path: 'schools',
                element: <SchoolsPage />,
            },
            {
                path: 'grades',
                element: <GradesPage />,
            },
            {
                path: 'classs',
                element: <ClassesPage />,
            },
            {
                path: 'students',
                element: <StudentsPage />,
            },
            {
                path: 'teachers',
                element: <TeachersPage />,
            },
            {
                path: 'commercial',
                element: <CommercialTenantsPage />,
            },
            {
                path: 'commercial-plans',
                element: <CommercialPlansPage />,
            },
            {
                path: 'payments',
                element: <PaymentsPage />,
            },
            {
                path: 'ai-models',
                element: <AiModelsPage />,
            },
            {
                path: 'prompts',
                element: <PromptOpsPage />,
            },
        ],
    }
])
