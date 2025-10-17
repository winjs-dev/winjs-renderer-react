# @winner-fed/renderer-react

WinJS 框架的 React 渲染器，提供客户端渲染能力和 React Router 集成。

## 特性

- ✅ **React 19.x 支持** - 使用 React 19 的最新特性和并发渲染能力
- 🚦 **React Router v7 集成** - 最新的路由管理和导航能力
- 🎯 **多种路由模式** - 支持 Browser、Hash 和 Memory 路由
- 🔄 **插件系统集成** - 与 WinJS 插件系统无缝集成
- 📦 **TypeScript 支持** - 完整的类型定义
- 🎨 **应用上下文** - 通过 Context 访问路由和应用数据
- ⚡ **懒加载** - 内置代码分割和懒加载支持
- 🔗 **智能预加载** - Link 组件支持多种预加载策略
- 🌊 **流式渲染** - 支持 React 18 的 Suspense 流式渲染

## 安装

```bash
npm install @winner-fed/renderer-react
```

## 核心概念

### 客户端渲染

`renderClient` 是渲染 React 应用的主入口：

```tsx
import { renderClient } from '@winner-fed/renderer-react';

renderClient({
  rootElement: document.getElementById('root'),
  routes: routesById,
  routeComponents: routeComponents,
  pluginManager: pluginManager,
  basename: '/app',
  history: history,
});
```

### 路由配置

路由定义采用 WinJS 路由结构，会自动转换为 React Router 格式：

```tsx
const routesById = {
  'home': {
    id: 'home',
    path: '/',
    parentId: undefined,
  },
  'about': {
    id: 'about',
    path: '/about',
    parentId: undefined,
    clientLoader: async () => {
      return { data: 'About 页面数据' };
    },
  },
  'user': {
    id: 'user',
    path: '/user/:id',
    parentId: 'about',
  },
};

const routeComponents = {
  'home': HomePage,
  'about': AboutPage,
  'user': UserPage,
};
```

### 应用上下文

通过 `useAppData` Hook 访问应用数据：

```tsx
import { useAppData } from '@winner-fed/renderer-react';

function MyComponent() {
  const { routes, clientRoutes, pluginManager, basename, history } = useAppData();
  
  return <div>当前 basename: {basename}</div>;
}
```

## API 参考

### 函数

#### `renderClient(options)`

将 React 应用渲染到 DOM。

**参数：**

```tsx
interface RenderClientOpts {
  // 公共路径配置
  publicPath?: string;
  // 是否运行时配置 publicPath
  runtimePublicPath?: boolean;
  // 挂载元素 ID（微前端场景可能变化）
  mountElementId?: string;
  // 挂载的 DOM 元素
  rootElement?: HTMLElement;
  // 路由配置（按 ID 索引）
  routes: IRoutesById;
  // 路由组件映射
  routeComponents: IRouteComponents;
  // 插件管理器实例
  pluginManager: any;
  // 路由 base 路径
  basename?: string;
  // 加载中显示的组件
  loadingComponent?: React.ReactNode;
  // History 实例（browserHistory/hashHistory/memoryHistory）
  history: History;
  // 是否启用流式渲染（默认 true）
  useStream?: boolean;
  // 是否仅返回组件（用于测试）
  components?: boolean;
  // 渲染完成回调
  callback?: () => void;
}
```

**返回值：**

- 如果 `components: true`，返回 React 组件
- 否则直接渲染到 DOM，无返回值

#### `createClientRoutes({ routesById, routeComponents })`

将 WinJS 路由格式转换为 React Router 格式。

**参数：**

```tsx
{
  routesById: IRoutesById;
  routeComponents: Record<string, any>;
  parentId?: string;
  loadingComponent?: React.ReactNode;
  useStream?: boolean;
}
```

#### `__getRoot()`

获取当前的 React Root 实例（用于卸载等场景，如微前端）。

### Hooks

#### `useAppData()`

获取应用上下文数据：

