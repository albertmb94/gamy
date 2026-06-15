# Propuestas de mejora para Gamy

Este documento recoge ideas de mejora de UX/UI y funcionalidades detectadas durante la revisión de la aplicación.

## UX/UI

1. **Modo oscuro/claro**
   - Añadir un toggle para alternar entre tema oscuro y claro. Actualmente solo hay modo oscuro.

2. **Animaciones y transiciones**
   - Añadir micro-interacciones al seleccionar jugadores, guardar partidas o desbloquear logros.
   - Usar `framer-motion` para transiciones entre pestañas y modales.

3. **Pantalla de bienvenida / onboarding**
   - Mostrar una breve guía la primera vez que se abre la app para explicar Ludoteca, Jugar, Historial y Stats.

4. **Accesos directos desde la navegación**
   - Añadir un botón flotante "Nueva partida" siempre visible para empezar a jugar sin cambiar de pestaña.

5. **Mejoras en formularios**
   - Validaciones visuales (nombre obligatorio, categorías duplicadas).
   - Auto-guardado de borradores al crear un juego.
   - Selector de color con más opciones o picker personalizado.

6. **Tarjetas de juego más informativas**
   - Mostrar número de partidas jugadas, mejor jugador y última partida directamente en la tarjeta.

7. **Empty states personalizados**
   - Ilustraciones o iconos más descriptivos cuando no hay juegos, jugadores o partidas.

8. **Tipografía jerárquica**
   - Definir escalado de títulos más marcado y usar pesos de fuente para guiar la atención.

9. **Bottom sheet nativo en móvil**
   - Convertir los modales en bottom sheets para una experiencia más móvil.

10. **Feedback táctil y sonoro**
    - Vibración ligera al guardar partida o desbloquear logro (respetando preferencias de accesibilidad).

## Funcionalidades

1. **Sistema de logros completo**
   - Añadir más logros (primeras 10 victorias, ganar con todos los tipos de juego, racha de 5, etc.).
   - Mostrar notificación al desbloquear un logro.

2. **Campañas / ligas**
   - Crear ligas temporales con fecha de inicio/fin y ranking propio.

3. **Equipos / modo cooperativo real**
   - Permitir registrar victorias en equipo y estadísticas por parejas.

4. **Importación / exportación de datos**
   - Exportar todos los datos a JSON y poder importarlos (backup y migración).

5. **Notas y fotos por partida**
   - Añadir comentarios o foto del tablero final a cada partida.

6. **Sistema de elo / puntuación interna**
   - Calcular un rating ELO opcional por juego para comparar habilidad relativa.

7. **Recordatorios y estadísticas mensuales**
   - Resumen mensual de partidas jugadas, juego más jugado, jugador del mes.

8. **Perfiles de jugador más ricos**
   - Avatar personalizado, color, bio y juegos favoritos.

9. **Soporte multilenguaje**
   - Internacionalizar la app (español, inglés, etc.).

10. **PWA completa**
    - Service worker, iconos, splash screen y soporte offline total.

11. **Sincronización en tiempo real**
    - Si hay backend, sincronizar cambios en tiempo real entre dispositivos mediante WebSockets.

12. **Escáner de juegos**
    - Permitir importar juegos escaneando un código de barras o buscando en BGG (BoardGameGeek).

13. **Estadísticas avanzadas**
    - Gráficos de evolución de puntuación por jugador.
    - Mapa de calor de tipos de juego más jugados.
    - Tiempo total de juego estimado.

14. **Modo "rápido"**
    - Pantalla de registro rápido para partidas con puntuación simple sin pasar por todos los pasos.

15. **Backup automático**
    - Subir backup periódico a un almacenamiento en la nube si el usuario lo configura.

## Prioridad recomendada

**Corto plazo:**
- Onboarding inicial.
- Notificaciones de logros.
- Exportar/importar datos.
- Validaciones de formularios.

**Medio plazo:**
- Modo claro.
- Ligas / campañas.
- Perfiles de jugador enriquecidos.
- Gráficos avanzados.

**Largo plazo:**
- PWA completa.
- Sincronización en tiempo real.
- Integración con BGG.
- Sistema de ELO.
