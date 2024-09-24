# Usar una imagen oficial de Node.js como base
FROM node:22.6.0

# Crear un directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación al contenedor
COPY . .

# Comando para ejecutar el listener
CMD ["node", "listener.js"]
