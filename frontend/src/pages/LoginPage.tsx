import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { login } from "@/store/slices/authSlice";
import { loginSchema } from "@/validations/auth.validation";
import type { AppDispatch, RootState } from "@/store/index";
import type { LoginRequest } from "@/types/auth.types";
import { useTranslation } from "react-i18next";
import "./LoginPage.scss";

const LoginPage = () => {
  const { t } = useTranslation();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: yupResolver(loginSchema),
  });

  const handleLoginSubmit = async (data: LoginRequest) => {
    const result = await dispatch(login(data));

    if (login.fulfilled.match(result)) {
      const role = result.payload.role;
      if (role === "ADMIN") navigate("/dashboard");
      else if (role === "FONCTIONNAIRE") navigate("/fonctionnaire/dashboard");
      else if (["CHEF_HIERARCHIE", "CHEF_SERVICE", "CHEF_DIVISION", "DIRECTEUR"].includes(role))
        navigate("/chef/demandes");
      else if (role === "SIGNATAIRE") navigate("/signataire/demandes");
      else navigate("/dashboard");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">{t("auth.loginTitle")}</h1>

        <form onSubmit={handleSubmit(handleLoginSubmit)} noValidate>
          {error && <div className="login-error">{error}</div>}

          <div className="login-field">
            <label className="login-label" htmlFor="email">
              {t("auth.email")}
            </label>
            <input
              id="email"
              type="email"
              className={`login-input${errors.email ? " has-error" : ""}`}
              {...register("email")}
            />
            {errors.email && <p className="login-helper-text">{errors.email.message}</p>}
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="password">
              {t("auth.password")}
            </label>
            <input
              id="password"
              type="password"
              className={`login-input${errors.password ? " has-error" : ""}`}
              {...register("password")}
            />
            {errors.password && <p className="login-helper-text">{errors.password.message}</p>}
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? <span className="login-spinner" /> : t("auth.loginButton")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
