import { useMemo, useState, useEffect } from 'react'
import { TaskContext } from './taskContext'

const STORAGE_KEY = 'task-manager-v1'

const createTaskId = () =>
  `TASK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

const getDateOffset = (days, includeTime = false) => {
  const date = new Date()
  date.setDate(date.getDate() + days)

  if (!includeTime) {
    return date.toISOString().slice(0, 10)
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString()
}

const defaultTasks = [
  {
    id: 'TASK-1',
    title: 'Product launch checklist',
    description: 'Finalize launch assets, coordinate marketing, and confirm the rollout timeline for this week.',
    status: 'In Progress',
    priority: 'High',
    category: 'Product',
    dueDate: getDateOffset(1),
    createdAt: getDateOffset(-7, true),
    updatedAt: getDateOffset(-1, true),
    tags: ['launch', 'marketing'],
  },
  {
    id: 'TASK-2',
    title: 'Design review with stakeholders',
    description: 'Present the latest user flow updates and collect sign-off before moving into QA.',
    status: 'To Do',
    priority: 'Medium',
    category: 'Design',
    dueDate: getDateOffset(2),
    createdAt: getDateOffset(-6, true),
    updatedAt: getDateOffset(-2, true),
    tags: ['design', 'stakeholders'],
  },
  {
    id: 'TASK-3',
    title: 'Customer onboarding follow-up',
    description: 'Send the welcome checklist, answer questions, and confirm next milestone dates for the pilot cohort.',
    status: 'Completed',
    priority: 'Low',
    category: 'Customer Success',
    dueDate: getDateOffset(-1),
    createdAt: getDateOffset(-10, true),
    updatedAt: getDateOffset(-1, true),
    tags: ['clients', 'onboarding'],
  },
  {
    id: 'TASK-4',
    title: 'Sprint planning session',
    description: 'Break down the next sprint scope, align dependencies, and capture risks before kickoff.',
    status: 'To Do',
    priority: 'High',
    category: 'Operations',
    dueDate: getDateOffset(4),
    createdAt: getDateOffset(-9, true),
    updatedAt: getDateOffset(-3, true),
    tags: ['planning', 'team'],
  },
  {
    id: 'TASK-5',
    title: 'Bug triage for reporting dashboard',
    description: 'Investigate data sync issues, reproduce the latest dashboard errors, and document the fix plan.',
    status: 'In Progress',
    priority: 'High',
    category: 'Engineering',
    dueDate: getDateOffset(-2),
    createdAt: getDateOffset(-8, true),
    updatedAt: getDateOffset(-1, true),
    tags: ['qa', 'dashboard'],
  },
  {
    id: 'TASK-6',
    title: 'Quarterly goals review',
    description: 'Review team metrics, ensure goals remain aligned, and record action items for the next check-in.',
    status: 'Completed',
    priority: 'Medium',
    category: 'Leadership',
    dueDate: getDateOffset(-3),
    createdAt: getDateOffset(-12, true),
    updatedAt: getDateOffset(-4, true),
    tags: ['goals', 'review'],
  },
]

const safeParse = (value) => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const loadTasks = () => {
  if (typeof window === 'undefined') return defaultTasks

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return defaultTasks

  const parsed = safeParse(stored)
  return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultTasks
}

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(loadTasks)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const addTask = (taskInput) => {
    const newTask = {
      ...taskInput,
      id: createTaskId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: Array.isArray(taskInput.tags) ? taskInput.tags : [],
    }

    setTasks((current) => [newTask, ...current])
    return newTask
  }

  const updateTask = (id, updates) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              ...updates,
              updatedAt: new Date().toISOString(),
              tags: Array.isArray(updates.tags) ? updates.tags : task.tags,
            }
          : task,
      ),
    )
  }

  const deleteTask = (id) => {
    setTasks((current) => current.filter((task) => task.id !== id))
  }

  const contextValue = useMemo(
    () => ({
      tasks,
      searchQuery,
      setSearchQuery,
      addTask,
      updateTask,
      deleteTask,
    }),
    [tasks, searchQuery],
  )

  return <TaskContext.Provider value={contextValue}>{children}</TaskContext.Provider>
}

