// src/components/registro/Registro.js
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./registro.css";
import { registerUser } from "../../services/auth";

// importa tus validadores
import {
  validateName,
  validateEmail,
  validatePassword,
  validateRegisterForm,
} from "../../utils/validator";

export default function Registro() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");        // error general (del backend, etc.)
  const [fieldErrors, setFieldErrors] = useState({ // errores por campo
    nombre: undefined,
    email: undefined,
    contrasena: undefined,
  });

  // útil para deshabilitar el botón si hay errores visibles o campos vacíos
  const hasEmpty = !nombre || !email || !contrasena;
  const hasFieldErrors = useMemo(
    () => !!(fieldErrors.nombre || fieldErrors.email || fieldErrors.contrasena),
    [fieldErrors]
  );
  const canSubmit = !loading && !hasEmpty && !hasFieldErrors;

  const handleBlur = (field) => {
    let msg;
    if (field === "nombre") msg = validateName(nombre);
    if (field === "email") msg = validateEmail(email);
    if (field === "contrasena") msg = validatePassword(contrasena);
    setFieldErrors((prev) => ({ ...prev, [field]: msg || undefined }));
  };

  const handleRegister = async () => {
    setErrMsg("");

    // validación final antes de enviar
    const formErrors = validateRegisterForm({ nombre, email, contrasena });
    setFieldErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    try {
      setLoading(true);
      await registerUser({ nombre, email, password: contrasena });

      alert("✅ Cuenta creada. Ahora inicia sesión.");
      navigate("/"); // tu pantalla de Login
    } catch (err) {
      console.error(err);
      // mensaje de backend si viene en err.response?.data?.message
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;
      setErrMsg(backendMsg || "Hubo un problema al registrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <header className="reg-header">
        <div className="logo-circle">SS</div>
        <h1 className="brand">SkillSwapp</h1>
      </header>

      <section className="reg-card">
        <h2 className="reg-title">
          CREA TU<br />CUENTA!!
        </h2>

        <div className="form-grid">
          {/* Nombre */}
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              if (fieldErrors.nombre) {
                // validación “en caliente” opcional
                setFieldErrors((prev) => ({
                  ...prev,
                  nombre: validateName(e.target.value) || undefined,
                }));
              }
            }}
            onBlur={() => handleBlur("nombre")}
            minLength={2}
            maxLength={40}
            autoComplete="name"
            inputMode="text"
            aria-invalid={!!fieldErrors.nombre}
          />
          {fieldErrors.nombre && (
            <p className="field-error">{fieldErrors.nombre}</p>
          )}

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({
                  ...prev,
                  email: validateEmail(e.target.value) || undefined,
                }));
              }
            }}
            onBlur={() => handleBlur("email")}
            autoComplete="email"
            aria-invalid={!!fieldErrors.email}
          />
          {fieldErrors.email && (
            <p className="field-error">{fieldErrors.email}</p>
          )}

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={contrasena}
            onChange={(e) => {
              setContrasena(e.target.value);
              if (fieldErrors.contrasena) {
                setFieldErrors((prev) => ({
                  ...prev,
                  contrasena: validatePassword(e.target.value) || undefined,
                }));
              }
            }}
            onBlur={() => handleBlur("contrasena")}
            minLength={6}
            autoComplete="new-password"
            aria-invalid={!!fieldErrors.contrasena}
          />
          {fieldErrors.contrasena && (
            <p className="field-error">{fieldErrors.contrasena}</p>
          )}
        </div>

        {/* Error general (backend / no controlado por campo) */}
        {errMsg && <p style={{ color: "#d33", marginTop: 8 }}>{errMsg}</p>}

        <button
          className="btn-pill outline"
          onClick={handleRegister}
          disabled={!canSubmit}
        >
          {loading ? "Creando..." : "REGISTRAR"}
        </button>

        {/* Ayuda visual opcional para accesibilidad */}
        {(!canSubmit && !loading) && (
          <p
            style={{
              color: "#666",
              marginTop: 8,
              fontSize: 12,
              textAlign: "center",
            }}
          >
            Completa los campos correctamente para continuar.
          </p>
        )}
      </section>
    </div>
  );
}
