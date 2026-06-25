# Ludotic

Ludotic es una aplicación web progresiva (PWA) para gestionar una ludoteca de juegos de mesa, registrar partidas, seguir estadísticas y aplicar logros automáticos.

## Funcionalidades

- Ludoteca inicial precargada con juegos base y expansiones vinculadas.
- CRUD de juegos y jugadores.
- Portadas por URL o imagen local ya preparada en la carpeta `public/images/`.
- Tipos de juego múltiples por título.
- Plantillas de puntuación simples o complejas.
- Categorías personalizadas en plantillas complejas.
- Metadatos por categoría para logros automáticos.
- Registro de partidas con jugadores, expansiones activas, puntuaciones e historial editable.
- Sorteo del jugador inicial.
- Victorias especiales para 7 Wonders Duel y expansiones compatibles.
- Rankings globales, por juego y por tipo.
- Logros automáticos.
- Indicador visual de estado de base de datos.
- Persistencia local robusta con IndexedDB.
- Sincronización opcional con backend/Turso.

## Tecnologías

- React 19
- Vite
- Tailwind CSS v4
- Zustand
- IndexedDB (`idb`)

## Instalación

```bash
npm install
npm run dev
```

La app se abrirá en el puerto que indique Vite.

## Uso

### Ludoteca

- Consulta, crea, edita y elimina juegos.
- Filtra por tipo, dificultad y duración.
- Asigna una imagen por URL.
- Marca un juego como expansión y vincúlalo a un juego base.
- Usa plantillas simples o complejas.

### Jugar

- Busca juegos desde el menú de búsqueda.
- Selecciona jugadores.
- Activa expansiones de forma dinámica si el juego las tiene.
- Sortea el jugador inicial.
- Marca una victoria especial cuando el juego lo permita.
- En 7 Wonders Duel y sus expansiones, puedes marcar victoria por:
  - Supremacía militar
  - Supremacía científica
  - Supremacía política

Cuando eliges una de esas victorias, no necesitas introducir puntos para ese jugador: la victoria se asigna directamente.

### Historial

- Revisa partidas guardadas.
- Edita puntuaciones de partidas anteriores.
- Elimina partidas del histórico.

### Stats

- Ranking global.
- Ranking por juego.
- Ranking por tipo de juego.
- Vista de logros desbloqueados.

## Persistencia local

La aplicación guarda los datos en el navegador mediante **IndexedDB**. Esto permite:

- Mantener datos aunque no haya conexión.
- Almacenar grandes volúmenes de partidas sin límite de `localStorage`.
- Recuperar juegos, jugadores, partidas y logros al volver a abrir la app.

Las partidas creadas quedan almacenadas localmente y se marcan como `synced: false` hasta que se sincronicen con el backend.

## Base de datos remota (opcional)

La app está preparada para sincronizar con un backend que use Turso.

### Configuración

Crea un archivo `.env.local` en la raíz:

```bash
VITE_SYNC_API_URL=https://tu-api.example.com
VITE_SYNC_API_KEY=tu-api-key (opcional)
```

Tu backend debe exponer:

- `GET /health` – para comprobar conectividad.
- `POST /sync/game` – recibir un juego.
- `POST /sync/player` – recibir un jugador.
- `POST /sync/match` – recibir una partida.
- `POST /sync/achievement` – recibir un logro.

> **Seguridad:** nunca expongas el token de Turso directamente en el cliente. Siempre usa un backend intermedio.

### Backend de ejemplo con Express

```ts
import express from 'express';
import { createClient } from '@libsql/client';

const app = express();
app.use(express.json());

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/sync/:type', async (req, res) => {
  const { type } = req.params;
  // Inserta o reemplaza el recurso en Turso
  res.json({ ok: true });
});

app.listen(3000);
```

## Estado de conexión

La app muestra un indicador en la cabecera:

- **Verde:** conectado al backend remoto.
- **Azul:** funcionando con IndexedDB (modo local).
- **Naranja:** reconectando.
- **Gris:** desconectado.

Puedes pulsar sobre el contador de "pendientes" para intentar sincronizar manualmente.

## Estructura del proyecto

- `src/App.tsx`: entrada principal de la interfaz.
- `src/components/`: pantallas y módulos de la app.
- `src/data/defaultGames.ts`: ludoteca inicial.
- `src/db/localDb.ts`: persistencia en IndexedDB.
- `src/db/turso.ts`: conectividad y sincronización con backend remoto.
- `src/store/useStore.ts`: estado global.
- `public/images/`: portadas locales de juegos.

## Notas

- La app está pensada para funcionar bien en móvil y escritorio.
- El zoom está bloqueado para mantener la interfaz ajustada al ancho del dispositivo.
- Si añades una conexión real a Turso, recuerda implementar sincronización y resolución de conflictos en el backend.

## Desarrollo

Para compilar la app:

```bash
npm run build
```

## Licencia

Proyecto interno de Ludotic.
