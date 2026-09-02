/** 教师画像维度数据 */
export interface TeacherDimension {
    label: string;
    score: number | string;
    items: { label: string; value: string | number; badge?: string }[];
    progress?: number;
  }
  
  /** 教师画像完整数据 */
  export interface TeacherProfile {
    id: string;
    name: string;
    title: string;
    avatar: string;
    tags: string[];
    stats: {
      label: string;
      value: number;
      color: 'blue' | 'green' | 'purple' | 'orange';
    }[];
    dimensions: TeacherDimension[];
    schedule: {
      day: string;
      periods: number;
      isToday?: boolean;
    }[];
    todayClass?: string;
    timeline: {
      date: string;
      title: string;
      description: string;
    }[];
    achievements: {
      icon: string;
      title: string;
      description: string;
      meta: string;
    }[];
    radar: {
      label: string;
      value: number;
      color: string;
    }[];
  }
  