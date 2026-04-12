import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
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
import FAQ from './pages/FAQ'
import TermsConditions from './pages/TermsConditions'
import './App.css'

const loginRoutes = [
  { path: '/login/customer', element: <LoginCustomer /> },
  { path: '/login/employee', element: <LoginEmployee /> },
  { path: '/login/superadmin', element: <LoginSuperAdmin /> },
]

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [pathname])
  return null
}

function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {loginRoutes.map(r => (
          <Route key={r.path} path={r.path} element={r.element} />
        ))}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/what-we-do" element={<Layout><WhatWeDo /></Layout>} />
        <Route path="/about" element={<Layout><About /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/faq" element={<Layout><FAQ /></Layout>} />
        <Route path="/terms" element={<Layout><TermsConditions /></Layout>} />
        <Route path="/product/:slug" element={<Layout><ProductDetails /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}
