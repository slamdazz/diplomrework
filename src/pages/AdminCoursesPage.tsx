"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Layout } from "../components/layout/Layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Plus, Edit, Trash2, Eye, BookOpen } from "lucide-react"
import type { Course } from "../types"
import { useAuthStore } from "../store/authStore"
import { Navigate, Link } from "react-router-dom"
import { getCourses, deleteCourse, createCourse, updateCourse } from "../lib/supabase"

export const AdminCoursesPage = () => {
  const { user } = useAuthStore()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLevel, setFilterLevel] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // Проверяем права доступа
  if (!user || user.role !== "admin") {
    return <Navigate to="/" />
  }

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const { data, error } = await getCourses()

        if (error) throw error

        if (data) {
          setCourses(data)
          setFilteredCourses(data)
        }
      } catch (error: any) {
        console.error("Ошибка при загрузке курсов:", error)
        setError("Не удалось загрузить курсы. Проверьте подключение к интернету.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])

  // Фильтрация курсов при изменении параметров поиска или фильтров
  useEffect(() => {
    const filtered = courses.filter((course) => {
      // Фильтр по поиску (название или описание)
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())

      // Фильтр по уровню сложности
      const matchesLevel = filterLevel === "" || course.level === filterLevel

      return matchesSearch && matchesLevel
    })

    setFilteredCourses(filtered)
  }, [courses, searchTerm, filterLevel])

  // Форматирование даты создания
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ru-RU")
  }

  // Получение названия уровня сложности на русском
  const getLevelName = (level: string) => {
    switch (level) {
      case "beginner":
        return "Начинающий"
      case "intermediate":
        return "Средний"
      case "advanced":
        return "Продвинутый"
      default:
        return "Неизвестно"
    }
  }

  // Получение цвета фона для уровня сложности
  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-blue-100 text-blue-800"
      case "advanced":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCreateCourse = () => {
    setSelectedCourse(null)
    setShowModal(true)
  }

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course)
    setShowModal(true)
  }

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const { error } = await deleteCourse(courseId)
      if (error) throw error

      setCourses(courses.filter((c) => c.id !== courseId))
      setShowDeleteConfirm(null)
    } catch (error: any) {
      console.error("Ошибка при удалении курса:", error)
      setError("Не удалось удалить курс")
    }
  }

  const handleModalSuccess = () => {
    // Перезагружаем курсы после успешного создания/редактирования
    const fetchCourses = async () => {
      try {
        const { data, error } = await getCourses()
        if (error) throw error
        if (data) {
          setCourses(data)
          setFilteredCourses(data)
        }
      } catch (error: any) {
        console.error("Ошибка при загрузке курсов:", error)
      }
    }
    fetchCourses()
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Управление курсами</h1>
            <Button onClick={handleCreateCourse} className="flex items-center">
              <Plus size={18} className="mr-1" />
              Создать курс
            </Button>
          </div>
          <p className="text-gray-600">Создавайте, редактируйте и управляйте курсами на платформе</p>
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
                placeholder="Поиск курсов..."
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Уровень сложности</label>
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  >
                    <option value="">Все уровни</option>
                    <option value="beginner">Начинающий</option>
                    <option value="intermediate">Средний</option>
                    <option value="advanced">Продвинутый</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterLevel("")
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
            <p className="mt-4 text-gray-600">Загрузка курсов...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-100">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Курсы не найдены</h3>
            <p className="text-gray-600 mb-6">Попробуйте изменить параметры поиска или создайте новый курс</p>
            <Button onClick={handleCreateCourse}>Создать первый курс</Button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Курс
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Уровень
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Продолжительность
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дата создания
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={course.image_url || "/placeholder.svg?height=40&width=40"}
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{course.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">{course.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getLevelColor(course.level)}`}
                        >
                          {getLevelName(course.level)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.duration} дней</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(course.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2">
                          <Link
                            to={`/courses/${course.id}`}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100"
                            title="Просмотреть"
                          >
                            <Eye size={18} />
                          </Link>
                          <button
                            onClick={() => handleEditCourse(course)}
                            className="text-blue-400 hover:text-blue-600 p-1 rounded-md hover:bg-blue-50"
                            title="Редактировать"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(course.id)}
                            className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50"
                            title="Удалить"
                          >
                            <Trash2 size={18} />
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

      {/* Модальное окно создания/редактирования курса */}
      {showModal && (
        <CourseModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
          course={selectedCourse}
        />
      )}

      {/* Подтверждение удаления */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Подтвердите удаление</h3>
            <p className="text-gray-600 mb-6">
              Вы уверены, что хотите удалить этот курс? Это действие нельзя отменить.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                Отмена
              </Button>
              <Button onClick={() => handleDeleteCourse(showDeleteConfirm)} className="bg-red-600 hover:bg-red-700">
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

// Компонент модального окна для создания/редактирования курсов
const CourseModal = ({
  isOpen,
  onClose,
  onSuccess,
  course,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  course?: Course | null
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    level: "beginner" as "beginner" | "intermediate" | "advanced",
    duration: 30,
    is_active: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!course

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        image_url: course.image_url,
        level: course.level,
        duration: course.duration,
        is_active: course.is_active ?? true,
      })
    } else {
      setFormData({
        title: "",
        description: "",
        image_url: "",
        level: "beginner",
        duration: 30,
        is_active: true,
      })
    }
    setError(null)
  }, [course, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isEditing && course) {
        const { error } = await updateCourse(course.id, formData)
        if (error) throw error
      } else {
        const { error } = await createCourse(formData)
        if (error) throw error
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || "Произошла ошибка при сохранении курса")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{isEditing ? "Редактировать курс" : "Создать курс"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название курса</label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Введите название курса"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              placeholder="Введите описание курса"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL изображения</label>
            <Input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              required
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Уровень сложности</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
              <option value="beginner">Начинающий</option>
              <option value="intermediate">Средний</option>
              <option value="advanced">Продвинутый</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Продолжительность (дни)</label>
            <Input
              type="number"
              min="1"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number.parseInt(e.target.value) })}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Активный курс
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Сохранение..." : isEditing ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
