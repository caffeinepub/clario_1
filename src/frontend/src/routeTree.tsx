import { Outlet, createRootRoute, createRoute } from "@tanstack/react-router";
import Layout from "./components/Layout";
import CompletedOrders from "./pages/CompletedOrders";
import Dashboard from "./pages/Dashboard";
import MakeOrder from "./pages/MakeOrder";
import PendingOrders from "./pages/PendingOrders";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: Layout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: Dashboard,
});

const makeOrderRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/make-order",
  component: MakeOrder,
});

const pendingOrdersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/pending-orders",
  component: PendingOrders,
});

const completedOrdersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/completed-orders",
  component: CompletedOrders,
});

export const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    dashboardRoute,
    makeOrderRoute,
    pendingOrdersRoute,
    completedOrdersRoute,
  ]),
]);
