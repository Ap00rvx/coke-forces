import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage";
import ThemeToggle from "./components/theme-toggle";
import ProfilePage from "./pages/profilePage";

function App() {
  return (
    <Router>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profile/:handle" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;