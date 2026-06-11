import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/index";
import LoginPage from "@/pages/LoginPage";
import { MainLayout } from "@/components/templates/MainLayout";
import PrivateRoute from "@/routes/PrivateRoute";
import { StructurePage } from "@/pages/Admin/StructurePage";
import { JourFeriePage } from "@/pages/Admin/JourFeriePage";
import { UserPage } from "@/pages/Admin/UserPage";
import QuotaManagementPage from "@/pages/Admin/QuotaManagementPage";
import { MesDemandePage } from "@/pages/MesDemandePage";
import ChefDashboardPage from "@/pages/Chefdashboardpage";
import SignatairePage from "@/pages/Signatairepage";
import AdminDashboardPage from "@/pages/Admin/Admindashboardpage";
import FonctionnaireDashboardPage from "@/pages/FonctionnaireDashboardPage";
import AuditPage from "@/pages/Admin/Auditpage";
import { ProfilePage } from "@/pages/ProfilePage";

// ── Role guards ───────────────────────────────────────────────────────────────

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const role = useSelector((state: RootState) => state.auth.user?.role);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  if (!accessToken) return <Navigate to="/login" replace />;
  if (role !== "ADMIN") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const ChefRoute = ({ children }: { children: React.ReactNode }) => {
  const role = useSelector((state: RootState) => state.auth.user?.role);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  if (!accessToken) return <Navigate to="/login" replace />;
  // CHEF_HIERARCHIE, CHEF_SERVICE, CHEF_DIVISION, DIRECTEUR all count as chef
  const chefRoles = ["CHEF_HIERARCHIE", "CHEF_SERVICE", "CHEF_DIVISION", "DIRECTEUR"];
  if (!role || !chefRoles.includes(role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const FonctionnaireRoute = ({ children }: { children: React.ReactNode }) => {
  const role = useSelector((state: RootState) => state.auth.user?.role);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  if (!accessToken) return <Navigate to="/login" replace />;
  if (role !== "FONCTIONNAIRE") return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const SignataireRoute = ({ children }: { children: React.ReactNode }) => {
  const role = useSelector((state: RootState) => state.auth.user?.role);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  if (!accessToken) return <Navigate to="/login" replace />;
  if (role !== "SIGNATAIRE") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// ── Router ────────────────────────────────────────────────────────────────────

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
        element: (
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        ),
      },
      // ── Fonctionnaire ──────────────────────────────────────────────────────
      {
        path: "/fonctionnaire/dashboard",
        element: (
          <FonctionnaireRoute>
            <FonctionnaireDashboardPage />
          </FonctionnaireRoute>
        ),
      },
      {
        path: "/mes-demandes",
        element: <MesDemandePage />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
      // ── Chef ──────────────────────────────────────────────────────────────
      {
        path: "/chef/demandes",
        element: (
          <ChefRoute>
            <ChefDashboardPage />
          </ChefRoute>
        ),
      },
      // ── Signataire ────────────────────────────────────────────────────────
      {
        path: "/signataire/demandes",
        element: (
          <SignataireRoute>
            <SignatairePage />
          </SignataireRoute>
        ),
      },
      // ── Admin ─────────────────────────────────────────────────────────────
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
            <UserPage />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/quotas",
        element: (
          <AdminRoute>
            <QuotaManagementPage />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/audit",
        element: (
          <AdminRoute>
            <AuditPage />
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