```tsx
const { 
  routes,           // 路由配置
  routeComponents,  // 路由组件映射
  clientRoutes,     // 客户端路由树
  pluginManager,    // 插件管理器
  rootElement,      // 根元素
  basename,         // base 路径
  clientLoaderData, // 客户端加载的数据
  preloadRoute,     // 预加载路由函数
  history           // History 实例
} = useAppData();
```

#### `useLoaderData()`

获取当前路由的 clientLoader 加载的数据：

```tsx
function UserPage() {
  const { data } = useLoaderData();
  return <div>用户: {data.name}</div>;
}
```

#### `useClientLoaderData()`

> 已废弃，请使用 `useLoaderData()`

#### `useRouteProps()`

获取当前路由的属性（不包括 element）：

```tsx
function MyComponent() {
  const routeProps = useRouteProps();
  return <div>{routeProps.someCustomProp}</div>;
}
```

#### `useSelectedRoutes()`

获取当前匹配的路由链（从根到当前路由）：

```tsx
function Breadcrumb() {
  const routes = useSelectedRoutes();
  return (
    <div>
      {routes.map(r => <span key={r.route.id}>{r.route.path}</span>)}
    </div>
  );
}
```

### 组件

#### `<Link>`

带预加载功能的路由链接组件：

```tsx
import { Link } from '@winner-fed/renderer-react';

// 基础用法
<Link to="/about">关于我们</Link>

// 鼠标悬停时预加载（默认 50ms 延迟）
<Link to="/user" prefetch="intent">用户页面</Link>

// 渲染时立即预加载
<Link to="/dashboard" prefetch="render">控制台</Link>

// 进入视口时预加载
<Link to="/products" prefetch="viewport">产品列表</Link>

// 自定义预加载延迟
<Link to="/settings" prefetch="intent" prefetchTimeout={200}>设置</Link>
```

**预加载策略：**

- `intent` - 鼠标悬停时预加载（默认 50ms 延迟）
- `render` - 组件渲染时立即预加载
- `viewport` - 链接进入视口时预加载（提前 100px）
- `none` - 不预加载

#### `withRouter(Component)`

为类组件注入路由相关的 props：

```tsx
import { withRouter, RouteComponentProps } from '@winner-fed/renderer-react';

class MyComponent extends React.Component<RouteComponentProps> {
  handleClick = () => {
    this.props.history.push('/home');
  };
  
  render() {
    const { location, params, navigate } = this.props;
    return <div>当前路径: {location.pathname}</div>;
  }
}

export default withRouter(MyComponent);
```

注入的 props：

- `history` - 包含 `back()`, `goBack()`, `push()`, `replace()` 等方法
- `location` - 当前位置对象
- `match` - 包含路由参数
- `params` - 路由参数对象
- `navigate` - 导航函数

### React Router 导出

直接从 `react-router-dom` 重新导出的常用 API：

```tsx
import {
  // Hooks
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
  useMatch,
  useOutlet,
  useOutletContext,
  useResolvedPath,
  useRoutes,
  
  // 组件
  Navigate,
  NavLink,
  Outlet,
  
  // 工具函数
  createSearchParams,
  generatePath,
  matchPath,
  matchRoutes,
  resolvePath,
} from '@winner-fed/renderer-react';
```

### History 导出

从 `history` 包重新导出：

```tsx
import {
  createBrowserHistory,
  createHashHistory,
  createMemoryHistory,
  type History,
} from '@winner-fed/renderer-react';
```

## 类型定义

### `IRoute`

路由定义接口：

```tsx
interface IRoute {
  id: string;                    // 路由唯一标识
  path?: string;                 // 路由路径
  index?: boolean;               // 是否为索引路由
  parentId?: string;             // 父路由 ID
  redirect?: string;             // 重定向路径
  clientLoader?: ClientLoader;   // 客户端数据加载函数
  routeProps?: Record<string, any>; // 自定义路由属性
}
```

### `IClientRoute`

客户端路由接口（扩展自 IRoute）：

```tsx
interface IClientRoute extends IRoute {
  element?: React.ReactNode;       // 路由元素
  Component?: React.ComponentType; // 路由组件
  children?: IClientRoute[];       // 子路由
  routes?: IClientRoute[];         // 子路由（遗留）
}
```

