import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar todas las variables de entorno (sin filtrar por prefijo VITE_)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss(), viteSingleFile()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    // Exponer las credenciales de Turso al cliente de forma compatible con Vite.
    // Nota: esto incluye el token en el bundle. Para producción pública se
    // recomienda usar un backend intermedio en lugar de exponer el token.
    define: {
      "import.meta.env.VITE_TURSO_DATABASE_URL": JSON.stringify(env.TURSO_DATABASE_URL),
      "import.meta.env.VITE_TURSO_AUTH_TOKEN": JSON.stringify(env.TURSO_AUTH_TOKEN),
    },
  };
});
