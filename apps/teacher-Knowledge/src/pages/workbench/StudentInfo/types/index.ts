export interface StudentInfo {
    id: string;
    name: string;
    grade: string;
    class: string;
    studentNo: string;
    status: 'excellent' | 'good' | 'warning' | 'danger';
    rank: number;
    totalStudents: number;
  }
  
  export interface TransferRecord {
    date: string;
    fromClass: string;
    toClass: string;
  }
  
  export interface SubjectScore {
    subject: string;
    score: number;
    classAverage: number;
    rank: number;
  }
  
  export interface ExamRecord {
    name: string;
    subject: string;
    score: number;
    classAverage: number;
    rank: number;
  }
  
  export interface WrongQuestion {
    name: string;
    errorCount: number;
    masteryRate: number;
    level: 'critical' | 'warning' | 'normal' | 'good';
  }
  
  export interface AbilityRadar {
    label: string;
    value: number;
  }
  
  export interface StudentPortrait {
    student: StudentInfo;
    transfers: TransferRecord[];
    scores: SubjectScore[];
    exams: ExamRecord[];
    wrongQuestions: WrongQuestion[];
    abilities: AbilityRadar[];
    masteryRate: number;
    masteryTrend: number;
    midtermScore: number;
    finalScore: number;
    strengths: string[];
    weaknesses: string[];
  }