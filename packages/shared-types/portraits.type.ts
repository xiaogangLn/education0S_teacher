/**
 * 获取学生画像
 */
// GET /api/v1/portraits/student/{student_id}

// 响应体
interface StudentPortraitResponse {
    code: number;
    message: string;
    data: {
        student_id: string;
        student_name: string;
        class_name: string;
        academic: {
            subjects: Record<string, { score: number; mastery: number; rank: number }>;
            overall_mastery: number;
            trend: 'up' | 'down' | 'stable';
            strengths: string[];
            weaknesses: string[];
        };
        abilities: {
            memory: number;
            comprehension: number;
            application: number;
            analysis: number;
            evaluation: number;
            creation: number;
        };
        behaviors: {
            homework_rate: number;
            homework_accuracy: number;
            participation: number;
            handwriting_score: number;
            learning_habit: 'good' | 'moderate' | 'poor';
        };
        psychology: {
            motivation: number;
            anxiety: number;
            self_efficacy: number;
            cooperation: number;
            stress_level: 'low' | 'medium' | 'high';
        };
        growth: {
            milestones: Array<{ date: string; title: string; description: string }>;
            improvement_rate: number;
            teacher_comments: Array<{ teacher: string; content: string; date: string }>;
        };
        updated_at: string;
    };
}

/**
 * 获取教师画像
 */

// GET /api/v1/portraits/teacher/{teacher_id}

// 响应体
interface TeacherPortraitResponse {
    code: number;
    message: string;
    data: {
        teacher_id: string;
        teacher_name: string;
        school_name: string;
        department: string;
        teaching: {
            lesson_plan_quality: number;
            classroom_interaction: number;
            teaching_style: string;
            innovation_score: number;
        };
        research: {
            research_participation: number;
            projects_count: number;
            training_hours: number;
        };
        effectiveness: {
            student_progress: number;
            satisfaction: number;
            peer_evaluation: number;
        };
        growth: {
            capability_evolution: string;
            milestones: Array<{ date: string; title: string }>;
            development_suggestions: string[];
        };
        overall_score: number;
        growth_trend: number;
        updated_at: string;
    };
}