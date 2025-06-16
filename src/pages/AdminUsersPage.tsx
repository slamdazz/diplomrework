"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Layout } from "../components/layout/Layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, User, MoreVertical } from "lucide-react"
import type { User as UserType, UserRole } from "../types"
import { useAuthStore } from "../store/authStore"
import { Navigate } from "react-router-dom"
import { supabase, updateUserRole } from "../lib/supabase"

export const AdminUsersPage = () => {
  const { user } = useAuthStore()
  const [users, setUsers] = useState<UserType[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)

  // Проверяем права доступа
  if (!user || user.role !== "admin") {
    return <Navigate to="/" />
  }

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

        if (error) throw error

        if (data) {
          setUsers(data)
          setFilteredUsers(data)
        }
      } catch (error: any) {
        console.error("Ошибка при загрузке пользователей:", error)
        setError("Не удалось загрузить пользователей. Проверьте подключение к интернету.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Фильтрация пользователей при изменении параметров поиска или фильтров
  useEffect(() => {
    const filtered = users.filter((user) => {
      // Фильтр по поиску (имя или email)
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())

      // Фильтр по роли
      const matchesRole = filterRole === "" || user.role === filterRole

      return matchesSearch && matchesRole
    })

    setFilteredUsers(filtered)
  }, [users, searchTerm, filterRole])

  // Форматирование даты регистрации
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU")
  }

  // Получение названия роли на русском
  const getRoleName = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "Администратор"
      case "moderator":
        return "Модератор"
      case "user":
        return "Пользователь"
      default:
        return "Неизвестно"
    }
  }

  // Получение цвета фона для роли
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "moderator":
        return "bg-purple-100 text-purple-800"
      case "user":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleEditUser = (user: UserType) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const handleUserModalSuccess = () => {
    // Перезагружаем пользователей после успешного изменения роли
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

        if (error) throw error
        if (data) {
          setUsers(data)
          setFilteredUsers(data)
        }
      } catch (error: any) {
        console.error("Ошибка при загрузке пользователей:", error)
      }
    }
    fetchUsers()
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Управление пользователями</h1>
          <p className="text-gray-600">Просмотр и редактирование информации о пользователях</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
            <button onClick={() => window.location.reload()} className="ml-2 underline">
              Попробовать снова
            </button>
          </div>
        )}

        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Поиск пользователей..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center">
              <Filter size={18} className="mr-2" />
              Фильтры
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Роль пользователя</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="">Все роли</option>
                    <option value="user">Пользователи</option>
                    <option value="moderator">Модераторы</option>
                    <option value="admin">Администраторы</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterRole("")
                  }}
                  className="mr-2"
                >
                  Сбросить
                </Button>
                <Button size="sm" onClick={() => setShowFilters(false)}>
                  Применить
                </Button>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600">Загрузка пользователей...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-100">
            <User size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Пользователи не найдены</h3>
            <p className="text-gray-600">Попробуйте изменить параметры поиска или фильтры</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Пользователь
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Роль
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата регистрации
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.avatar_url ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.avatar_url || "/placeholder.svg?height=40&width=40"}
                                alt=""
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">ID: {user.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}
                        >
                          {getRoleName(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-400 hover:text-blue-600 p-1 rounded-md hover:bg-blue-50"
                            title="Изменить роль"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно изменения роли пользователя */}
      {showUserModal && selectedUser && (
        <UserModal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          onSuccess={handleUserModalSuccess}
          user={selectedUser}
        />
      )}
    </Layout>
  )
}

// Компонент модального окна для изменения роли пользователя
const UserModal = ({
  isOpen,
  onClose,
  onSuccess,
  user,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user: UserType | null
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("user")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role)
    }
    setError(null)
  }, [user, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await updateUserRole(user.id, selectedRole)
      if (error) throw error

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || "Произошла ошибка при изменении роли пользователя")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !user) return null

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "Администратор"
      case "moderator":
        return "Модератор"
      case "user":
        return "Пользователь"
      default:
        return "Неизвестно"
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Изменить роль пользователя</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            {user.avatar_url ? (
              <img
                src={user.avatar_url || "/placeholder.svg?height=48&width=48"}
                alt={user.username}
                className="h-12 w-12 rounded-full mr-3"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-lg font-medium text-blue-600">{user.username.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900">{user.username}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-400">Текущая роль: {getRoleName(user.role)}</p>
            </div>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Новая роль</label>
            <div className="space-y-2">
              {(["user", "moderator", "admin"] as UserRole[]).map((role) => (
                <label key={role} className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={selectedRole === role}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    {getRoleName(role)}
                    {role === "admin" && <span className="text-xs text-gray-500 ml-1">(полный доступ)</span>}
                    {role === "moderator" && <span className="text-xs text-gray-500 ml-1">(модерация чатов)</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading || selectedRole === user.role}>
              {isLoading ? "Сохранение..." : "Изменить роль"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
