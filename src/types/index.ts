// === Database entity types ===

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  status: 'todo' | 'done'
  priority: 'high' | 'normal'
  section: 'today' | 'upcoming' | 'someday'
  due_date: string | null
  goal_id: string | null
  tags: string[] | null
  subtasks: Subtask[] | null
  created_at: string
  completed_at: string | null
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Habit {
  id: string
  user_id: string
  name: string
  frequency: 'daily' | 'weekly'
  color: string
  streak: number
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  completed_date: string
  created_at: string
}

export interface MoodEntry {
  id: string
  user_id: string
  date: string
  mood: 1 | 2 | 3 | 4 | 5
  journal_text: string | null
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  amount: number
  type: 'income' | 'expense'
  category: string
  merchant: string
  date: string
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  deadline: string | null
  created_at: string
}

export interface Milestone {
  id: string
  goal_id: string
  user_id: string
  title: string
  completed: boolean
  due_date: string | null
  created_at: string
}

export interface Note {
  id: string
  user_id: string
  title: string
  content: string
  updated_at: string
  created_at: string
}
