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
import { SuperAdminRoute, AdminRoute, EmployeeRoute } from './components/ProtectedRoute'

// SuperAdmin Pages
import SuperAdminDashboard from './pages/superadmin/Dashboard'
import AdminsData from './pages/superadmin/AdminsData'
import EmployeesData from './pages/superadmin/EmployeesData'
import AttendanceData from './pages/superadmin/AttendanceData'
import ServicesData from './pages/superadmin/ServicesData'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import CreateEmployee from './pages/admin/CreateEmployee'
import Requests from './pages/admin/Requests'
import EmployeePerformance from './pages/admin/EmployeePerformance'
import EmployeeAttendance from './pages/admin/EmployeeAttendance'

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard'
import CustomerInfo from './pages/employee/CustomerInfo'
import AddCustomer from './pages/employee/AddCustomer'
import Services from './pages/employee/Services'

import './App.css'

const dashboardPrefixes = ['/superadmin', '/admin', '/employee']

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
        <Route path="/superadmin/dashboard" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
        <Route path="/superadmin/admins"    element={<SuperAdminRoute><AdminsData /></SuperAdminRoute>} />
        <Route path="/superadmin/employees" element={<SuperAdminRoute><EmployeesData /></SuperAdminRoute>} />
        <Route path="/superadmin/attendance"element={<SuperAdminRoute><AttendanceData /></SuperAdminRoute>} />
        <Route path="/superadmin/services"  element={<SuperAdminRoute><ServicesData /></SuperAdminRoute>} />

        {/* Admin routes */}
        <Route path="/admin/dashboard"       element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/create-employee" element={<AdminRoute><CreateEmployee /></AdminRoute>} />
        <Route path="/admin/requests"        element={<AdminRoute><Requests /></AdminRoute>} />
        <Route path="/admin/performance"     element={<AdminRoute><EmployeePerformance /></AdminRoute>} />
        <Route path="/admin/attendance"      element={<AdminRoute><EmployeeAttendance /></AdminRoute>} />

        {/* Employee routes */}
        <Route path="/employee/dashboard"    element={<EmployeeRoute><EmployeeDashboard /></EmployeeRoute>} />
        <Route path="/employee/customer-info"element={<EmployeeRoute><CustomerInfo /></EmployeeRoute>} />
        <Route path="/employee/add-customer" element={<EmployeeRoute><AddCustomer /></EmployeeRoute>} />
        <Route path="/employee/services"     element={<EmployeeRoute><Services /></EmployeeRoute>} />

        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}
