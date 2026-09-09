# Etapa 1: compilar. Node solo hace falta acá; la imagen final no lo lleva.
FROM node:22-alpine AS build
WORKDIR /app

# La URL de la API se resuelve en tiempo de compilación, no de ejecución: Vite
# la incrusta dentro del JavaScript. Por eso viaja como ARG y hay que pasarla al
# construir la imagen, no como variable de entorno del contenedor.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN corepack enable
# Primero solo los manifiestos: mientras no cambien, Docker reutiliza la capa de
# dependencias y no vuelve a instalar en cada build.
COPY package.json pnpm-lock.yaml ./
# --ignore-scripts: pnpm 10 bloquea los scripts de instalación de las
# dependencias y aborta pidiendo aprobarlos a mano, cosa imposible en un build
# desatendido. Acá no hacen falta: esbuild, @swc/core y sharp traen binarios ya
# compilados, y el único paso que importa es `vite build`.
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .
RUN pnpm build

# Etapa 2: servir. Queda una imagen de unos 50 MB con nginx y los archivos
# estáticos, sin Node ni node_modules.
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
