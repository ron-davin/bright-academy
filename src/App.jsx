import React, { useEffect } from 'react'
import { Routes, Route, Outlet, useLocation } from 'react-router-dom'
import Navbar from './components/marketing/Navbar.jsx'
import Footer from './components/marketing/Footer.jsx'
import AuthDialog from './components/marketing/AuthDialog.jsx'
import { Toaster } from './components/ui/index.jsx'
import AppShell from './components/app/AppShell.jsx'
import { MessagesPage } from './components/app/Shared.jsx'

import Home from './pages/marketing/Home.jsx'
import Courses from './pages/marketing/Courses.jsx'
import CourseDetail from './pages/marketing/CourseDetail.jsx'
import InstructorDetail, { InstructorsList } from './pages/marketing/Instructors.jsx'
import HowItWorks from './pages/marketing/HowItWorks.jsx'
import BecomeTeacher from './pages/marketing/BecomeTeacher.jsx'
import Results from './pages/marketing/Results.jsx'
import Trial from './pages/marketing/Trial.jsx'
import FindCourse from './pages/marketing/FindCourse.jsx'
import Cart, { Checkout } from './pages/marketing/Cart.jsx'
import { About, Contact, Support, Terms, Privacy, Costs, NotFound } from './pages/marketing/Static.jsx'

import TeacherDashboard from './pages/teacher/Dashboard.jsx'
import TeacherSessions from './pages/teacher/Sessions.jsx'
import { TeacherSchedule, TeacherAvailability } from './pages/teacher/ScheduleAvailability.jsx'
import TrialAssessments, { RescheduleRequests } from './pages/teacher/Trials.jsx'
import { TeacherStudents, TeacherGroups } from './pages/teacher/StudentsGroups.jsx'
import { TeacherHomework, TeacherLessons } from './pages/teacher/HomeworkLessons.jsx'
import { TeacherCourses, CourseProposals, TeacherRecordings } from './pages/teacher/CoursesRecordings.jsx'
import { TeacherFinances, TeacherPerformance, TeacherFeedback, ApprovalRequests } from './pages/teacher/FinanceFeedback.jsx'

import { ParentDashboard, ParentChildren, ParentEnrolled, ParentWishlist, ParentSchedule, ParentTrials, ParentAttendance, ParentProgress, ParentRecordings, ParentHomework, ParentCertificates, ParentFeedbackPage, ParentPayments } from './pages/parent/index.jsx'
import { StudentDashboard, StudentSessions, StudentSchedule, StudentRecordings, StudentCourses, StudentAttendance, StudentHomework, StudentTeachers, StudentFeedbackPage, StudentProgress, StudentCertificates } from './pages/student/index.jsx'
import { SettingsPage, HelpCenter } from './pages/shared/SettingsHelp.jsx'
import Classroom from './pages/shared/Classroom.jsx'
import CertificateView from './pages/shared/Certificate.jsx'

function ScrollToTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0, 0) }, [pathname]); return null }
function MarketingLayout() { return <div className="flex min-h-svh flex-col"><Navbar /><main className="flex-1"><Outlet /></main><Footer /></div> }

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/instructors" element={<InstructorsList />} />
          <Route path="/instructors/:slug" element={<InstructorDetail />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/become-teacher" element={<BecomeTeacher />} />
          <Route path="/results" element={<Results />} />
          <Route path="/trial" element={<Trial />} />
          <Route path="/find-course" element={<FindCourse />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/support" element={<Support />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/costs" element={<Costs />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<AppShell role="teacher" />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/messages" element={<MessagesPage />} />
          <Route path="/teacher/courses" element={<TeacherCourses />} />
          <Route path="/teacher/course-proposals" element={<CourseProposals />} />
          <Route path="/teacher/recordings" element={<TeacherRecordings />} />
          <Route path="/teacher/sessions" element={<TeacherSessions />} />
          <Route path="/teacher/trial-assessments" element={<TrialAssessments />} />
          <Route path="/teacher/schedule" element={<TeacherSchedule />} />
          <Route path="/teacher/availability" element={<TeacherAvailability />} />
          <Route path="/teacher/reschedule-requests" element={<RescheduleRequests />} />
          <Route path="/teacher/lessons" element={<TeacherLessons />} />
          <Route path="/teacher/homework" element={<TeacherHomework />} />
          <Route path="/teacher/students" element={<TeacherStudents />} />
          <Route path="/teacher/groups" element={<TeacherGroups />} />
          <Route path="/teacher/approval-requests" element={<ApprovalRequests />} />
          <Route path="/teacher/performance" element={<TeacherPerformance />} />
          <Route path="/teacher/finances" element={<TeacherFinances />} />
          <Route path="/teacher/feedback" element={<TeacherFeedback />} />
        </Route>

        <Route element={<AppShell role="parent" />}>
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
          <Route path="/parent/children" element={<ParentChildren />} />
          <Route path="/parent/enrolled-courses" element={<ParentEnrolled />} />
          <Route path="/parent/wishlist" element={<ParentWishlist />} />
          <Route path="/parent/schedule" element={<ParentSchedule />} />
          <Route path="/parent/trials" element={<ParentTrials />} />
          <Route path="/parent/attendance" element={<ParentAttendance />} />
          <Route path="/parent/progress" element={<ParentProgress />} />
          <Route path="/parent/recordings" element={<ParentRecordings />} />
          <Route path="/parent/homework" element={<ParentHomework />} />
          <Route path="/parent/certificates" element={<ParentCertificates />} />
          <Route path="/parent/feedback" element={<ParentFeedbackPage />} />
          <Route path="/parent/payments" element={<ParentPayments />} />
          <Route path="/parent/messages" element={<MessagesPage />} />
        </Route>

        <Route element={<AppShell role="student" />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/sessions" element={<StudentSessions />} />
          <Route path="/student/recordings" element={<StudentRecordings />} />
          <Route path="/student/schedule" element={<StudentSchedule />} />
          <Route path="/student/my-courses" element={<StudentCourses />} />
          <Route path="/student/attendance" element={<StudentAttendance />} />
          <Route path="/student/homework" element={<StudentHomework />} />
          <Route path="/student/my-teachers" element={<StudentTeachers />} />
          <Route path="/student/feedback" element={<StudentFeedbackPage />} />
          <Route path="/student/progress" element={<StudentProgress />} />
          <Route path="/student/certificates" element={<StudentCertificates />} />
          <Route path="/student/messages" element={<MessagesPage />} />
        </Route>

        <Route element={<AppShell />}>
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help-center" element={<HelpCenter />} />
        </Route>

        <Route path="/classroom/:sessionId" element={<Classroom />} />
        <Route path="/certificate/:certId" element={<CertificateView />} />
      </Routes>
      <AuthDialog />
      <Toaster />
    </>
  )
}
