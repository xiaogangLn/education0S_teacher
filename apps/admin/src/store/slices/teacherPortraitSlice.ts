// store/slices/teacherPortraitSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface TeacherTeaching {
  quality: number;
  interaction: number;
  style: string;
  innovation: number;
}

export interface TeacherResearch {
  participation: number;
  projects: number;
  trainingHours: number;
}

export interface TeacherEffectiveness {
  studentProgress: number;
  satisfaction: number;
  peerEvaluation: number;
}

export interface TeacherGrowth {
  capabilityEvolution: string;
  milestones: string[];
  developmentSuggestions: string[];
}

export interface TeacherPortrait {
  teaching: TeacherTeaching;
  research: TeacherResearch;
  effectiveness: TeacherEffectiveness;
  growth: TeacherGrowth;
  overallScore: number;
  growthTrend: number;
  updatedAt: string;
  lastCalculatedAt: string;
  version: number;
}

export interface TeacherPortraitState {
  data: TeacherPortrait | null;
  loading: boolean;
  error: string | null;
  teacherId: string | null;
}

const initialState: TeacherPortraitState = {
  data: null,
  loading: false,
  error: null,
  teacherId: null,
};

const teacherPortraitSlice = createSlice({
  name: 'teacherPortrait',
  initialState,
  reducers: {
    setTeacherPortrait: (state, action: PayloadAction<TeacherPortrait>) => {
      state.data = action.payload;
      state.error = null;
    },
    setTeacherId: (state, action: PayloadAction<string>) => {
      state.teacherId = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateTeaching: (state, action: PayloadAction<Partial<TeacherTeaching>>) => {
      if (state.data) {
        state.data.teaching = { ...state.data.teaching, ...action.payload };
      }
    },
    updateResearch: (state, action: PayloadAction<Partial<TeacherResearch>>) => {
      if (state.data) {
        state.data.research = { ...state.data.research, ...action.payload };
      }
    },
    clearTeacherPortrait: (state) => {
      state.data = null;
      state.error = null;
      state.teacherId = null;
    },
  },
});

export const {
  setTeacherPortrait,
  setTeacherId,
  setLoading,
  setError,
  updateTeaching,
  updateResearch,
  clearTeacherPortrait,
} = teacherPortraitSlice.actions;

export default teacherPortraitSlice.reducer;