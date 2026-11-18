import { useState } from "react";
import Navbar from "./components/Navbar";
import { users } from "./models";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <>
      <div>
        <Navbar user={users[0]} />
        <Dashboard name={users[0].name} />
      </div>
    </>
  );
}

export default App;
