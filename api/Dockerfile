# Usar una imagen oficial de Node.js como base
FROM node:22.6.0

# Crear un directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos package.json y yarn.lock para instalar dependencias
COPY package.json yarn.lock ./

# Instalar las dependencias usando Yarn
RUN yarn install

# Copiar el resto de los archivos de la aplicación al contenedor
COPY . .

# Exponer el puerto en el que corre la API
EXPOSE 3000

# Comando para ejecutar las migraciones y luego iniciar la API
CMD ["sh", "-c", "npx sequelize-cli db:migrate && yarn dev"]
