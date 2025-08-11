import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  name: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const Layout = ({ name, children, actions }: LayoutProps) => {
  const [isSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col bg-white h-screen">
      <Header actions={actions} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} selected={name} />

        <main className="flex-1 bg-background p-2 overflow-auto">
          <div className="container">{children}</div>
        </main>
      </div>
    </div>
  );
};
export default Layout;
