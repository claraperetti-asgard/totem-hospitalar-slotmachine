import { Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";

import AppLayout from "../components/layout/AppLayout";
import Home from "../pages/Home";
import Formulario from "../pages/Formulario";
import Relatorio from "../pages/Relatorio";
import Roleta from "../pages/Roleta";
import SlotMachine from "../pages/SlotMachine";
 import EndScreen from "../pages/EndScreen";

export function AppRoutes() {
  const location = useLocation();

  useEffect(() => {
    const checkVersion = async () => {
      try {
        // Só verifica quando estiver na Home
        if (location.pathname !== "/") return;

        const response = await fetch(
          `/version.json?t=${Date.now()}`
        );

        const data = await response.json();

        const currentVersion = localStorage.getItem("app_version");

        // Primeira execução
        if (!currentVersion) {
          localStorage.setItem("app_version", data.version);
          return;
        }

        // Nova versão detectada
        if (currentVersion !== data.version) {
          console.log(
            `Nova versão encontrada: ${data.version}`
          );

          localStorage.setItem("app_version", data.version);

          // Limpa caches do navegador
          if ("caches" in window) {
            const cacheNames = await caches.keys();

            await Promise.all(
              cacheNames.map((cache) => caches.delete(cache))
            );
          }

          window.location.reload();
        }
      } catch (error) {
        console.error("Erro ao verificar versão:", error);
      }
    };

    // verifica ao abrir
    checkVersion();

    // verifica a cada 30 segundos
    const interval = setInterval(checkVersion, 30000);

    return () => clearInterval(interval);
  }, [location.pathname]);

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/forms" element={<Formulario />} />
        <Route path="/relatorio" element={<Relatorio />} />
        <Route path="/roleta" element={<Roleta />} />
        <Route path="/slot-machine" element={<SlotMachine />} />
        <Route path="/final" element={<EndScreen />} />
      </Route>
    </Routes>
  );
}

