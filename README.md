# MatchFlow - Sistema de Torneos

MatchFlow es una plataforma integral diseñada para automatizar la gestión y el desarrollo de torneos. Este sistema permite a los jugadores registrarse mediante un Gamertag único, generar de forma automática los emparejamientos iniciales (brackets), reportar marcadores cargando evidencias visuales, y visualizar el progreso de las llaves en tiempo real. 

Además, incorpora flujos para que el rival valide los marcadores subidos o entre en estado de disputa, momento en el cual un administrador puede forzar la resolución utilizando la evidencia gráfica almacenada. Todo el sistema está contenerizado asegurando su disponibilidad en entornos desconectados (sin dependencias a APIs de terceros para el almacenamiento de medios).

## 🛠 Stack Tecnológico
- **Frontend**: React, TypeScript, Vite, Tailwind CSS.
- **Backend API**: Python, FastAPI.
- **Base de Datos**: PostgreSQL gestionada con SQLAlchemy y Alembic (ORM y Migraciones).
- **Infraestructura**: Docker y Docker Compose (Almacenamiento en volúmenes persistentes).

---

## 📋 Prerrequisitos de Instalación
Para ejecutar este proyecto, no es necesario instalar lenguajes de programación de manera local. La única dependencia estricta es:

- [Docker Engine y Docker Compose](https://docs.docker.com/get-docker/) instalado y en ejecución en tu máquina.

---

## 🚀 Instrucciones para Levantar el Entorno (Paso a Paso)

El entorno de desarrollo y la base de datos están completamente unificados a través de Docker. 

**1. Clonar el repositorio y posicionarse en la carpeta raíz**
```bash
git clone https://github.com/shedi365/Match-Flow.git
cd tournaments-FIFA
```

**2. Construir e iniciar los contenedores**
Para levantar todo el stack (Frontend, Backend y PostgreSQL) ejecuta el siguiente comando. La bandera `-d` lo ejecutará en segundo plano.
```bash
docker compose up --build -d
```
*(Nota: La primera vez, este proceso puede tomar algunos minutos mientras se descargan las imágenes oficiales y se instalan las dependencias de Node.js y Python).*

**3. Ejecutar las Migraciones de Base de Datos**
Una vez que los contenedores estén corriendo, debes instanciar las tablas y esquema de la base de datos ejecutando Alembic dentro del contenedor del backend:
```bash
docker compose exec backend alembic upgrade head
```

**4. Acceder a los servicios**
Si los pasos anteriores fueron exitosos, los servicios estarán disponibles en los siguientes enlaces locales:
- 🌐 **Aplicación Frontend (React):** [http://localhost:5173](http://localhost:5173)
- ⚙️ **Backend API (Swagger Docs):** [http://localhost:8000/docs](http://localhost:8000/docs)
- 🐘 **Base de Datos PostgreSQL:** Conexión local disponible en el puerto `5432` (Credenciales por defecto: `user` / `password`).

---

## 🛑 Detener el Entorno
Si deseas detener los contenedores (preservando los datos almacenados en los volúmenes), ejecuta:
```bash
docker compose down
```
*(Toda tu información, como usuarios creados o imágenes subidas, seguirá allí la próxima vez que ejecutes `docker compose up -d`).*

---

## 🧪 Ejecutar Pruebas Unitarias
El proyecto cuenta con una suite de pruebas funcionales escritas con `pytest` para asegurar la estabilidad lógica de los componentes críticos.

Para ejecutar la batería de pruebas, lanza el siguiente comando directamente en el contenedor del backend:
```bash
docker compose exec backend pytest
```
*(Asegúrate de que los contenedores estén en ejecución mediante `docker compose up -d` antes de correr los tests).*
