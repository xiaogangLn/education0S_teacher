// types.ts
export interface ExportScope {
    id: string;
    label: string;
    checked: boolean;
    description?: string;
  }
  
  export type ExportFormat = 'excel' | 'pdf' | 'csv' | 'json';
  
  export interface ExportFormatOption {
    id: ExportFormat;
    label: string;
    icon: string;
    extension: string;
  }
  
  export type TimeRange = '1month' | '3months' | '6months' | '1year';
  
  export interface TimeRangeOption {
    id: TimeRange;
    label: string;
    value: string;
  }
  
  export interface ExportOption {
    id: string;
    title: string;
    description: string;
    icon: string;
    enabled: boolean;
  }
  
  export interface ExportTask {
    id: string;
    name: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    format: ExportFormat;
    createdAt: string;
    downloadUrl?: string;
    error?: string;
  }