### `IRoutesById`

路由映射表：

```tsx
interface IRoutesById {
  [id: string]: IRoute;
}
```

### `IRouteComponents`

路由组件映射表：

```tsx
interface IRouteComponents {
  [id: string]: any; // React 组件
}
```

### `ClientLoader`

客户端数据加载器：

```tsx
type ClientLoader = (() => Promise<any>) & {
  hydrate?: boolean; // 是否需要水合
};
```

## 插件系统集成

渲染器与 WinJS 插件系统深度集成，提供多个插件钩子：

### Provider 钩子（由内到外）

```tsx
// 1. innerProvider - 最内层 Provider
pluginManager.applyPlugins({
  type: 'modify',
  key: 'innerProvider',
  initialValue: App,
  args: { routes, history, plugin },
});

// 2. i18nProvider - 国际化 Provider
pluginManager.applyPlugins({
  type: 'modify',
  key: 'i18nProvider',
  initialValue: App,
  args: { routes, history, plugin },
});

// 3. accessProvider - 权限控制 Provider
pluginManager.applyPlugins({
  type: 'modify',
  key: 'accessProvider',
  initialValue: App,
  args: { routes, history, plugin },
});

// 4. dataflowProvider - 数据流 Provider
pluginManager.applyPlugins({
  type: 'modify',
  key: 'dataflowProvider',
  initialValue: App,
  args: { routes, history, plugin },
});

// 5. outerProvider - 最外层 Provider
pluginManager.applyPlugins({
  type: 'modify',
  key: 'outerProvider',
  initialValue: App,
  args: { routes, history, plugin },
});

// 6. rootContainer - 根容器
pluginManager.applyPlugins({
  type: 'modify',
  key: 'rootContainer',
  initialValue: App,
  args: { routes, history, plugin },
});
```

### 事件钩子

```tsx
// 修改客户端路由
pluginManager.applyPlugins({
  type: 'event',
  key: 'patchClientRoutes',
  args: { routes: clientRoutes },
});

// 路由变化事件
pluginManager.applyPlugins({
  type: 'event',
  key: 'onRouteChange',
  args: {
    routes,
    clientRoutes,
    location,
    action,
    basename,
    isFirst: boolean,
  },
});
```

## 使用示例

### 基础使用

```tsx
import { renderClient } from '@winner-fed/renderer-react';
import { createBrowserHistory } from '@winner-fed/renderer-react';

const history = createBrowserHistory();

renderClient({
  rootElement: document.getElementById('root'),
  routes: {
    'home': { id: 'home', path: '/' },
    'about': { id: 'about', path: '/about' },
  },
  routeComponents: {
    'home': () => <div>首页</div>,
    'about': () => <div>关于</div>,
  },
  pluginManager: pluginManager,
  history: history,
  basename: '/',
});
```

### 带数据加载

```tsx
const routes = {
  'user': {
    id: 'user',
    path: '/user/:id',
    clientLoader: async () => {
      const user = await fetchUser(params.id);
      return { user };
    },
  },
};

function UserPage() {
  const { data } = useLoaderData();
  return <div>用户: {data.user.name}</div>;
}
```

### 路由重定向

```tsx
const routes = {
  'old-path': {
    id: 'old-path',
    path: '/old',
    redirect: '/new',
  },
  'new-path': {
    id: 'new-path',
    path: '/new',
  },
};
```

### 嵌套路由

```tsx
const routes = {
  'layout': {
    id: 'layout',
    path: '/',
  },
  'home': {
    id: 'home',
    path: '/',
    index: true,
    parentId: 'layout',
  },
  'about': {
    id: 'about',
    path: 'about',
    parentId: 'layout',
  },
};

const routeComponents = {
  'layout': () => (
    <div>
      <nav>导航</nav>
      <Outlet />
    </div>
  ),
  'home': () => <div>首页内容</div>,
  'about': () => <div>关于内容</div>,
};
```

### 自定义路由属性

