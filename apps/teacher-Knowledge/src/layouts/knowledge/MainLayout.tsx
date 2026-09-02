import { Outlet } from 'react-router-dom'
import { HeaderComponent } from './header'

const MainLayoutKnowledge = () => {
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
    MainLayoutKnowledge
}