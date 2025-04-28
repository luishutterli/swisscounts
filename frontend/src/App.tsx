import { Link } from "react-router";
import Button from "./components/ui/Button";
import { useUserStore } from "./util/zustand";
import { useEffect } from "react";

const App = () => {
  const { user, setUser } = useUserStore();

  useEffect(() => {
    setUser("Max Muster");
    console.log("re")
  }, [setUser]);
  
  return (
    <div>
      <h1>Welcome {user}</h1>
      <Link to="/app">
        <Button>Dashboard</Button>
      </Link>
    </div>
  );
};

export default App;
