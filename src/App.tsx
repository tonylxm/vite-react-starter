import { Navigate, Route, Routes } from "react-router";
import { RequireAuth } from "@/components/require-auth";
import { LoginPage } from "@/pages/login";
import { NotesPage } from "@/pages/notes";

// Deny by default: every route goes inside RequireAuth unless it's listed as public here.
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<NotesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
