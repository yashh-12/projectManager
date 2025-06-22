import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements, Router } from "react-router-dom"
import App from './App.jsx'
import { Provider, useDispatch, useSelector } from "react-redux"
import store from './store/store.js'
import Layout from './components/Layout.jsx'
import LandingPage from './pages/LandingPage.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Login from './pages/Login.jsx'
import ProjectLayout from "./components/ProjectLayout.jsx"
import Signup from './pages/Signup.jsx'
import Verify from './pages/Verify.jsx'
import dashboardLoader from './loaderFunctions/dashboardLoader.js'
import ProjectPage from './pages/ProjectPage.jsx'
import Overview from './components/Overview.jsx'
import taskLoader from './loaderFunctions/taskLoader.js'

import Task from './components/Task.jsx'
import ProjectOverview from './components/ProjectOverview.jsx'
import Team from './components/Team.jsx'
import teamLoader from './loaderFunctions/teamLoader.js'
import overViewLoader from './loaderFunctions/overViewLoader.js'
import Chat from './components/Chat.jsx'
import { SocketProvider } from './provider/SocketProvider.jsx'
import { StreamProvider } from './provider/StreamProvide.jsx'
import VideoCall from './pages/VideoCall.jsx'



const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Layout />}>
      <Route path='/' element={<LandingPage />} />
      <Route path='/about' element={<About />} />
      <Route path='/contact' element={<Contact />} />
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<Signup />} />
      <Route path='/verify-email' element={<Verify />} />
      <Route path='/projects' loader={dashboardLoader} element={< ProjectLayout />}>
        <Route index loader={dashboardLoader} element={<Overview />} />
        <Route path=':projectId/' loader={dashboardLoader} element={<ProjectPage />} >
          <Route path='overview' loader={overViewLoader} element={<ProjectOverview />} />
          <Route path='tasks' loader={taskLoader} element={<Task />} />
          <Route path='teams' loader={teamLoader} element={<Team />} />
          <Route path='chat' element={<Chat />} />
          <Route path='videocall' element={<VideoCall />} />

        </Route>

      </Route>
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <SocketProvider>
      <StreamProvider>
        <RouterProvider router={router} />
      </StreamProvider>
    </SocketProvider>
  </Provider>
)
