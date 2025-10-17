// @ts-ignore
import React from 'react';
import { generatePath, Navigate, useLocation, useParams } from 'react-router';
import { useRouteProps } from './appContext';
import { RouteContext } from './routeContext';
import { IClientRoute, IRoute, IRoutesById } from './types';

export function createClientRoutes(opts: {
  routesById: IRoutesById;
  routeComponents: Record<string, any>;
  parentId?: string;
  loadingComponent?: React.ReactNode;
  useStream?: boolean;
}) {
  const { routesById, parentId, routeComponents, useStream = true } = opts;
  return Object.keys(routesById)
    .filter((id) => routesById[id].parentId === parentId)
    .map((id) => {
      const route = createClientRoute({
        route: routesById[id],
        routeComponent: routeComponents[id],
        loadingComponent: opts.loadingComponent,
        useStream,
      });
      const children = createClientRoutes({
        routesById,
        routeComponents,
        parentId: route.id,
        loadingComponent: opts.loadingComponent,
        useStream,
      });
      if (children.length > 0) {
        route.children = children;
        route.routes = children;
      }
      return route;
    });
}

function NavigateWithParams(props: { to: string }) {
  const params = useParams();
  let to = generatePath(props.to, params);
  const routeProps = useRouteProps();
  const location = useLocation();
  if (routeProps?.keepQuery) {
    const queryAndHash = location.search + location.hash;
    to += queryAndHash;
  }
  const propsWithParams = {
    ...props,
    to,
  };
  return <Navigate replace={true} {...propsWithParams} />;
}

function createClientRoute(opts: {
  route: IRoute;
  routeComponent: any;
  loadingComponent?: React.ReactNode;
  hasChildren?: boolean;
  useStream?: boolean;
}): IClientRoute {
  const { route, useStream = true } = opts;
  const { redirect, ...props } = route;
  const Remote = RemoteComponent;
  return {
    element: redirect ? (
      <NavigateWithParams to={redirect} />
    ) : (
      <RouteContext.Provider
        value={{
          route: opts.route,
        }}
      >
        <Remote
          loader={React.memo(opts.routeComponent)}
          loadingComponent={opts.loadingComponent || DefaultLoading}
          hasChildren={opts.hasChildren}
          useStream={useStream}
        />
      </RouteContext.Provider>
    ),
    ...props,
  };
}

function DefaultLoading() {
  return <div />;
}

function RemoteComponent(props: any) {
  const Component = props.loader;
  return props.useStream ? (
    <React.Suspense fallback={<props.loadingComponent />}>
      <Component />
    </React.Suspense>
  ) : (
    <Component />
  );
}
