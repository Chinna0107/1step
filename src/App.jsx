import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import WhatWeDo from './pages/WhatWeDo'
import About from './pages/About'
import Contact from './pages/Contact'
import ProductDetails from './pages/ProductDetails'
import LoginCustomer from './pages/LoginCustomer'
import LoginEmployee from './pages/LoginEmployee'
import LoginSuperAdmin from './pages/LoginSuperAdmin'
import NotFound from './pages/NotFound'
import FAQ from './pages/FAQ'
import TermsConditions from './pages/TermsConditions'
import Privacy from './pages/Privacy'
import FloatingContact from './components/FloatingContact'
import { SuperAdminRoute, AdminRoute, EmployeeRoute, CustomerRoute } from './components/ProtectedRoute'

// SuperAdmin Pages
import SuperAdminDashboard from './pages/superadmin/Dashboard'
import AdminsData from './pages/superadmin/AdminsData'
import EmployeesData from './pages/superadmin/EmployeesData'
import AttendanceData from './pages/superadmin/AttendanceData'
import ServicesData from './pages/superadmin/ServicesData'
import Insights from './pages/superadmin/Insights'
import Branches from './pages/superadmin/Branches'
import Tracking from './pages/superadmin/Tracking'
import Finance from './pages/superadmin/Finance'
import Configuration from './pages/superadmin/Configuration'
import Reports from './pages/superadmin/Reports'
import Security from './pages/superadmin/Security'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import CreateEmployee from './pages/admin/CreateEmployee'
import Requests from './pages/admin/Requests'
import EmployeePerformance from './pages/admin/EmployeePerformance'
import EmployeeAttendance from './pages/admin/EmployeeAttendance'
import AdminInsights from './pages/admin/Insights'
import AdminTransactions from './pages/admin/Transactions'
import AdminFinance from './pages/admin/Finance'
import AdminCustomers from './pages/admin/Customers'
import AdminReports from './pages/admin/Reports'
import AdminSecurity from './pages/admin/Security'
import AdminConfig from './pages/admin/Config'  

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard'
import CustomerInfo from './pages/employee/CustomerInfo'
import AddCustomer from './pages/employee/AddCustomer'
import Services from './pages/employee/Services'
import EmployeeReports from './pages/employee/EmployeeReports'
import Profile from './pages/employee/Profile'
import EmployeeNavbar from './components/employee/EmployeeNavbar'
import AdminSidebar from './components/admin/AdminSidebar'

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard'
import CustomerServices from './pages/customer/Services'
import CustomerTransactions from './pages/customer/Transactions'
import CustomerKYC from './pages/customer/KYC'
import CustomerCoins from './pages/customer/Coins'
import { CustomerOffers, CustomerNotifications, CustomerSupport, CustomerSecurity } from './pages/customer/Misc'

import './App.css'

const dashboardPrefixes = ['/superadmin', '/admin', '/employee', '/customer']

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [pathname])
  return null
}

function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <>
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>{children}</main>
      <Footer />
      <FloatingContact hidden={menuOpen} />
    </>
  )
}

function ConditionalLayout({ children }) {
  const { pathname } = useLocation()
  const isDashboard = dashboardPrefixes.some(p => pathname.startsWith(p))
  if (isDashboard) return children
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public routes with layout */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/what-we-do" element={<Layout><WhatWeDo /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/faq" element={<Layout><FAQ /></Layout>} />
        <Route path="/terms" element={<Layout><TermsConditions /></Layout>} />
        <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
        <Route path="/product/:slug" element={<Layout><ProductDetails /></Layout>} />

        {/* Login routes */}
        <Route path="/login/customer" element={<LoginCustomer />} />
        <Route path="/login/employee" element={<LoginEmployee />} />
        <Route path="/login/superadmin" element={<LoginSuperAdmin />} />

        {/* SuperAdmin routes */}
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

        {/* Admin routes */}
        <Route path="/admin/dashboard"       element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/insights"        element={<AdminRoute><AdminInsights /></AdminRoute>} />
        <Route path="/admin/transactions"    element={<AdminRoute><AdminTransactions /></AdminRoute>} />
        <Route path="/admin/finance"         element={<AdminRoute><AdminFinance /></AdminRoute>} />
        <Route path="/admin/customers"       element={<AdminRoute><AdminCustomers /></AdminRoute>} />
        <Route path="/admin/reports"         element={<AdminRoute><AdminReports /></AdminRoute>} />
        <Route path="/admin/security"        element={<AdminRoute><AdminSecurity /></AdminRoute>} />
        <Route path="/admin/config"          element={<AdminRoute><AdminConfig /></AdminRoute>} />
        <Route path="/admin/create-employee" element={<AdminRoute><CreateEmployee /></AdminRoute>} />
        <Route path="/admin/requests"        element={<AdminRoute><Requests /></AdminRoute>} />
        <Route path="/admin/performance"     element={<AdminRoute><EmployeePerformance /></AdminRoute>} />
        <Route path="/admin/attendance"      element={<AdminRoute><EmployeeAttendance /></AdminRoute>} />

        {/* Employee routes */}
        <Route path="/employee/dashboard"    element={<EmployeeRoute><EmployeeDashboard /></EmployeeRoute>} />
        <Route path="/employee/customer-info"element={<EmployeeRoute><CustomerInfo /></EmployeeRoute>} />
        <Route path="/employee/add-customer" element={<EmployeeRoute><AddCustomer /></EmployeeRoute>} />
        <Route path="/employee/services"     element={<EmployeeRoute><Services /></EmployeeRoute>} />
        <Route path="/employee/attendance"    element={<EmployeeRoute><EmployeeAttendance /></EmployeeRoute>} />
        <Route path="/employee/reports"       element={<EmployeeRoute><EmployeeReports /></EmployeeRoute>} />
        <Route path="/employee/profile"       element={<EmployeeRoute><Profile Sidebar={EmployeeNavbar} /></EmployeeRoute>} />
        <Route path="/admin/profile"          element={<AdminRoute><Profile Sidebar={AdminSidebar} isAdmin={true} /></AdminRoute>} />
        

        {/* Customer routes */}
        <Route path="/customer/dashboard"     element={<CustomerRoute><CustomerDashboard /></CustomerRoute>} />
        <Route path="/customer/services"      element={<CustomerRoute><CustomerServices /></CustomerRoute>} />
        <Route path="/customer/transactions"  element={<CustomerRoute><CustomerTransactions /></CustomerRoute>} />
        <Route path="/customer/coins"         element={<CustomerRoute><CustomerCoins /></CustomerRoute>} />
        <Route path="/customer/kyc"           element={<CustomerRoute><CustomerKYC /></CustomerRoute>} />
        <Route path="/customer/offers"        element={<CustomerRoute><CustomerOffers /></CustomerRoute>} />
        <Route path="/customer/notifications" element={<CustomerRoute><CustomerNotifications /></CustomerRoute>} />
        <Route path="/customer/support"       element={<CustomerRoute><CustomerSupport /></CustomerRoute>} />
        <Route path="/customer/security"      element={<CustomerRoute><CustomerSecurity /></CustomerRoute>} />

        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}
