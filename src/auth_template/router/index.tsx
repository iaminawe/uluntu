import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthRoutes from './AuthRoutes';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<AuthRoutes />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;