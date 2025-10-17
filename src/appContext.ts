import React from 'react';
import { matchRoutes, useLocation } from 'react-router';
import { useRouteData } from './routeContext.js';
import type {
  IClientRoute,
  ILoaderData,
  IRouteComponents,
  IRoutesById,
  ISelectedRoutes,
} from './types.js';

interface IAppContextType {
  routes: IRoutesById;
  routeComponents: IRouteComponents;
  clientRoutes: IClientRoute[];
  pluginManager: any;
  rootElement?: HTMLElement;
  basename?: string;
  clientLoaderData: ILoaderData;
  preloadRoute?: (to: string) => void;
  history?: any;
}

export const AppContext = React.createContext<IAppContextType>(
  {} as IAppContextType,
);

export function useAppData() {
  return React.useContext(AppContext);
}

export function useSelectedRoutes() {
  const location = useLocation();
  const { clientRoutes } = useAppData();
  // use `useLocation` get location without `basename`, not need `basename` param
  const routes = matchRoutes(clientRoutes as any, location.pathname) as
    | ISelectedRoutes[]
    | undefined;
  return routes || [];
}

export function useRouteProps<T extends Record<string, any> = any>(): T {
  const currentRoute = useSelectedRoutes().slice(-1);
  const route = currentRoute[0]?.route as any;
  if (!route) return {} as T;
  const { element: _, ...props } = route;
  return props as T;
}

// @deprecated  Please use `useLoaderData` instead.
export function useClientLoaderData() {
  const route = useRouteData();
  const appData = useAppData();
  return { data: appData.clientLoaderData[route.route.id] };
}

export function useLoaderData() {
  const clientLoaderData = useClientLoaderData();
  return clientLoaderData;
}
