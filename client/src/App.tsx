import React from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Form from './Form';
import Signup from './Signup';
import StudentDetailForm from './StudentDetailForm';
import AdminForm from './admin/AdminForm';

import LandingPage from './pages/LandingPage';
import DashboardHomePage from './pages/DashboardHomePage';
import EligibleExamsPage from './pages/EligibleExamsPage';
import PlaceholderPage from './pages/PlaceholderPage';
import MyProfilePage from './pages/MyProfilePage';
import ReviewDiscoveredExamsPage from './pages/ReviewDiscoveredExamsPage';
import PrepTrackerPage from './pages/PrepTrackerPage';
import DocumentWalletPage from './pages/DocumentWalletPage';
import NotificationsPage from './pages/NotificationsPage';

import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Form
      signInEndpoint="http://localhost:3000/api/users/login"
      onOpenSignup={() => navigate('/signup')}
      onForgotPassword={() => navigate('/forgot-password')}
      onSuccess={() => {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payloadStr = atob(token.split('.')[1]);
            const payload = JSON.parse(payloadStr);
            if (payload.is_admin) {
              navigate('/admin');
              return;
            }
          } catch (e) {
            console.error(e);
          }
        }
        navigate('/dashboard');
      }}
    />
  );
};

const SignupPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Signup
      signupEndpoint="http://localhost:3000/api/users/signup"
      onOpenLogin={() => navigate('/login')}
      onSuccess={() => navigate('/dashboard')}
    />
  );
};

const StudentDetailsPage: React.FC = () => {
  return <StudentDetailForm />;
};

const AdminFormPage: React.FC = () => {
  return <AdminForm />;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route path="/" element={<DashboardLayout />}>
        <Route path="dashboard" element={<DashboardHomePage />} />
        <Route path="eligible-exams" element={<EligibleExamsPage />} />
        <Route path="my-profile" element={<MyProfilePage />} />
        <Route path="student-details" element={<StudentDetailsPage />} />

        <Route path="documents" element={<DocumentWalletPage />} />
        <Route path="prep-tracker" element={<PrepTrackerPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Admin Pages (Protected and separated from Student Dashboard Layout) */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminFormPage />} />
        <Route path="review-discoveries" element={<ReviewDiscoveredExamsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
