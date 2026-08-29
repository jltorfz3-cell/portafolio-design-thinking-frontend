# Frontend producción — Portafolio Design Thinking

Este frontend está adaptado al backend Spring Boot recibido y usa como API:
https://portafolio-design-thinking-springboot.onrender.com/api

Endpoints utilizados:
- POST /api/auth/login
- GET /api/auth/me (disponible en backend)
- GET /api/proyectos
- POST /api/proyectos
- GET /api/proyectos/{id} (disponible)
- PUT /api/proyectos/{id} (disponible)
- DELETE /api/proyectos/{id} (disponible)
- GET /api/etapas/proyecto/{proyectoId}

Importante:
1. El frontend NO se conecta a Aiven.
2. Aiven permanece detrás de Spring Boot.
3. Publica esta carpeta en un hosting de frontend.
4. El backend debe permitir mediante CORS el dominio exacto donde publiques el frontend.

Prueba local:
- VS Code + Live Server.
- Abre index.html.
- El navegador hará peticiones HTTPS a Render.
