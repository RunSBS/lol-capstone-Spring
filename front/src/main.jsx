import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import HomePage from './pages/HomePage.jsx'
import SummonerPage from './pages/SummonerPage.jsx'
import CommunityPage from './pages/CommunityPage.jsx'
import UserProfilePage from './pages/UserProfilePage.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/summoner/:nickname', element: <SummonerPage /> },
      { path: '/user/:username', element: <UserProfilePage /> },
      { path: '/community', element: <CommunityPage /> },
      { path: '/community/free', element: <CommunityPage /> },
      { path: '/community/guide', element: <CommunityPage /> },
      { path: '/community/lolmuncheol', element: <CommunityPage /> },
      { path: '/community/highrecommend', element: <CommunityPage /> },
      { path: '/community/post/:id', element: <CommunityPage /> },
      { path: '/community/write', element: <CommunityPage /> },
      { path: '/community/login', element: <CommunityPage /> },
      { path: '/community/register', element: <CommunityPage /> },
      { path: '/community/admin', element: <CommunityPage /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
