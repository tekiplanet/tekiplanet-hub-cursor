import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ProjectsList from '../pages/ProjectsList';
import ProjectDetails from '../pages/ProjectDetails';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/dashboard/projects/:id" element={<ProjectDetails />} />
    </Routes>
  );
};

export default App; 