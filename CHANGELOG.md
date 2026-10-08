# Changelog

## [Unreleased]

### Added
- `/health` para un monitor: responde `ok` y la versión (`VERSION`).

### Security
- Flask 3.1.3, Werkzeug 3.1.9 y Jinja2 3.1.6, por vulnerabilidades conocidas.
- pytest sale de `requirements.txt` (lo de producción) a `requirements-dev.txt`.

## [1.0.0] - 2024-01-13
Primera versión estable con todas las funcionalidades básicas.

### Added
- Timer funcional con modos Pomodoro, descanso corto y largo
- Notificaciones de escritorio y sonido
- Temas personalizables
- Layout invertible
- Diseño responsive
- Tests con 100% de cobertura
