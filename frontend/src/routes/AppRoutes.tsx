import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/index";
import LoginPage from "../pages/LoginPage";
import { MainLayout } from "../components/templates/MainLayout";
import PrivateRoute from "./PrivateRoute";
import { StructurePage } from "../pages/Admin/StructurePage";
import { JourFeriePage } from "../pages/Admin/JourFeriePage";
import { FonctionnairePage } from "../pages/Admin/FonctionnairePage";
// Import your Quota view here 👇 (adjust path to match your project tree)
import QuotaManagementPage from "../pages/Admin/QuotaManagementPage";

const DashboardPlaceholder = () => (
  <div style={{ padding: "20px", fontSize: "1.2rem", color: "#333" }}>
    <h2>Bienvenue dans votre Tableau de Bord Central</h2>
    <p>C'est ici que s'afficheront vos statistiques de congés bientôt.</p>
  </div>
);

// AdminRoute is now a proper React component — hooks work here
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const role = useSelector((state: RootState) => state.auth.user?.role);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  // not logged in at all → go to login
  if (!accessToken) return <Navigate to="/login" replace />;

  // logged in but not admin → go to dashboard
  if (role !== "ADMIN") return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "/dashboard",
        element: <DashboardPlaceholder />,
      },
      {
        path: "/admin/structure",
        element: (
          <AdminRoute>
            <StructurePage />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/jours-feries",
        element: (
          <AdminRoute>
            <JourFeriePage />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/fonctionnaires",
        element: (
          <AdminRoute>
            <FonctionnairePage />
          </AdminRoute>
        ),
      },
      // Added Secure Quota Route Protection Wrapper Here 👇
      {
        path: "/admin/quotas",
        element: (
          <AdminRoute>
            <QuotaManagementPage />
          </AdminRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

const AppRoutes = () => {
  return <RouterProvider router={router} />;
};

export default AppRoutes;
