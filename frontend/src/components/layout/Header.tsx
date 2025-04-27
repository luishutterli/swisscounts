import { LuBell, LuUser } from "react-icons/lu";
import logo from "../../assets/swisscounts.svg";
import logoSquare from "../../assets/swisscounts-square.svg";

interface HeaderProps {
  actions?: React.ReactNode;
}

const Header = ({ actions }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-gray-300">
      <div className="flex items-end">
        <div>
          <img src={logo} alt="SwissCounts Logo" className="h-8 hidden md:block" />
          <img src={logoSquare} alt="SwissCounts Logo" className="h-16 block md:hidden" />
        </div>
        <p className="italic pl-1 text-xs hidden md:block">by Luis Hutterli</p>
      </div>

      <div className="flex items-center gap-4">
        {actions && <div className="actions">{actions}</div>}

        <button type="button" className="p-2 rounded-full hover:bg-primary/15">
          <LuBell className="text-xl" />
        </button>

        <button
          type="button"
          className="flex items-center gap-2 p-2 rounded-full hover:bg-primary/15">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <LuUser className="text-primary" />
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
