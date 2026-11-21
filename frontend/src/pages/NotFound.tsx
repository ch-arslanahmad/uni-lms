import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <p className="text-6xl font-bold tabular-nums text-blue-500">404</p>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The page you are looking for does not exist or was moved.
      </p>
      <Link to="/" className="mt-2">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}

export default NotFound;
