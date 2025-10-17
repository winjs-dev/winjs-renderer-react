import React from 'react';
import type { IRoute } from './types.js';

export interface IRouteContextType {
  route: IRoute;
}
export const RouteContext = React.createContext<IRouteContextType | undefined>(
  undefined,
);

export function useRouteData(): IRouteContextType {
  const ctx = React.useContext(RouteContext);
  if (!ctx) {
    throw new Error('useRouteData 必须在 RouteContext.Provider 内部使用');
  }
  return ctx;
}
