import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import "./login.css";
import { applyPasswordReset, verifyResetCode } from "../../services/auth";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("oobCode");
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!oobCode) {
        setMessage("Codigo invalido o expirado.");
        return;
      }
      try {
        setLoading(true);
        const mail = await verifyResetCode(oobCode);
        setEmail(mail);
        setMessage("");
      } catch (error) {
        console.error("Error verificando codigo:", error);
        setMessage(error.message || "Codigo invalido o expirado.");
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [oobCode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (!oobCode) return;
    if (!password || password.length < 6) {
      setMessage("La nueva contrasena debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Las contrasenas no coinciden.");
      return;
    }
    try {
      setLoading(true);
      await applyPasswordReset(oobCode, password);
      setMessage("Contrasena actualizada. Ahora puedes iniciar sesion.");
      setIsSuccess(true);
      setTimeout(() => navigate("/"), 1800);
    } catch (error) {
      console.error("Error restableciendo contrasena:", error);
      setMessage(error.message || "No se pudo restablecer la contrasena.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-page">
        <header className="login-header">
          <div className="logo-circle">
            <span>SS</span>
          </div>
          <div>
            <h1 className="brand">SkillSwapp</h1>
            <p className="tagline">Restablece tu acceso</p>
          </div>
        </header>

        <div className="welcome">
          <h2>Ingresa tu nueva contrasena</h2>
          {email && <p>Cuenta: {email}</p>}
        </div>

        <div className="card login-panel">
          <form onSubmit={handleSubmit} className="login-form">
            <label className="input-wrap" htmlFor="reset-pass">
              <span className="input-label">Nueva contrasena</span>
              <input
                id="reset-pass"
                type="password"
                placeholder="Nueva contrasena"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
              />
            </label>
            <label className="input-wrap" htmlFor="reset-pass2">
              <span className="input-label">Confirmar contrasena</span>
              <input
                id="reset-pass2"
                type="password"
                placeholder="Repite la contrasena"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={6}
              />
            </label>
            {message && (
              <p
                className="form-error"
                style={{ color: isSuccess ? "#7dffb5" : "#ff8b8b" }}
              >
                {message}
              </p>
            )}
            <button
              type="submit"
              className="btn-pill primary"
              disabled={loading || !oobCode}
            >
              {loading ? "Actualizando..." : "Guardar contrasena"}
            </button>
            <Link className="btn-pill secondary" to="/">
              Volver al inicio
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