```tsx
const routes = {
  'protected': {
    id: 'protected',
    path: '/protected',
    routeProps: {
      requireAuth: true,
      keepQuery: true,
    },
  },
};

function ProtectedPage() {
  const routeProps = useRouteProps();
  if (routeProps.requireAuth && !isLoggedIn()) {
    return <Navigate to="/login" />;
  }
  return <div>受保护的内容</div>;
}
```

### 预加载路由

```tsx
import { Link, useAppData } from '@winner-fed/renderer-react';

function Navigation() {
  const { preloadRoute } = useAppData();
  
  // 程序化预加载
  const handleHover = () => {
    preloadRoute('/dashboard');
  };
  
  return (
    <nav>
      {/* 声明式预加载 */}
      <Link to="/home" prefetch="intent">首页</Link>
      <Link to="/products" prefetch="viewport">产品</Link>
      
      {/* 程序化预加载 */}
      <button onMouseEnter={handleHover}>控制台</button>
    </nav>
  );
}
```

## 内部实现

### 渲染流程

1. **路由转换**：将 WinJS 的路由格式（IRoutesById）转换为 React Router 格式（IClientRoute[]）
2. **插件集成**：应用插件系统的各种钩子（patchClientRoutes、onRouteChange 等）
3. **数据加载**：在路由变化时自动执行 clientLoader 并缓存数据
4. **Provider 包装**：应用多层 Provider（innerProvider → i18nProvider → accessProvider → dataflowProvider → outerProvider → rootContainer）
5. **React 渲染**：使用 React 18+ 的 createRoot API 渲染应用

### 路由转换规则

- 根据 `parentId` 构建嵌套路由树
- `index: true` 的路由转换为索引路由
- `redirect` 字段转换为 `Navigate` 组件
- `clientLoader` 保留在路由定义中，由渲染器管理数据加载

### 性能优化

- 使用 `useCallback` 避免不必要的函数重建
- clientLoader 数据全局缓存，避免重复加载
- 支持流式渲染（useStream），提升首屏加载速度
- 路由预加载支持，减少页面切换延迟

## 与其他包的关系

- **@winner-fed/preset-react**：为 WinJS 提供 React 支持，会自动设置渲染器路径为此包
- **@winner-fed/core**：通过插件管理器与核心系统集成
- **react-router**：基于 React Router v7 构建，重新导出其核心 API
- **history**：使用 History v5，支持多种路由模式（Browser/Hash/Memory）

## 常见问题

### 1. 如何在 clientLoader 中访问路由参数？

目前 clientLoader 不直接接收参数，但可以通过 `window.location` 或组件内部的 hooks 获取：

```tsx
const routes = {
  'user': {
    id: 'user',
    path: '/user/:id',
    clientLoader: async () => {
      // 方案 1：从 URL 解析参数
      const id = window.location.pathname.split('/').pop();
      return { user: await fetchUser(id) };
    },
  },
};
```

### 2. 如何在微前端场景下使用？

使用 `__getRoot()` 获取 React Root 实例，在卸载时调用 `root.unmount()`：

```tsx
import { renderClient, __getRoot } from '@winner-fed/renderer-react';

// 挂载
renderClient({ /* ... */ });

// 卸载
const root = __getRoot();
if (root) root.unmount();
```

### 3. 如何处理路由守卫？

通过插件系统的 `onRouteChange` 钩子实现：

```tsx
export default {
  onRouteChange({ location, routes }) {
    // 路由守卫逻辑
    if (needAuth && !isLoggedIn()) {
      history.push('/login');
    }
  },
};
```

### 4. 如何使用自定义 Loading 组件？

通过 `loadingComponent` 参数传入：

```tsx
renderClient({
  // ...
  loadingComponent: <CustomSpinner />,
});
```

### 5. Link 预加载何时触发？

- `intent`：鼠标悬停 50ms 后触发（可通过 `prefetchTimeout` 自定义）
- `render`：组件挂载时立即触发
- `viewport`：链接进入视口（提前 100px）时触发
- `none`：不预加载

## 许可证

MIT
