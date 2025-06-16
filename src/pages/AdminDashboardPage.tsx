"use client"

import { useState, useEffect } from "react"
import { Layout } from "../components/layout/Layout"
import { Users, BookOpen, MessageSquare, AlertTriangle } from "lucide-react"
import { useAuthStore } from "../store/authStore"
import { Navigate } from "react-router-dom"
import { getAdminStats } from "../lib/supabase"

export const AdminDashboardPage = () => {
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    messages: 0,
    pendingMessages: 0,
  })

  // Проверяем права доступа
  if (!user || user.role !== "admin") {
    return <Navigate to="/" />
  }

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const { data, error } = await getAdminStats()
        if (error) throw error
        if (data) {
          setStats(data)
        }
      } catch (error: any) {
        console.error("Ошибка при загрузке статистики:", error)
        setError("Не удалось загрузить статистику")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    description,
  }: {
    title: string
    value: number
    icon: any
    color: string
    description?: string
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{isLoading ? "..." : value.toLocaleString()}</p>
          {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
        </div>
      </div>
    </div>
  )

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Панель администратора</h1>
          <p className="text-gray-600">Обзор основных показателей платформы</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
            <button onClick={() => window.location.reload()} className="ml-2 underline">
              Попробовать снова
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Всего пользователей"
            value={stats.users}
            icon={Users}
            color="bg-blue-500"
            description="Зарегистрированные пользователи"
          />

          <StatCard
            title="Курсы"
            value={stats.courses}
            icon={BookOpen}
            color="bg-green-500"
            description="Активные курсы"
          />

          <StatCard
            title="Сообщения в чатах"
            value={stats.messages}
            icon={MessageSquare}
            color="bg-purple-500"
            description="Всего сообщений"
          />

          <StatCard
            title="Ожидают модерации"
            value={stats.pendingMessages}
            icon={AlertTriangle}
            color="bg-orange-500"
            description="Непроверенные сообщения"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h2>
            <div className="space-y-3">
              <a
                href="/admin/users"
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Users size={20} className="text-blue-500 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Управление пользователями</h3>
                  <p className="text-sm text-gray-500">Просмотр и редактирование пользователей</p>
                </div>
              </a>

              <a
                href="/admin/courses"
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <BookOpen size={20} className="text-green-500 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Управление курсами</h3>
                  <p className="text-sm text-gray-500">Создание и редактирование курсов</p>
                </div>
              </a>

              <a
                href="/moderator/chat"
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <MessageSquare size={20} className="text-purple-500 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Модерация чатов</h3>
                  <p className="text-sm text-gray-500">Проверка сообщений в чатах</p>
                </div>
              </a>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Системная информация</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Версия платформы</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">База данных</span>
                <span className="font-medium text-green-600">Подключена</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Последнее обновление</span>
                <span className="font-medium">{new Date().toLocaleDateString("ru-RU")}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Статус системы</span>
                <span className="font-medium text-green-600">Работает</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
