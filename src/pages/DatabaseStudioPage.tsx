import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DatabaseStudio } from '../components/DatabaseStudio';

export const DatabaseStudioPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      <DatabaseStudio onBack={() => navigate('/admin')} />
    </div>
  );
};
