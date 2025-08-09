import { LuBell } from "react-icons/lu";
import logo from "../../assets/swisscounts.svg";
import logoSquare from "../../assets/swisscounts-square.svg";
import UserDropdown from "./UserDropdown";

interface HeaderProps {
  actions?: React.ReactNode;
}

const Header = ({ actions }: HeaderProps) => {
  return (
    <header className="flex justify-between items-center px-6 border-gray-300 border-b h-16">
      <div className="flex items-end">
        <div>
          <img src={logo} alt="SwissCounts Logo" className="hidden md:block h-8" />
          <img src={logoSquare} alt="SwissCounts Logo" className="md:hidden block h-16" />
        </div>
        <p className="hidden md:block pl-1 text-xs italic">by Luis Hutterli</p>
      </div>

      <div className="flex items-center gap-4">
        {actions && <div className="actions">{actions}</div>}

        <button type="button" className="hover:bg-primary/15 p-2 rounded-full">
          <LuBell className="text-xl" />
        </button>

        <UserDropdown />
      </div>
    </header>
  );
};

export default Header;
