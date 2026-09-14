import { Outlet } from 'react-router-dom'
import { HeaderComponent } from './header'

const MainLayoutWorkbench = () => {
  return (
    <div className="bg-[#F0F4F9] h-[100vh] w-full overflow-hidden">
      <header>
        <HeaderComponent />
      </header>

      <main className="box-border h-[calc(100vh-110px)] min-h-0 overflow-hidden p-4 px-6">
        <div className="h-full min-h-0">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export {
  MainLayoutWorkbench
}