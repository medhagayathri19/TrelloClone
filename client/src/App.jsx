import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { TaskProvider } from './context/TaskContext';
import MainLayout from './components/layout/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <TaskProvider>
          <Routes>
            <Route path="/" element={<MainLayout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TaskProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;

