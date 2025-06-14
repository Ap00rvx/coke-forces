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
    window.location.href = '/api/students/csv';
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl font-bold text-gray-900 dark:text-white font-trade-winds"
            >
                <span>
                    <img src="/coke.png" alt="" srcSet=""  className='inline-block h-8 w-8 mr-2'
                    />
                </span>
              Coke Forces
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
              {currentTime}
            </span>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors w-40"
              aria-label="Toggle theme"
            >
              
            
              {theme === "dark" ? "🌞 Light Mode" : "🌚 Dark Mode"}
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Export to CSV
            </button>
             <button
              onClick={() => window.location.href = 'https://github.com/Ap00rvx/coke-forces.git'}
              className="p-0 bg-white rounded-full text-black dark:text-white cursor-pointer   transition-colors text-sm font-medium"
            >
              <img src="/git.png" alt="" className='
                inline-block h-12 w-12 
              '/>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;