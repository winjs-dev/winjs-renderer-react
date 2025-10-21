/*
 * @FilePath: /winjs-renderer-react/src/index.ts
 */
export {
  createBrowserHistory,
  createHashHistory,
  createMemoryHistory,
  type History,
} from 'history';
export {
  createSearchParams,
  generatePath,
  Link,
  matchPath,
  matchRoutes,
  Navigate,
  NavLink,
  Outlet,
  resolvePath,
  useLocation,
  useMatch,
  useNavigate,
  useOutlet,
  useOutletContext,
  useParams,
  useResolvedPath,
  useRoutes,
  useSearchParams,
} from 'react-router';
export {
  useAppData,
  useClientLoaderData,
  useLoaderData,
  useRouteProps,
  useSelectedRoutes,
} from './appContext.js';
export { renderClient } from './browser.js';
export { useRouteData } from './routeContext.js';
export type { ClientLoader } from './types.js';
export { type RouteComponentProps, withRouter } from './withRouter.js';
