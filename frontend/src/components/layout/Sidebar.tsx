import { Link } from "react-router";
import { FiDollarSign, FiSettings } from "react-icons/fi";
import { LuLayoutDashboard, LuUsers, LuTag, LuShoppingBag } from "react-icons/lu";
import { TbFileInvoice } from "react-icons/tb";
import type { IconType } from "react-icons";

interface NavItem {
  path: string;
  label: string;
  icon: IconType;
}

const Sidebar = ({ selected, isOpen = true }: { selected: string; isOpen?: boolean }) => {
  const navItems: NavItem[] = [
    { path: "/app", label: "Dashboard", icon: LuLayoutDashboard },
    { path: "/", label: "Rechnungen", icon: TbFileInvoice },
    { path: "/customers", label: "Kunden", icon: LuUsers },
    { path: "/coupons", label: "Gutscheine", icon: LuTag },
    { path: "/inventory", label: "Inventar", icon: LuShoppingBag },
    { path: "/expenses", label: "Ausgaben", icon: FiDollarSign },
    { path: "/", label: "Einstellungen", icon: FiSettings },
  ];

  return (
    <div className="flex flex-col px-2 border-gray-300 border-r h-full">
      <nav className="flex-1 py-4">
        <ul className="m-0 p-0 list-none">
          {navItems.map((item) => (
            <li key={item.label} className="mb-1">
              <Link
                to={item.path}
                className={`flex items-center px-2 py-2 text-text rounded-lg transition-all duration-100 ${
                  selected === item.label
                    ? "bg-primary/30 font-bold"
                    : "hover:bg-primary/15"
                }`}>
                <item.icon className="text-lg" />
                {isOpen && <span className="ml-4">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {isOpen && (
        <div className="pb-4 text-sm text-center wrap-break-word">
          <p>
            © {new Date().getFullYear()} SwissCounts <br /> <i>by Luis Hutterli</i>
          </p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
