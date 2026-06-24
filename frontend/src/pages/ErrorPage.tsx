import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store/index";
import "./ErrorPage.scss";

const ErrorPage = () => {
  const { t } = useTranslation();
  const error = useRouteError();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  let title: string;
  let message: string;

  if (isRouteErrorResponse(error)) {
    title = `${error.status}`;
    message = error.statusText || t("error.notFound");
  } else {
    title = t("error.generic");
    message = t("error.internal");
  }

  const handleGoHome = () => {
    if (!accessToken) {
      navigate("/login");
      return;
    }

    const role = user?.role;
    if (role === "ADMIN") navigate("/dashboard");
    else if (role === "FONCTIONNAIRE") navigate("/fonctionnaire/dashboard");
    else if (["CHEF_HIERARCHIE", "CHEF_SERVICE", "CHEF_DIVISION", "DIRECTEUR"].includes(role ?? ""))
      navigate("/chef/demandes");
    else if (role === "SIGNATAIRE") navigate("/signataire/demandes");
    else navigate("/dashboard");
  };

  return (
    <div className="error-page">
      <div className="error-code">{title}</div>
      <h1 className="error-title">{t("error.oups")}</h1>
      <p className="error-message">{message}</p>
      <button className="error-button" onClick={handleGoHome}>
        {t("error.goHome")}
      </button>
    </div>
  );
};

export default ErrorPage;
