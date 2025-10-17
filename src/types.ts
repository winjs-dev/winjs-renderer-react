import type React from 'react';
import type { RouteMatch, RouteObject } from 'react-router';

export type ClientLoader = (() => Promise<any>) & {
  hydrate?: boolean;
};

export interface IRouteConventionExportProps {
  routeProps?: Record<string, any>;
}

export interface IRoute extends IRouteConventionExportProps {
  id: string;
  path?: string;
  index?: boolean;
  parentId?: string;
  redirect?: string;
  clientLoader?: ClientLoader;
}

export interface IClientRoute extends IRoute {
  element?: React.ReactNode;
  Component?: React.ComponentType<any>;
  children?: IClientRoute[];
  // compatible with @ant-design/pro-layout
  routes?: IClientRoute[];
}

export interface ISelectedRoute extends IRoute, RouteObject {}

export interface ISelectedRoutes extends RouteMatch {
  route: ISelectedRoute;
}

export interface IRoutesById {
  [id: string]: IRoute;
}

export interface IRouteComponents {
  [id: string]: any;
}

export interface ILoaderData {
  [routeKey: string]: any;
}
