import { useLocation } from 'react-router';
import { useAppData } from './appContext';

export function __useFetcher() {
  const { preloadRoute } = useAppData();
  const location = useLocation();
  return {
    load(path?: string) {
      if (preloadRoute) {
        preloadRoute(path || location.pathname);
      }
    },
  };
}
