// store/slices/permissionSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type PermissionLevel = 'school' | 'grade' | 'class' | 'personal' | 'research';

export interface PermissionState {
  currentLevel: PermissionLevel;
  availableLevels: PermissionLevel[];
  schoolId?: string;
  gradeId?: string;
  classId?: string;
  canCreate: PermissionLevel[];
  canEdit: PermissionLevel[];
  canDelete: PermissionLevel[];
  canApprove: boolean;
}

const initialState: PermissionState = {
  currentLevel: 'class',
  availableLevels: ['school', 'grade', 'class', 'personal', 'research'],
  canCreate: ['class', 'personal'],
  canEdit: ['class', 'personal'],
  canDelete: ['personal'],
  canApprove: false,
};

const permissionSlice = createSlice({
  name: 'permission',
  initialState,
  reducers: {
    setCurrentLevel: (state, action: PayloadAction<PermissionLevel>) => {
      state.currentLevel = action.payload;
    },
    setAvailableLevels: (state, action: PayloadAction<PermissionLevel[]>) => {
      state.availableLevels = action.payload;
    },
    setPermissions: (
      state,
      action: PayloadAction<{
        canCreate?: PermissionLevel[];
        canEdit?: PermissionLevel[];
        canDelete?: PermissionLevel[];
        canApprove?: boolean;
      }>
    ) => {
      if (action.payload.canCreate) state.canCreate = action.payload.canCreate;
      if (action.payload.canEdit) state.canEdit = action.payload.canEdit;
      if (action.payload.canDelete) state.canDelete = action.payload.canDelete;
      if (action.payload.canApprove !== undefined) state.canApprove = action.payload.canApprove;
    },
    setSchoolId: (state, action: PayloadAction<string>) => {
      state.schoolId = action.payload;
    },
    setGradeId: (state, action: PayloadAction<string>) => {
      state.gradeId = action.payload;
    },
    setClassId: (state, action: PayloadAction<string>) => {
      state.classId = action.payload;
    },
    resetPermissions: (state) => {
      state.currentLevel = 'class';
      state.canCreate = ['class', 'personal'];
      state.canEdit = ['class', 'personal'];
      state.canDelete = ['personal'];
      state.canApprove = false;
    },
  },
});

export const {
  setCurrentLevel,
  setAvailableLevels,
  setPermissions,
  setSchoolId,
  setGradeId,
  setClassId,
  resetPermissions,
} = permissionSlice.actions;

export default permissionSlice.reducer;