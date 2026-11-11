import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from './components/ui/index.jsx'
import AppShell from './components/app/AppShell.jsx'
import Home from './pages/public/Home.jsx'
import Login from './pages/public/Login.jsx'
import AdminSchedule from './pages/admin/Schedule.jsx'
import AdminClasses from './pages/admin/Classes.jsx'
import People from './pages/admin/People.jsx'
import Requests from './pages/admin/Requests.jsx'
import { TeacherToday, TeacherSchedule, TeacherStudents, TeacherAvailability } from './pages/teacher/index.jsx'
import { StudentToday, StudentSchedule, StudentClasses } from './pages/student/index.jsx'
import Settings from './pages/shared/Settings.jsx'
import Classroom from './pages/shared/Classroom.jsx'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) { const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 50); return () => clearTimeout(t) }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route element={<AppShell role="admin" />}>
          <Route path="/admin" element={<Navigate to="/admin/schedule" replace />} />
          <Route path="/admin/schedule" element={<AdminSchedule />} />
          <Route path="/admin/classes" element={<AdminClasses />} />
          <Route path="/admin/people" element={<People />} />
          <Route path="/admin/requests" element={<Requests />} />
        </Route>
        <Route element={<AppShell role="teacher" />}>
          <Route path="/teacher" element={<TeacherToday />} />
          <Route path="/teacher/schedule" element={<TeacherSchedule />} />
          <Route path="/teacher/students" element={<TeacherStudents />} />
          <Route path="/teacher/availability" element={<TeacherAvailability />} />
        </Route>
        <Route element={<AppShell role="student" />}>
          <Route path="/student" element={<StudentToday />} />
          <Route path="/student/schedule" element={<StudentSchedule />} />
          <Route path="/student/classes" element={<StudentClasses />} />
        </Route>
        <Route element={<AppShell />}>
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/class/:sessionId" element={<Classroom />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}
