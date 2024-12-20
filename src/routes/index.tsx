import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ProjectsList from '../pages/ProjectsList';
import ProjectDetails from '../pages/ProjectDetails';
import CreateProfileForm from '../pages/CreateProfileForm';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/dashboard/projects/:id" element={<ProjectDetails />} />
      <Route path="/dashboard/professional/profile/create" element={<CreateProfileForm />} />
    </Routes>
  );
};

export default App; 