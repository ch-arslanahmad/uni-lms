import Navbar from "./components/Navbar";
import { users } from "./models";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <div>
        <Navbar user={users[0]} />
        <AdminDashboard />
      </div>
    </BrowserRouter>
  );
}

export default App;
