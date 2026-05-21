import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import { MainLayout } from "../components/templates/MainLayout";
import PrivateRoute from "./PrivateRoute";
import { StructurePage } from "../pages/Admin/StructurePage";
import { JourFeriePage } from "../pages/Admin/JourFeriePage"; // 👈 Import your holiday component
import { FonctionnairePage } from "../pages/Admin/FonctionnairePage";

const DashboardPlaceholder = () => (
  <div style={{ padding: "20px", fontSize: "1.2rem", color: "#333" }}>
    <h2>Bienvenue dans votre Tableau de Bord Central</h2>
    <p>C'est ici que s'afficheront vos statistiques de congés bientôt.</p>
  </div>
);

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
        element: <StructurePage />,
      },
      {
        path: "/admin/jours-feries", // 👈 Connect the holiday path layout
        element: <JourFeriePage />,
      },

      {
        path: "/admin/fonctionnaires", // 👈 Maps the employee directory route path
        element: <FonctionnairePage />,
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
