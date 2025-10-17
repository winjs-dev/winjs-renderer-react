import { History } from 'history';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import ReactDOM from 'react-dom/client';
import { matchRoutes, Router, useRoutes } from 'react-router';
import { AppContext, useAppData } from './appContext';
import { createClientRoutes } from './routes';
import { ILoaderData, IRouteComponents, IRoutesById } from './types';
let root: ReactDOM.Root | null = null;

// react 18 some scenarios need unmount such as micro app
export function __getRoot() {
  return root;
}

/**
 * 这个组件的功能是 history 发生改变的时候重新触发渲染
 * @param props
 * @returns
 */
function BrowserRoutes(props: {
  routes: any;
  clientRoutes: any;
  pluginManager: any;
  history: History;
  basename: string;
  children: any;
}) {
  const { history } = props;
  const [state, setState] = React.useState({
    action: history.action,
    location: history.location,
  });
  useLayoutEffect(() => history.listen(setState), [history]);
  useLayoutEffect(() => {
    function onRouteChange(opts: any) {
      props.pluginManager.applyPlugins({
        key: 'onRouteChange',
        type: 'event',
        args: {
          routes: props.routes,
          clientRoutes: props.clientRoutes,
          location: opts.location,
          action: opts.action,
          basename: props.basename,
          isFirst: Boolean(opts.isFirst),
        },
      });
    }
    onRouteChange({
      location: state.location,
      action: state.action,
      isFirst: true,
    });
    return history.listen(onRouteChange);
  }, [history, props.routes, props.clientRoutes]);
  return (
    <Router
      navigator={history}
      location={state.location}
      basename={props.basename}
    >
      {props.children}
    </Router>
  );
}

export function Routes(): React.ReactElement | null {
  const { clientRoutes } = useAppData();
  return useRoutes(clientRoutes);
}

/**
 * umi 渲染需要的配置，在node端调用的哦
 */
export type RenderClientOpts = {
  /**
   * 配置 webpack 的 publicPath。
   * @doc https://umijs.org/docs/api/config#publicpath
   */
  publicPath?: string;
  /**
   * 是否是 runtimePublicPath
   * @doc https://umijs.org/docs/api/config#runtimepublicpath
   */
  runtimePublicPath?: boolean;
  /**
   * react dom 渲染的的目标节点 id
   * @doc 一般不需要改，微前端的时候会变化
   */
  mountElementId?: string;
  /**
   * react dom 渲染的的目标 dom
   * @doc 一般不需要改，微前端的时候会变化
   */
  rootElement?: HTMLElement;
  /**
   * 当前的路由配置
   */
  routes: IRoutesById;
  /**
   * 当前的路由对应的dom组件
   */
  routeComponents: IRouteComponents;
  /**
   * 插件的执行实例
   */
  pluginManager: any;
  /**
   * 设置路由 base，部署项目到非根目录下时使用。
   * @doc https://umijs.org/docs/api/config#base
   */
  basename?: string;
  /**
   * loading 中展示的组件 dom
   */
  loadingComponent?: React.ReactNode;
  /**
   * react router 的 history，用于控制列表渲染
   * @doc https://umijs.org/docs/api/config#history
   * 有多种不同的类型，测试的时候建议用 内存路由，默认是 browserHistory
   */
  history: History;
  /**
   * 是否启用流式渲染, 默认 true
   */
  useStream?: boolean;
  /**
   * 直接返回组件，是为了方便测试
   */
  components?: boolean;
  /**
   * 应用渲染完成的回调函数
   */
  callback?: () => void;
};

/**
 *
 * @param {RenderClientOpts} opts - 插件相关的配置
 * @param {React.ReactElement} routesElement 需要渲染的 routers，为了方便测试注入才导出
 * @returns @returns A function that returns a React component.
 */
const getBrowser = (
  opts: RenderClientOpts,
  routesElement: React.ReactElement,
) => {
  const basename = opts.basename || '/';
  const clientRoutes = createClientRoutes({
    routesById: opts.routes,
    routeComponents: opts.routeComponents,
    loadingComponent: opts.loadingComponent,
    useStream: opts.useStream,
  });
  opts.pluginManager.applyPlugins({
    key: 'patchClientRoutes',
    type: 'event',
    args: {
      routes: clientRoutes,
    },
  });

  let rootContainer = (
    <BrowserRoutes
      basename={basename}
      pluginManager={opts.pluginManager}
      routes={opts.routes}
      clientRoutes={clientRoutes}
      history={opts.history}
    >
      {routesElement}
    </BrowserRoutes>
  );

  const Browser = () => {
    const [clientLoaderData, setClientLoaderData] = useState<ILoaderData>({});

    const handleRouteChange = useCallback(
      (id: string) => {
        // Patched routes has to id
        const matchedRoutes = matchRoutes(clientRoutes as any, id, basename);
        const matchedRouteIds = (
          matchedRoutes?.map(
            // @ts-ignore
            (route) => route.route.id,
          ) || []
        ).filter(Boolean);
        matchedRouteIds.forEach((routeId) => {
          const clientLoader = opts.routes[routeId]?.clientLoader;
          const hasClientLoader = !!clientLoader;
          // client loader
          // onPatchClientRoutes 添加的 route 在 opts.routes 里是不存在的
          const hasClientLoaderDataInRoute = !!clientLoaderData[routeId];

          if (hasClientLoader && !hasClientLoaderDataInRoute) {
            clientLoader().then((data: any) => {
              setClientLoaderData((d: any) => ({ ...d, [routeId]: data }));
            });
          }
        });
      },
      [clientLoaderData],
    );

    useEffect(() => {
      handleRouteChange(window.location.pathname);
      return opts.history.listen((e) => {
        handleRouteChange(e.location.pathname);
      });
    }, []);

    useLayoutEffect(() => {
      if (typeof opts.callback === 'function') opts.callback();
    }, []);

    return (
      <AppContext.Provider
        value={{
          routes: opts.routes,
          routeComponents: opts.routeComponents,
          clientRoutes,
          pluginManager: opts.pluginManager,
          rootElement: opts.rootElement!,
          basename,
          clientLoaderData,
          preloadRoute: handleRouteChange,
          history: opts.history,
        }}
      >
        {rootContainer}
      </AppContext.Provider>
    );
  };
  return Browser;
};

/**
 *  执行 react dom 的 render 方法
 * @param {RenderClientOpts} opts - 插件相关的配置
 * @returns void
 */
export function renderClient(opts: RenderClientOpts) {
  const rootElement = opts.rootElement || document.getElementById('root')!;

  const Browser = getBrowser(opts, <Routes />);
  // 为了测试，直接返回组件
  if (opts.components) return Browser;

  if (ReactDOM.createRoot) {
    root = ReactDOM.createRoot(rootElement);
    root.render(<Browser />);
    return;
  }
  // @ts-ignore
  ReactDOM.render(<Browser />, rootElement);
}
