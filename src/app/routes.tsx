import { createBrowserRouter } from 'react-router'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/modules/Dashboard'
import Tasks from './components/modules/Tasks'
import Habits from './components/modules/Habits'
import Mood from './components/modules/Mood'
import Finance from './components/modules/Finance'
import Goals from './components/modules/Goals'
import Notes from './components/modules/Notes'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'tasks', element: <Tasks /> },
      { path: 'habits', element: <Habits /> },
      { path: 'mood', element: <Mood /> },
      { path: 'finance', element: <Finance /> },
      { path: 'goals', element: <Goals /> },
      { path: 'notes', element: <Notes /> },
    ],
  },
])
