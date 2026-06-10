import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/index";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  // not logged in → redirect to login
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // logged in → show the page
  return <>{children}</>;
};

export default PrivateRoute;
