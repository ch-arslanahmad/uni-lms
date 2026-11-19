import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { users } from "./models";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar user={users[0]} />
        <main className="flex-1">
          <AdminDashboard />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
