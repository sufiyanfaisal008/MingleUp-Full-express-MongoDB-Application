import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/login'
import Signup from './pages/signup'
import Post from './pages/posting'
import Profile from './pages/profile'
import Chatting from './pages/chat'
import OTP from './pages/otp'
import Forget from './pages/forget'
import ForgotPassword from './pages/forgotpassowrd'
import SinglePost from './components/SinglePost'
import axios from 'axios'
import { message } from 'antd'
import { baseURL } from './core'
import { useEffect } from 'react'
import { store } from './store/states'

function App() {
  const { globalLogin, globalLogout, user, islogin } = store()

  // console.log({ user, islogin })

  useEffect(() => {
    get_profile()
  }, [])

  const get_profile = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      if (globalLogout) globalLogout()
      return
    }

    try {
      const response = await axios.get(`${baseURL}/api/v1/profile`, {
        headers: {
          token: localStorage.getItem('token') 
        }
      })
      // console.log(response.data.data)
      globalLogin(response.data.data)
    } catch (error) {
      console.error(error)
      message.error(error?.response?.data?.message || error.message)
      if (globalLogout) globalLogout()
    }
  }

  return (
    <>
      {islogin == null ? <Loadingpage /> : null}

      {islogin == true ? (
        <Routes>
          <Route path="/" element={<Post />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/singlepost/:postId" element={<SinglePost />} />
          <Route path="/chat" element={<Chatting />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : null}

      {islogin == false ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/varify-email" element={<OTP />} />
          <Route path="/forget" element={<Forget />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : null}
    </>
  )
}

export default App