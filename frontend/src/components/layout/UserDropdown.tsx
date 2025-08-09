import { useState, useRef, useEffect } from "react";
import { LuUser, LuLogOut, LuSettings } from "react-icons/lu";
import { useAuth } from "@luishutterli/auth-kit-react";

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const handleSettings = () => {
    setIsOpen(false);
  };

  const userName = user?.name && user?.surname 
    ? `${user.name} ${user.surname}`
    : user?.email || "User";
  const userEmail = user?.email || "";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="flex items-center gap-2 hover:bg-primary/15 p-2 rounded-full cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}>
        <div className="flex justify-center items-center bg-primary/20 rounded-full w-8 h-8">
          <LuUser className="text-primary" />
        </div>
      </button>

      {isOpen && (
        <div className="top-full right-0 z-50 absolute bg-white shadow-lg mt-2 py-2 border border-gray-200 rounded-lg w-64">
          <div className="px-4 py-3 border-gray-100 border-b">
            <div className="flex items-center gap-3">
              <div className="flex justify-center items-center bg-primary/20 rounded-full w-10 h-10">
                <LuUser className="text-primary text-lg" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {userName}
                </p>
                {userEmail && (
                  <p className="text-gray-500 text-xs truncate">
                    {userEmail}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="py-1">
            <button
              type="button"
              className="flex items-center gap-3 hover:bg-gray-50 px-4 py-2 w-full text-gray-700 text-sm transition-colors cursor-pointer"
              onClick={handleSettings}>
              <LuSettings className="text-gray-400" />
              Settings
            </button>
            
            <button
              type="button"
              className="flex items-center gap-3 hover:bg-red-50 px-4 py-2 w-full text-red-600 text-sm transition-colors cursor-pointer"
              onClick={handleLogout}>
              <LuLogOut className="text-red-500" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
