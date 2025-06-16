"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "../ui/Button"
import { X } from "lucide-react"
import type { User, UserRole } from "../../types"
import { updateUserRole } from "../../lib/supabase"

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user: User | null
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSuccess, user }) => {
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
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            {user.avatar_url ? (
              <img
                src={user.avatar_url || "/placeholder.svg"}
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
