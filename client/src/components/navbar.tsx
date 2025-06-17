import { useState, useEffect } from 'react';

const Navbar = () => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored === "dark" || stored === "light") return stored;
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    }
    return "light";
  });
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleString());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleExport = () => {
    window.location.href = 'https://coke-forces-server.onrender.com/api/students/csv';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-trade-winds flex items-center"
            >
              <img
                src="/coke.png"
                alt="Coke Forces Logo"
                className="inline-block h-6 w-6 sm:h-8 sm:w-8 mr-2"
              />
              Coke Forces
            </a>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {currentTime}
            </span>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "🌞 Light Mode" : "🌚 Dark Mode"}
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Export to CSV
            </button>
            <a
              href="https://github.com/Ap00rvx/coke-forces.git"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-full bg-white dark:bg-white-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <img
                src="/git.png"
                alt="GitHub"
                className="inline-block h-8 w-8 sm:h-10 sm:w-10"
              />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700 transition-all duration-300 ease-in-out">
            <div className="flex flex-col items-center space-y-2 py-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {currentTime}
              </span>
              <button
                onClick={toggleTheme}
                className="w-full max-w-xs px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? "🌞 Light Mode" : "🌚 Dark Mode"}
              </button>
              <button
                onClick={handleExport}
                className="w-full max-w-xs px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Export to CSV
              </button>
              <a
                href="https://github.com/Ap00rvx/coke-forces.git"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <img
                  src="/git.png"
                  alt="GitHub"
                  className="inline-block h-8 w-8"
                />
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;