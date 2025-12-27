import { useEffect } from 'react';

/**
 * Custom hook to set the page title dynamically
 * @param title - The title to set for the page
 * @param suffix - Optional suffix to append (defaults to site name)
 */
export const usePageTitle = (title: string, suffix: string = 'AJ Sports') => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} | ${suffix}` : suffix;
    
    return () => {
      document.title = previousTitle;
    };
  }, [title, suffix]);
};
