import { useState } from "react";
import { Card } from "./ui/card";

interface CardsInfo {
  num: number;
  title: string;
}

let cards: CardsInfo[] = [
  { num: 10, title: "Total Students" },
  { num: 5, title: "Total Teachers" },
  { num: 3, title: "Total Courses" },
];

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

      {
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <Card key={card.title + card.num} className="mt-4 p-4">
              <h2 className="text-lg font-bold">{card.num}</h2>
              <p>{card.title}</p>
            </Card>
          ))}
        </div>
      }
    </div>
  );
}

export default Dashboard;
