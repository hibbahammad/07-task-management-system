export const today = new Date()

const getDateOffset = (days, includeTime = false) => {
  const date = new Date()
  date.setDate(date.getDate() + days)

  if (!includeTime) {
    return date.toISOString().slice(0, 10)
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString()
}

export const defaultTasks = [
  {
    id: 'TASK-1001',
    title: 'Product launch checklist',
    description: 'Finalize launch assets, coordinate marketing, and confirm the rollout timeline.',
    status: 'In Progress',
    priority: 'High',
    category: 'Product',
    dueDate: getDateOffset(1),
    createdAt: getDateOffset(-7, true),
    updatedAt: getDateOffset(-1, true),
    tags: ['launch', 'marketing'],
  },
  {
    id: 'TASK-1002',
    title: 'Design review with stakeholders',
    description: 'Present the latest user flow updates and collect sign-off before quality assurance.',
    status: 'To Do',
    priority: 'Medium',
    category: 'Design',
    dueDate: getDateOffset(3),
    createdAt: getDateOffset(-6, true),
    updatedAt: getDateOffset(-2, true),
    tags: ['design', 'stakeholders'],
  },
  {
    id: 'TASK-1003',
    title: 'Customer onboarding follow-up',
    description: 'Send the welcome checklist and confirm milestone dates for the pilot cohort.',
    status: 'Completed',
    priority: 'Low',
    category: 'Customer Success',
    dueDate: getDateOffset(-1),
    createdAt: getDateOffset(-10, true),
    updatedAt: getDateOffset(-1, true),
    tags: ['clients', 'onboarding'],
  },
  {
    id: 'TASK-1004',
    title: 'Sprint planning session',
    description: 'Break down the next sprint scope and capture team dependencies before kickoff.',
    status: 'To Do',
    priority: 'High',
    category: 'Operations',
    dueDate: getDateOffset(5),
    createdAt: getDateOffset(-9, true),
    updatedAt: getDateOffset(-3, true),
    tags: ['planning', 'team'],
  },
  {
    id: 'TASK-1005',
    title: 'Bug triage for reporting dashboard',
    description: 'Investigate data sync issues and document the fix plan for reporting errors.',
    status: 'In Progress',
    priority: 'High',
    category: 'Engineering',
    dueDate: getDateOffset(-2),
    createdAt: getDateOffset(-8, true),
    updatedAt: getDateOffset(-1, true),
    tags: ['qa', 'dashboard'],
  },
  {
    id: 'TASK-1006',
    title: 'Quarterly goals review',
    description: 'Review team metrics and record action items for the next check-in.',
    status: 'Completed',
    priority: 'Medium',
    category: 'Leadership',
    dueDate: getDateOffset(-4),
    createdAt: getDateOffset(-12, true),
    updatedAt: getDateOffset(-4, true),
    tags: ['goals', 'review'],
  },
]
