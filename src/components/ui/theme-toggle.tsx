"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { SunIcon, MoonIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      </button>
    );
  }

  function cycle() {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  }

  const Icon =
    theme === "dark" ? MoonIcon : theme === "system" ? ComputerDesktopIcon : SunIcon;

  const label =
    theme === "dark" ? "Dark" : theme === "system" ? "System" : "Light";

  return (
    <button
      onClick={cycle}
      className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={`Theme: ${label}. Click to cycle.`}
    >
      <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      <span className="text-xs text-gray-600 dark:text-gray-400 hidden lg:inline">
        {label}
      </span>
    </button>
  );
}
