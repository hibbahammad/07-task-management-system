import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'
import './App.css'
import { TaskProvider } from './context/taskProvider'
import { useTasks } from './context/useTasks'

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/tasks', label: 'All Tasks' },
  { to: '/tasks/my', label: 'My Tasks' },
  { to: '/tasks/completed', label: 'Completed' },
  { to: '/tasks/new', label: 'Create Task' },
  { to: '/settings', label: 'Settings' },
]

const statusOptions = ['All', 'To Do', 'In Progress', 'Completed']

const normalizeString = (value = '') => value.toString().trim().toLowerCase()

const formatDate = (value) => {
  if (!value) return 'No date'

  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const matchesQuery = (task, query) => {
  const search = normalizeString(query)

  if (!search) return true

  const haystack = [
    task.title,
    task.description,
    task.category,
    task.priority,
    ...(task.tags || []),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

const getStatusClass = (status) => `status-pill ${status.toLowerCase().replace(/\s+/g, '-')}`

const getPriorityClass = (priority) => `priority-badge priority-${priority.toLowerCase()}`

const getIsOverdue = (task) => {
  if (!task.dueDate || task.status === 'Completed') return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(task.dueDate)

  return dueDate < today
}

function App() {
  return (
    <BrowserRouter>
      <TaskProvider>
        <AppLayout />
      </TaskProvider>
    </BrowserRouter>
  )
}

function AppLayout() {
  const { tasks, searchQuery, setSearchQuery } = useTasks()
  const location = useLocation()

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === 'Completed').length
  const inProgressTasks = tasks.filter((task) => task.status === 'In Progress').length
  const pendingTasks = tasks.filter((task) => task.status === 'To Do').length
  const overdueTasks = tasks.filter((task) => getIsOverdue(task)).length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const quickStats = [
    { label: 'Total Tasks', value: totalTasks, tone: 'primary' },
    { label: 'Pending', value: pendingTasks, tone: 'neutral' },
    { label: 'In Progress', value: inProgressTasks, tone: 'warning' },
    { label: 'Completed', value: completedTasks, tone: 'success' },
    { label: 'Overdue', value: overdueTasks, tone: 'danger' },
    { label: 'Completion', value: `${completionRate}%`, tone: 'info' },
  ]

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-wrap">
          <div className="brand-mark">T</div>
          <div>
            <p className="eyebrow">Workspace</p>
            <h2>TaskFlow</h2>
          </div>
        </div>

        <nav className="nav-panel" aria-label="Sidebar navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-card">
          <p className="eyebrow">Focus score</p>
          <strong>{completionRate}%</strong>
          <span>Productivity pace</span>
        </div>
      </aside>

      <main className="content-panel">
        <header className="topbar">
          <div className="page-header-block">
            <p className="eyebrow">Overview</p>
            <h1>{location.pathname === '/' ? 'Dashboard' : 'Task Workspace'}</h1>
          </div>

          <div className="topbar-actions">
            <label className="searchbox" htmlFor="global-search">
              <span aria-hidden="true">⌕</span>
              <input
                id="global-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search tasks..."
              />
            </label>

            <Link to="/tasks/new" className="primary-button">
              Quick Add
            </Link>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<DashboardPage stats={quickStats} />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/my" element={<MyTasksPage />} />
          <Route path="/tasks/completed" element={<CompletedTasksPage />} />
          <Route path="/tasks/new" element={<TaskFormPage mode="create" key="new-task" />} />
          <Route path="/tasks/:taskId/edit" element={<TaskFormPage mode="edit" key={location.pathname} />} />
          <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}

function DashboardPage({ stats }) {
  const { tasks, searchQuery } = useTasks()

  const filteredTasks = useMemo(
    () => tasks.filter((task) => matchesQuery(task, searchQuery)),
    [tasks, searchQuery],
  )

  const recentTasks = [...filteredTasks]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 4)

  const upcomingTasks = [...filteredTasks]
    .filter((task) => task.status !== 'Completed' && task.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4)

  const statusCounts = {
    'To Do': filteredTasks.filter((task) => task.status === 'To Do').length,
    'In Progress': filteredTasks.filter((task) => task.status === 'In Progress').length,
    Completed: filteredTasks.filter((task) => task.status === 'Completed').length,
  }

  return (
    <div className="page-stack">
      <section className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className={`stat-card ${stat.tone}`}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </section>

      <section className="dashboard-grid">
        <div className="panel-card section-panel">
          <div className="panel-header">
            <h3>Recent tasks</h3>
            <Link to="/tasks">View all</Link>
          </div>

          <div className="stacked-list">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => (
                <Link key={task.id} to={`/tasks/${task.id}`} className="mini-task-item">
                  <div>
                    <strong>{task.title}</strong>
                    <span>{task.category}</span>
                  </div>
                  <span className={getStatusClass(task.status)}>{task.status}</span>
                </Link>
              ))
            ) : (
              <p className="empty-note">No tasks match your current search.</p>
            )}
          </div>
        </div>

        <div className="panel-card section-panel">
          <div className="panel-header">
            <h3>Upcoming deadlines</h3>
            <Link to="/tasks/my">My tasks</Link>
          </div>

          <div className="stacked-list">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <div key={task.id} className="mini-task-item">
                  <div>
                    <strong>{task.title}</strong>
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                  <span className={getPriorityClass(task.priority)}>{task.priority}</span>
                </div>
              ))
            ) : (
              <p className="empty-note">No upcoming work in this view.</p>
            )}
          </div>
        </div>
      </section>

      <section className="panel-card section-panel">
        <div className="panel-header">
          <h3>Status overview</h3>
        </div>

        <div className="status-chart" aria-label="Task status overview">
          {Object.entries(statusCounts).map(([label, count]) => (
            <div key={label} className="status-row">
              <div className="status-label-row">
                <span>{label}</span>
                <strong>{count}</strong>
              </div>
              <div className="progress-bar">
                <span
                  style={{
                    width: `${filteredTasks.length > 0 ? (count / filteredTasks.length) * 100 : 0}%`,
                  }}
                  className={`progress-fill ${label.toLowerCase().replace(/\s+/g, '-')}`}
                ></span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function TasksPage() {
  const { tasks, searchQuery, updateTask } = useTasks()
  const [filter, setFilter] = useState('All')

  const visibleTasks = useMemo(() => {
    return tasks
      .filter((task) => matchesQuery(task, searchQuery))
      .filter((task) => (filter === 'All' ? true : task.status === filter))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  }, [tasks, searchQuery, filter])

  return (
    <div className="page-stack">
      <section className="panel-card section-panel">
        <div className="panel-header">
          <h3>All tasks</h3>
          <Link to="/tasks/new" className="secondary-button">
            Create task
          </Link>
        </div>

        <div className="filter-row" aria-label="Task status filter">
          {statusOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={filter === option ? 'filter-chip active' : 'filter-chip'}
              onClick={() => setFilter(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="task-grid">
          {visibleTasks.length > 0 ? (
            visibleTasks.map((task) => (
              <TaskCard key={task.id} task={task} onStatusChange={updateTask} />
            ))
          ) : (
            <div className="empty-state">
              <h4>No tasks found</h4>
              <p>Try a different filter or add a fresh task to the board.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function MyTasksPage() {
  const { tasks, searchQuery, updateTask } = useTasks()

  const visibleTasks = useMemo(() => {
    return tasks
      .filter((task) => task.status !== 'Completed')
      .filter((task) => matchesQuery(task, searchQuery))
      .sort((a, b) => new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31'))
  }, [tasks, searchQuery])

  return (
    <div className="page-stack">
      <section className="panel-card section-panel">
        <div className="panel-header">
          <h3>My tasks</h3>
        </div>

        <div className="task-grid compact-grid">
          {visibleTasks.length > 0 ? (
            visibleTasks.map((task) => (
              <TaskCard key={task.id} task={task} onStatusChange={updateTask} />
            ))
          ) : (
            <div className="empty-state">
              <h4>You are all caught up</h4>
              <p>No active work remains in your queue.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function CompletedTasksPage() {
  const { tasks, searchQuery, updateTask } = useTasks()

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status === 'Completed').filter((task) => matchesQuery(task, searchQuery)),
    [tasks, searchQuery],
  )

  return (
    <div className="page-stack">
      <section className="panel-card section-panel">
        <div className="panel-header">
          <h3>Completed tasks</h3>
        </div>

        <div className="task-grid compact-grid">
          {completedTasks.length > 0 ? (
            completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} onStatusChange={updateTask} />
            ))
          ) : (
            <div className="empty-state">
              <h4>No completed tasks</h4>
              <p>New wins will appear here once they are marked complete.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function TaskCard({ task, onStatusChange }) {
  return (
    <article className="task-card">
      <div className="task-card-header">
        <span className={getPriorityClass(task.priority)}>{task.priority}</span>
        <span className={getStatusClass(task.status)}>{task.status}</span>
      </div>

      <div className="task-body">
        <h4>{task.title}</h4>
        <p>{task.description}</p>
      </div>

      <div className="task-meta-row">
        <span>{task.category}</span>
        <span>{formatDate(task.dueDate)}</span>
      </div>

      <div className="tag-list">
        {(task.tags || []).map((tag) => (
          <span key={`${task.id}-${tag}`} className="tag-pill">
            #{tag}
          </span>
        ))}
      </div>

      <div className="task-footer">
        <label className="status-select-wrap">
          <span>Update</span>
          <select
            value={task.status}
            onChange={(event) => onStatusChange(task.id, { status: event.target.value })}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </label>

        <div className="action-row">
          <Link to={`/tasks/${task.id}`}>View</Link>
          <Link to={`/tasks/${task.id}/edit`}>Edit</Link>
        </div>
      </div>
    </article>
  )
}

function TaskFormPage({ mode }) {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const { tasks, addTask, updateTask } = useTasks()

  const existingTask = tasks.find((task) => task.id === taskId)

  const [form, setForm] = useState(() => ({
    title: existingTask?.title || '',
    description: existingTask?.description || '',
    status: existingTask?.status || 'To Do',
    priority: existingTask?.priority || 'Medium',
    category: existingTask?.category || 'General',
    dueDate: existingTask?.dueDate || '',
    tags: existingTask?.tags?.join(', ') || '',
  }))
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const validationErrors = {}
    if (!form.title.trim()) {
      validationErrors.title = 'Task title is required.'
    }
    if (!form.description.trim()) {
      validationErrors.description = 'Task description is required.'
    }
    if (!form.dueDate) {
      validationErrors.dueDate = 'Due date is required.'
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const taskPayload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      category: form.category.trim() || 'General',
      dueDate: form.dueDate,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    }

    if (mode === 'edit' && existingTask) {
      updateTask(existingTask.id, taskPayload)
      navigate(`/tasks/${existingTask.id}`)
      return
    }

    const createdTask = addTask(taskPayload)
    navigate(`/tasks/${createdTask.id}`)
  }

  return (
    <div className="page-stack">
      <section className="panel-card form-panel">
        <div className="panel-header">
          <h3>{mode === 'edit' ? 'Edit task' : 'Create a new task'}</h3>
          <Link to="/tasks" className="secondary-button">
            Back to tasks
          </Link>
        </div>

        <form className="task-form" onSubmit={handleSubmit} noValidate>
          <div className="field-grid">
            <div className="field-group full-span">
              <label htmlFor="title">Task title</label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Quarterly product wrap-up"
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="field-group full-span">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows="5"
                value={form.description}
                onChange={handleChange}
                placeholder="Summarize the key goals and deliverables for this task..."
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
            </div>

            <div className="field-group">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={form.status} onChange={handleChange}>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="priority">Priority</label>
              <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="field-group">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Product"
              />
            </div>

            <div className="field-group">
              <label htmlFor="dueDate">Due date</label>
              <input id="dueDate" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
              {errors.dueDate && <span className="error-text">{errors.dueDate}</span>}
            </div>

            <div className="field-group full-span">
              <label htmlFor="tags">Tags</label>
              <input
                id="tags"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="marketing, launch, design"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              {mode === 'edit' ? 'Save changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function TaskDetailPage() {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const { tasks, deleteTask, updateTask } = useTasks()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const task = tasks.find((entry) => entry.id === taskId)

  if (!task) {
    return <NotFoundPage />
  }

  const handleDelete = () => {
    deleteTask(task.id)
    setShowDeleteConfirm(false)
    navigate('/tasks')
  }

  return (
    <div className="page-stack">
      <section className="panel-card detail-panel">
        <div className="detail-hero">
          <div>
            <p className="eyebrow">Task details</p>
            <h3>{task.title}</h3>
          </div>

          <div className="detail-actions">
            <Link to={`/tasks/${task.id}/edit`} className="secondary-button">
              Edit
            </Link>
            <button type="button" className="danger-button" onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </button>
          </div>
        </div>

        <div className="detail-layout">
          <div className="detail-content">
            <div className="detail-summary">
              <span className={getStatusClass(task.status)}>{task.status}</span>
              <span className={getPriorityClass(task.priority)}>{task.priority}</span>
            </div>

            <p className="detail-description">{task.description}</p>

            <div className="info-grid">
              <div>
                <span className="label">Category</span>
                <strong>{task.category}</strong>
              </div>
              <div>
                <span className="label">Due date</span>
                <strong>{formatDate(task.dueDate)}</strong>
              </div>
              <div>
                <span className="label">Created</span>
                <strong>{formatDate(task.createdAt)}</strong>
              </div>
              <div>
                <span className="label">Updated</span>
                <strong>{formatDate(task.updatedAt)}</strong>
              </div>
            </div>

            <div className="tag-list detail-tags">
              {(task.tags || []).map((tag) => (
                <span key={`${task.id}-${tag}`} className="tag-pill">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <aside className="mini-panel">
            <h4>Quick actions</h4>
            <label className="status-select-wrap detail-status">
              <span>Change status</span>
              <select
                value={task.status}
                onChange={(event) => updateTask(task.id, { status: event.target.value })}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </label>
            <p className="task-id">Task ID: {task.id}</p>
          </aside>
        </div>
      </section>

      {showDeleteConfirm && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Delete task confirmation">
          <div className="modal-card">
            <h3>Delete task</h3>
            <p>
              Are you sure you want to permanently remove <strong>{task.title}</strong> from your local task list?
            </p>
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button type="button" className="danger-button" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="page-stack">
      <section className="panel-card section-panel settings-panel">
        <div className="panel-header">
          <h3>Profile & Settings</h3>
        </div>

        <div className="profile-card">
          <div className="avatar">MC</div>
          <div>
            <h4>Maya Chen</h4>
            <p>Product Manager</p>
          </div>
        </div>

        <div className="settings-grid">
          <div className="settings-tile">
            <span>Email</span>
            <strong>maya.chen@taskflow.io</strong>
          </div>
          <div className="settings-tile">
            <span>Team</span>
            <strong>Product Operations</strong>
          </div>
          <div className="settings-tile">
            <span>Time zone</span>
            <strong>UTC-5</strong>
          </div>
          <div className="settings-tile">
            <span>Preferences</span>
            <strong>Weekly summaries enabled</strong>
          </div>
        </div>
      </section>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="page-stack">
      <section className="panel-card empty-state not-found-panel">
        <h3>404 — Page not found</h3>
        <p>The page you are looking for cannot be found.</p>
        <Link to="/" className="primary-button back-home">
          Go to dashboard
        </Link>
      </section>
    </div>
  )
}

export default App
