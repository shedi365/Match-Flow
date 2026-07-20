FROM node:20

WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Configurar pnpm para que no use symlinks (evita problemas con los volúmenes de Docker)
RUN pnpm config set node-linker hoisted

COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install

COPY . .

EXPOSE 5173

# Comando para ejecutar en modo desarrollo
CMD ["pnpm", "dev", "--host"]
