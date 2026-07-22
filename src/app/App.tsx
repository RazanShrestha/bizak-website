import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./routes";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      {/* Transient submit feedback for the public forms (contact / partner / careers). */}
      <Toaster position="top-center" richColors />
    </>
  );
}
