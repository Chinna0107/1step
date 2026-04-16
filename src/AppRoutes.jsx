import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SuperAdminRoute, AdminRoute, EmployeeRoute } from './components/ProtectedRoute';

// SuperAdmin Pages
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import AdminsData from './pages/superadmin/AdminsData';
import EmployeesData from './pages/superadmin/EmployeesData';
import AttendanceData from './pages/superadmin/AttendanceData';
import ServicesData from './pages/superadmin/ServicesData';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import CreateEmployee from './pages/admin/CreateEmployee';
import Requests from './pages/admin/Requests';
import EmployeePerformance from './pages/admin/EmployeePerformance';
import EmployeeAttendance from './pages/admin/EmployeeAttendance';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import CustomerInfo from './pages/employee/CustomerInfo';
import AddCustomer from './pages/employee/AddCustomer';
import Services from './pages/employee/Services';

export default function AppRoutes() {
  return (
    <Routes>
        {/* SuperAdmin Routes - Protected */}
        <Route path="/superadmin/dashboard" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
        <Route path="/superadmin/admins" element={<SuperAdminRoute><AdminsData /></SuperAdminRoute>} />
        <Route path="/superadmin/employees" element={<SuperAdminRoute><EmployeesData /></SuperAdminRoute>} />
        <Route path="/superadmin/attendance" element={<SuperAdminRoute><AttendanceData /></SuperAdminRoute>} />
        <Route path="/superadmin/services" element={<SuperAdminRoute><ServicesData /></SuperAdminRoute>} />

        {/* Admin Routes - Protected */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/create-employee" element={<AdminRoute><CreateEmployee /></AdminRoute>} />
        <Route path="/admin/requests" element={<AdminRoute><Requests /></AdminRoute>} />
        <Route path="/admin/performance" element={<AdminRoute><EmployeePerformance /></AdminRoute>} />
        <Route path="/admin/attendance" element={<AdminRoute><EmployeeAttendance /></AdminRoute>} />

        {/* Employee Routes - Protected */}
        <Route path="/employee/dashboard" element={<EmployeeRoute><EmployeeDashboard /></EmployeeRoute>} />
        <Route path="/employee/customer-info" element={<EmployeeRoute><CustomerInfo /></EmployeeRoute>} />
        <Route path="/employee/add-customer" element={<EmployeeRoute><AddCustomer /></EmployeeRoute>} />
        <Route path="/employee/services" element={<EmployeeRoute><Services /></EmployeeRoute>} />

        {/* Default Route - do not redirect to avoid loop */}
        <Route path="*" element={<Navigate to="/login/superadmin" replace />} />
      </Routes>
    );
}
