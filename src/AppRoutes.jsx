import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SuperAdminRoute, AdminRoute, EmployeeRoute } from './components/ProtectedRoute';

// SuperAdmin Pages
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import AdminsData from './pages/superadmin/AdminsData';
import EmployeesData from './pages/superadmin/EmployeesData';
import AttendanceData from './pages/superadmin/AttendanceData';
import ServicesData from './pages/superadmin/ServicesData';
import Insights from './pages/superadmin/Insights';
import Branches from './pages/superadmin/Branches';
import Tracking from './pages/superadmin/Tracking';
import Finance from './pages/superadmin/Finance';
import Configuration from './pages/superadmin/Configuration';
import Reports from './pages/superadmin/Reports';
import Security from './pages/superadmin/Security';
import FraudList from './pages/superadmin/FraudList';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminInsights from './pages/admin/Insights';
import AdminTransactions from './pages/admin/Transactions';
import AdminFinance from './pages/admin/Finance';
import AdminCustomers from './pages/admin/Customers';
import AdminReports from './pages/admin/Reports';
import AdminSecurity from './pages/admin/Security';
import AdminConfig from './pages/admin/Config';
import CreateEmployee from './pages/admin/CreateEmployee';
import Requests from './pages/admin/Requests';
import EmployeeDetails from './pages/admin/EmployeeDetails';
import EmployeePerformance from './pages/admin/EmployeePerformance';
import EmployeeAttendance from './pages/admin/EmployeeAttendance';
import FinanceDashboard from './pages/admin/FinanceDashboard';
import Wallets from './pages/admin/Wallets';
import Ledger from './pages/admin/Ledger';
import CashFlow from './pages/admin/CashFlow';
import Expenses from './pages/admin/Expenses';
import Settlements from './pages/admin/Settlements';
import DailyClosing from './pages/admin/DailyClosing';
import Profit from './pages/admin/Profit';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import CustomerInfo from './pages/employee/CustomerInfo';
import AddCustomer from './pages/employee/AddCustomer';
import Services from './pages/employee/Services';
import EmployeeReports from './pages/employee/EmployeeReports';
import Profile from './pages/employee/Profile';
import EmployeeNavbar from './components/employee/EmployeeNavbar';
import AdminSidebar from './components/admin/AdminSidebar';

export default function AppRoutes() {
  return (
    <Routes>
      {/* SuperAdmin Routes */}
      <Route path="/superadmin/dashboard"  element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
      <Route path="/superadmin/admins"     element={<SuperAdminRoute><AdminsData /></SuperAdminRoute>} />
      <Route path="/superadmin/employees"  element={<SuperAdminRoute><EmployeesData /></SuperAdminRoute>} />
      <Route path="/superadmin/attendance" element={<SuperAdminRoute><AttendanceData /></SuperAdminRoute>} />
      <Route path="/superadmin/services"   element={<SuperAdminRoute><ServicesData /></SuperAdminRoute>} />
      <Route path="/superadmin/insights"   element={<SuperAdminRoute><Insights /></SuperAdminRoute>} />
      <Route path="/superadmin/branches"   element={<SuperAdminRoute><Branches /></SuperAdminRoute>} />
      <Route path="/superadmin/tracking"   element={<SuperAdminRoute><Tracking /></SuperAdminRoute>} />
      <Route path="/superadmin/finance"    element={<SuperAdminRoute><Finance /></SuperAdminRoute>} />
      <Route path="/superadmin/config"     element={<SuperAdminRoute><Configuration /></SuperAdminRoute>} />
      <Route path="/superadmin/reports"    element={<SuperAdminRoute><Reports /></SuperAdminRoute>} />
      <Route path="/superadmin/security"   element={<SuperAdminRoute><Security /></SuperAdminRoute>} />
      <Route path="/superadmin/fraud"      element={<SuperAdminRoute><FraudList /></SuperAdminRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard"       element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/insights"        element={<AdminRoute><AdminInsights /></AdminRoute>} />
      <Route path="/admin/transactions"    element={<AdminRoute><AdminTransactions /></AdminRoute>} />
      <Route path="/admin/finance"         element={<AdminRoute><FinanceDashboard /></AdminRoute>} />
      <Route path="/admin/finance/wallets"     element={<AdminRoute><Wallets /></AdminRoute>} />
      <Route path="/admin/finance/ledger"      element={<AdminRoute><Ledger /></AdminRoute>} />
      <Route path="/admin/finance/cashflow"    element={<AdminRoute><CashFlow /></AdminRoute>} />
      <Route path="/admin/finance/expenses"    element={<AdminRoute><Expenses /></AdminRoute>} />
      <Route path="/admin/finance/settlements" element={<AdminRoute><Settlements /></AdminRoute>} />
      <Route path="/admin/finance/closing"     element={<AdminRoute><DailyClosing /></AdminRoute>} />
      <Route path="/admin/finance/profit"      element={<AdminRoute><Profit /></AdminRoute>} />
      <Route path="/admin/customers"       element={<AdminRoute><AdminCustomers /></AdminRoute>} />
      <Route path="/admin/reports"         element={<AdminRoute><AdminReports /></AdminRoute>} />
      <Route path="/admin/security"        element={<AdminRoute><AdminSecurity /></AdminRoute>} />
      <Route path="/admin/config"          element={<AdminRoute><AdminConfig /></AdminRoute>} />
      <Route path="/admin/create-employee" element={<AdminRoute><CreateEmployee /></AdminRoute>} />
      <Route path="/admin/requests"        element={<AdminRoute><Requests /></AdminRoute>} />
      <Route path="/admin/employees"     element={<AdminRoute><EmployeeDetails /></AdminRoute>} />
      <Route path="/admin/performance"     element={<AdminRoute><EmployeePerformance /></AdminRoute>} />
      <Route path="/admin/attendance"      element={<AdminRoute><EmployeeAttendance /></AdminRoute>} />

      {/* Employee Routes */}
      <Route path="/employee/dashboard"    element={<EmployeeRoute><EmployeeDashboard /></EmployeeRoute>} />
      <Route path="/employee/customer-info" element={<EmployeeRoute><CustomerInfo /></EmployeeRoute>} />
      <Route path="/employee/add-customer" element={<EmployeeRoute><AddCustomer /></EmployeeRoute>} />
      <Route path="/employee/services"     element={<EmployeeRoute><Services /></EmployeeRoute>} />
      <Route path="/employee/reports"      element={<EmployeeRoute><EmployeeReports /></EmployeeRoute>} />
      <Route path="/employee/profile"       element={<EmployeeRoute><Profile Sidebar={EmployeeNavbar} /></EmployeeRoute>} />
      <Route path="/admin/profile"          element={<AdminRoute><Profile Sidebar={AdminSidebar} isAdmin={true} /></AdminRoute>} />

      <Route path="*" element={<Navigate to="/login/superadmin" replace />} />
    </Routes>
  );
}
