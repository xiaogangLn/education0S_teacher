// store/slices/studentPortraitSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface StudentAcademic {
  math: number;
  chinese: number;
  english: number;
  physics: number;
  chemistry: number;
  biology?: number;
  history?: number;
  geography?: number;
  overall: number;
  trend: number;
}

export interface StudentAbilities {
  memory: number;
  comprehension: number;
  application: number;
  analysis: number;
  evaluation: number;
  creation: number;
}

export interface StudentBehavior {
  homeworkCompletion: number;
  classParticipation: number;
  handwriting: number;
  attendance: number;
}

export interface StudentPsychology {
  motivation: number;
  anxiety: 'low' | 'medium' | 'high';
  selfEfficacy: number;
  cooperation: number;
}

export interface StudentGrowth {
  trajectory: string;
  milestones: string[];
  teacherComments: string[];
}

export interface StudentPortrait {
  academic: StudentAcademic;
  abilities: StudentAbilities;
  behaviors: StudentBehavior;
  psychology: StudentPsychology;
  growth: StudentGrowth;
  overallScore: number;
  overallGrade: string;
  updatedAt: string;
  lastCalculatedAt: string;
  version: number;
}

export interface StudentPortraitState {
  data: StudentPortrait | null;
  loading: boolean;
  error: string | null;
  studentId: string | null;
  studentName: string | null;
  className: string | null;
}

const initialState: StudentPortraitState = {
  data: null,
  loading: false,
  error: null,
  studentId: null,
  studentName: null,
  className: null,
};

const studentPortraitSlice = createSlice({
  name: 'studentPortrait',
  initialState,
  reducers: {
    setStudentPortrait: (state, action: PayloadAction<{ data: StudentPortrait; studentId: string; studentName: string; className: string }>) => {
      state.data = action.payload.data;
      state.studentId = action.payload.studentId;
      state.studentName = action.payload.studentName;
      state.className = action.payload.className;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateAcademic: (state, action: PayloadAction<Partial<StudentAcademic>>) => {
      if (state.data) {
        state.data.academic = { ...state.data.academic, ...action.payload };
      }
    },
    clearStudentPortrait: (state) => {
      state.data = null;
      state.studentId = null;
      state.studentName = null;
      state.className = null;
      state.error = null;
    },
  },
});

export const {
  setStudentPortrait,
  setLoading,
  setError,
  updateAcademic,
  clearStudentPortrait,
} = studentPortraitSlice.actions;

export default studentPortraitSlice.reducer;