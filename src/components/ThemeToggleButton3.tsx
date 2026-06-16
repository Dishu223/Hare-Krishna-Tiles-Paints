import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from './ThemeProvider';

export const ThemeToggleButton3 = ({
  className = "",
}: {
  className?: string;
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`relative w-10 h-10 rounded-full transition-all duration-300 active:scale-95 flex items-center justify-center ${
        isDark ? "bg-black text-white border-white/20" : "bg-white text-black border-black/10"
      } border shadow-sm ${className}`}
      onClick={toggleTheme}
      aria-label="Toggle Dark Mode"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        fill="currentColor"
        strokeLinecap="round"
        viewBox="0 0 32 32"
        className="w-5 h-5"
      >
        <clipPath id="skiper-btn-3">
          <motion.path
            animate={{ y: isDark ? 14 : 0, x: isDark ? -11 : 0 }}
            transition={{ ease: "easeInOut", duration: 0.35 }}
            d="M0-11h25a1 1 0 0017 13v30H0Z"
          />
        </clipPath>
        <g clipPath="url(#skiper-btn-3)">
          <motion.circle
            animate={{ scale: isDark ? 0.6 : 1 }}
            transition={{ ease: "easeInOut", duration: 0.35 }}
            cx="16"
            cy="16"
            r="11"
          />
        </g>
        <motion.g
          animate={{ scale: isDark ? 1 : 0, opacity: isDark ? 1 : 0 }}
          transition={{ ease: "easeInOut", duration: 0.35 }}
        >
          <path d="M16 2a1 1 0 00-1 1v2a1 1 0 002 0V3a1 1 0 00-1-1z" />
          <path d="M16 27a1 1 0 00-1 1v2a1 1 0 002 0v-2a1 1 0 00-1-1z" />
          <path d="M26 16a1 1 0 001-1h2a1 1 0 000-2h-2a1 1 0 00-1 1z" />
          <path d="M5 16a1 1 0 00-1-1H2a1 1 0 000 2h2a1 1 0 001-1z" />
          <path d="M23.071 8.929a1 1 0 00.707-.293l1.414-1.414a1 1 0 00-1.414-1.414l-1.414 1.414a1 1 0 00.707 1.707z" />
          <path d="M8.929 23.071a1 1 0 00-.707.293l-1.414 1.414a1 1 0 101.414 1.414l1.414-1.414a1 1 0 00-.707-1.707z" />
          <path d="M23.071 23.071a1 1 0 00-.707.293l1.414 1.414a1 1 0 101.414-1.414l-1.414-1.414a1 1 0 00-.707 1.707z" />
          <path d="M8.929 8.929a1 1 0 00.707-.293L8.222 7.222a1 1 0 00-1.414 1.414l1.414 1.414a1 1 0 00.707-1.707z" />
        </motion.g>
      </svg>
    </button>
  );
};
