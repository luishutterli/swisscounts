import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  name: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const Layout = ({ name, children, actions }: LayoutProps) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header actions={actions} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} selected={name} />

        <main className="flex-1 p-2 overflow-auto bg-background">
          <div className="container">{children}</div>
        </main>
      </div>
    </div>
  );
};
export default Layout;
