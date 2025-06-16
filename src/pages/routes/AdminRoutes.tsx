import { Routes, Route } from "react-router-dom"
import { AdminDashboardPage } from "../pages/AdminDashboardPage"
import { AdminUsersPage } from "../pages/AdminUsersPage"
import { AdminCoursesPage } from "../pages/AdminCoursesPage"
import { ChatModerationPage } from "../pages/ChatModerationPage"

export const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/courses" element={<AdminCoursesPage />} />
      <Route path="/moderator/chat" element={<ChatModerationPage />} />
    </Routes>
  )
}
