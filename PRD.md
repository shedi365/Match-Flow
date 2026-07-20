# PRD Técnico - Desarrollo de MatchFlow (Fase de Ejecución)

## 1. Stack Tecnológico Definido
*   **Frontend:** React con Tailwind CSS (Capa de Presentación).
*   **Backend:** FastAPI con Python (Capa de Lógica de Negocio y API REST)[cite: 5].
*   **Base de Datos:** PostgreSQL gestionada mediante un ORM (SQLAlchemy)[cite: 5].
*   **Almacenamiento de Archivos:** Almacenamiento local (Static Files) en el servidor backend, garantizando la persistencia mediante Volúmenes de Docker.
*   **Infraestructura:** Docker y Docker Compose para contenerización completa y orquestación local[cite: 4].

## 2. Requisitos de Funcionalidad Mínima
El sistema debe ser funcional y ejecutable, garantizando el cumplimiento operativo de las 6 Historias de Usuario base[cite: 4]:
*   **Módulo de Usuarios:** Registro de cuentas validando formato y unicidad del Gamertag (US-01)[cite: 5].
*   **Módulo de Torneos:** Motor de emparejamiento aleatorio para generar el bracket inicial sin intervención manual (US-02), y visualización pública del estado de las llaves en tiempo real (US-06)[cite: 5].
*   **Módulo de Partidos:** Endpoint y vista para reportar marcadores con carga de imágenes alojadas localmente en el servidor (US-03), validación o rechazo de resultados por parte del rival (US-04), y panel administrativo para la resolución forzada de disputas (US-05)[cite: 5].

## 3. Requisitos de Infraestructura y Despliegue
El entorno de desarrollo y producción simulada debe levantarse unificadamente de forma local[cite: 4].
*   **Contenedores:** Se requieren imágenes base oficiales (`python:3.x` para backend, `node:x` para frontend, y `postgres:x` para la base de datos)[cite: 4].
*   **Orquestación y Persistencia:** El archivo `docker-compose.yml` debe integrar los servicios, mapear los puertos correspondientes y definir explícitamente **volúmenes** tanto para resguardar los datos de PostgreSQL como para las imágenes subidas por los usuarios[cite: 4].
*   **Ejecución:** El comando `docker compose up --build` debe levantar todo el sistema (incluyendo base de datos y almacenamiento de estáticos) sin requerir pasos manuales adicionales por parte de la evaluadora[cite: 4].

## 4. Requisitos de Calidad de Código
Para asegurar la estabilidad de la lógica de negocio y cumplir con la rúbrica, se implementará una suite de pruebas funcionales[cite: 4].
*   **Pruebas Unitarias:** Desarrollo de un mínimo de 3 tests utilizando el framework nativo `pytest` para FastAPI[cite: 4].
*   **Cobertura sugerida:** Pruebas enfocadas en los servicios críticos, como la generación aleatoria de brackets, la actualización de estados de los partidos y la validación de formato de las evidencias visuales.
*   **Ejecución:** Las pruebas deben poder correrse mediante un comando simple (ej. `pytest`) dentro del contenedor del backend.

## 5. Requisitos de Documentación Técnica
El proyecto debe ser auditable y autoexplicativo para garantizar una rápida revisión técnica durante la defensa[cite: 4].
*   **API REST:** La documentación de los endpoints (GET, POST, PATCH, DELETE) se expondrá dinámicamente mediante Swagger UI en la ruta `/docs` utilizando las capacidades nativas de FastAPI[cite: 4, 5].
*   **README.md:** Archivo central en la raíz del repositorio que contenga: descripción del sistema, prerrequisitos de instalación (Docker), instrucciones paso a paso con los comandos exactos para levantar el entorno y pasos para ejecutar las pruebas unitarias[cite: 4].

> **Nota para la defensa oral:** La decisión de utilizar almacenamiento local con volúmenes de Docker se justifica arquitectónicamente para garantizar una **alta disponibilidad** y resiliencia del sistema durante la demostración en vivo, eliminando la dependencia de conexiones a internet externas, latencia de red o configuración de API Keys de terceros.