import Navbar from "./components/Navbar";
import { users } from "./models";
import Dashboard from "./components/Dashboard";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <div>
        <Navbar user={users[0]} />
        <Dashboard name={users[0].name} />
      </div>
    </BrowserRouter>
  );
}

export default App;
