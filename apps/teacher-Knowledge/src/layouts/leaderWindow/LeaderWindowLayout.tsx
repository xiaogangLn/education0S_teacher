import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { HeaderComponent } from './header'
import { useAppSelector } from '@/store/hooks'
import { isLeaderRole } from '@/utils/currentUser'

const MainLayoutLeaderWindow = () => {
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.user.current)
  const token = useAppSelector((state) => state.user.token)

  useEffect(() => {
    const accessToken = token || localStorage.getItem('accessToken')
    if (!accessToken) {
      navigate('/', { replace: true })
      return
    }
    if (user && !isLeaderRole(user.role)) {
      navigate('/workbench', { replace: true })
    }
  }, [token, user, navigate])

  return (
    <div className="bg-[#F0F4F9] h-[100vh] w-[100wh] overflow-hidden">
      <header>
        <HeaderComponent />
      </header>

      <main className='p-4 px-6 h-[calc(100vh-110px)]'>
        <Outlet />
      </main>
    </div>
  )
}

export {
    MainLayoutLeaderWindow
}