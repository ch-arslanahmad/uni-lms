import { useState } from "react";

function Dashboard({ name }: { name: string }) {
  const [count, setCount] = useState(0);
  return (
    <div className="p-10 gap-1">
      <div className="flex gap-2">
        <h1 className="text-2xl font-bold font-serif">Hello {name}</h1>
        <span className=" text-white bg-blue-400 rounded-2xl content-center px-3 p text-sm font-semibold">
          {count}
        </span>
      </div>
      <br />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => setCount((count) => count + 1)}
      >
        Click me
      </button>
    </div>
  );
}

export default Dashboard;
