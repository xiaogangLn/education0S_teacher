import React from 'react';
import type { TeacherDimension } from '../types/teacher';
import { DimensionCard } from './DimensionCard';

interface DimensionGridProps {
  dimensions: TeacherDimension[];
}

export const DimensionGrid: React.FC<DimensionGridProps> = ({ dimensions }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {dimensions.map((dim, idx) => (
        <DimensionCard key={idx} dimension={dim} />
      ))}
    </div>
  );
};