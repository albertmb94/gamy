# Gamy

Gamy es una app web para gestionar una ludoteca de juegos de mesa, registrar partidas, seguir estadísticas y aplicar logros automáticos.

## Funcionalidades

- Ludoteca inicial precargada con juegos base y expansiones vinculadas.
- CRUD de juegos y jugadores.
- Portadas por URL o imagen local ya preparada en la carpeta `public/images/`.
- Tipos de juego múltiples por título.
- Plantillas de puntuación simples o complejas.
- Categorías personalizadas en plantillas complejas.
- Metadatos por categoría para logros automáticos.
- Registro de partidas con jugadores, expansiones activas, puntuaciones e ისტორico editable.
- Sorteo del jugador inicial.
- Victorias especiales para 7 Wonders Duel y expansiones compatibles.
- Rankings globales, por juego y por tipo.
- Logros automáticos.
- Indicador visual de estado de base de datos.
- Persistencia local para mantener datos aunque no haya conexión.

## Tecnologías

- React 19
- Vite
- Tailwind CSS v4
- Zustand

## Requisitos

- Node.js 20 o superior
- npm

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

La aplicación guarda los datos en el navegador mediante persistencia local. Esto permite seguir trabajando incluso si la base de datos remota todavía no está disponible.

Las partidas creadas quedan almacenadas localmente y se pueden sincronizar más adelante cuando la conexión a Turso esté operativa.

## Turso

La integración con Turso está preparada como base de configuración, pero necesita que completes la conexión con tu backend o cliente de sincronización.

### 1. Crear la base de datos

Instala el CLI de Turso:

```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

Inicia sesión:

```bash
turso auth login
```

Crea la base de datos:

```bash
turso db create gamy-db
```

Obtén la URL:

```bash
turso db show gamy-db --url
```

Genera un token:

```bash
turso db tokens create gamy-db
```

### 2. Variables de entorno

Si conectas Turso desde un backend o una ruta de servidor, usa estas variables:

```bash
TURSO_DATABASE_URL=libsql://tu-base-de-datos.turso.io
TURSO_AUTH_TOKEN=tu-token
```

Ejemplo de uso en una ruta de servidor o backend:

```ts
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
```

Nota: estas credenciales no deben exponerse en el cliente web. Si la app corre en Vite, lo correcto es pasar por una API propia o un backend intermedio.

### 3. Esquema sugerido

El archivo `src/db/turso.ts` incluye un esquema SQL orientativo para:

- juegos
- jugadores
- partidas
- logros

Puedes usarlo como base para tu migración inicial.

### 4. Conexión en producción

Por seguridad, no se recomienda exponer credenciales de Turso directamente en el cliente.

Lo habitual es usar un backend intermedio, por ejemplo:

- Cloudflare Workers
- Vercel Edge Functions
- Express o Fastify

Ese backend puede leer las variables de entorno, conectarse a Turso y sincronizar los cambios desde la app.

## Estado de conexión

La app muestra un indicador en la cabecera:

- Verde: conectado
- Naranja: reconectando
- Gris: desconectado

Mientras la integración real no esté finalizada, el estado puede permanecer en desconectado.

## Estructura del proyecto

- `src/App.tsx`: entrada principal de la interfaz.
- `src/components/`: pantallas y módulos de la app.
- `src/data/defaultGames.ts`: ludoteca inicial.
- `src/db/turso.ts`: configuración y notas de conexión a Turso.
- `src/store/useStore.ts`: estado global y persistencia local.
- `public/images/`: portadas locales de juegos.

## Notas

- La app está pensada para funcionar bien en móvil y escritorio.
- El zoom está bloqueado para mantener la interfaz ajustada al ancho del dispositivo.
- Las partidas quedan registradas localmente aunque Turso todavía no esté conectado.
- Si añades una conexión real a Turso, recuerda implementar sincronización y resolución de conflictos.

## Desarrollo

Para compilar la app:

```bash
npm run build
```

## Licencia

Proyecto interno de Gamy.