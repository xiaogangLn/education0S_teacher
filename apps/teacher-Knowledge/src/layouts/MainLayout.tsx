import { Outlet } from 'react-router-dom'
import { HeaderComponent } from './header'

const MainLayout = () => {
  return (
    <div className="bg-[#F0F4F9] h-[100vh] w-[100wh]">
      <header>
        <HeaderComponent />
      </header>

      <main className='p-4 px-6'>
        <Outlet />
      </main>
    </div>
  )
}

export {
    MainLayout
}