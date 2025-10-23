// src/components/common/LogoutButton.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/auth";

export default function LogoutButton({ className }) {
    const navigate = useNavigate();
    const doLogout = async () => {
        await logoutUser();
        navigate("/"); // vuelve al login
    };
    return (
        <button className={className} onClick={doLogout}>
            Cerrar sesión
        </button>
    );
}
