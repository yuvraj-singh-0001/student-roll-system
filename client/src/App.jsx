import { useEffect } from "react";
import { warmUpBackend } from "./api";
import AppRouter from "./routes/router";

export default function App() {
  useEffect(() => {
    warmUpBackend();
  }, []);

  return <AppRouter />;
}
