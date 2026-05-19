import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import LoginPage from "../pages/LoginPage";

// define all routes as objects
// we will add more routes here as we build features
const router = createBrowserRouter([
  {
    // redirect root to login
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    // public route — no token needed
    path: "/login",
    element: <LoginPage />,
  },
  // protected routes will be added here later like:
  // {
  //     path: '/dashboard',
  //     element: (
  //         <PrivateRoute>
  //             <DashboardPage />
  //         </PrivateRoute>
  //     )
  // }
]);

const AppRoutes = () => {
  // RouterProvider replaces BrowserRouter
  // it takes the router object we defined above
  return <RouterProvider router={router} />;
};

export default AppRoutes;
