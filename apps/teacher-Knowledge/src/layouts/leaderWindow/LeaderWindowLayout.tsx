import { Outlet } from 'react-router-dom'
import { HeaderComponent } from './header'

const MainLayoutLeaderWindow = () => {
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