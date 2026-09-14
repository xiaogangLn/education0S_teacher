import { Outlet } from 'react-router-dom';
import { HeaderComponent } from './header';
import { useState } from 'react';
import { SidebarComponent } from '@/components/Sidebar';

const MainLayoutWorkbench = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-[#F0F4F9] h-screen w-screen overflow-hidden flex flex-col">
      {/* 顶部导航 - 固定高度 */}
      <header className="flex-shrink-0">
        <HeaderComponent />
      </header>

      {/* 主体布局：侧边栏 + 内容 - 占满剩余高度 */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* 侧边栏 - 固定宽度，不收缩 */}
        <div className="flex-shrink-0">
          <SidebarComponent collapsed={collapsed} onCollapse={setCollapsed} />
        </div>

        {/* 主内容区域 - 占满剩余宽度和高度 */}
        <main className="flex-1 overflow-y-auto p-4 px-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export { MainLayoutWorkbench };