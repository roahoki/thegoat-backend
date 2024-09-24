# Entrega 1: The goat bet 🐐⚽📊💸

## Requisitos Funcionales
- RF01 ES: Registro/Sign Up

- RF02 ES: Los usuarios pueden visualizar los partidos

- RF06 ES: Al comprar bono se envía solicitud a `fixtures/requests`, se espera la respuesta y se escucha en `fixtures/validation`

- RF07 ES: Debemos estar escuchando los canales `fixtures/requests`, `fixtures/validation` y `fixtures/history`

- RF08 ES: Gestión correcta de la disponibilidad de bonos

- RF09 ES: Usuario puede agregar dinero a su billetera

- RF10 ES: Usuario compra un bono disponible, se valida que tenga dinero y se descuenta de su billetera cuando se efectua la compra

- RF11 ES: Usuario acierta en su predicción, entonces recibe 1000*odd del bono a su billetera

--- RF03: Ver detalles de cada partido + cantidad de bonos dispo + poder comprar 

--- RF04: Al comprar, obtener ubicación de usuario mediante IP

--- RF05: Usuario puede ver sus solicitudes (bonos comprados y en proceso)


## Requisitos No Funcionales

- RNF01 ES: Separación backend y frontend

- RNF02 ES: Listener y Api son contenedores distintos, coordinación mediante docker compose

- RNF03 ES: Configuración correcta de budget alerts en la cuenta de aws

- RNF04 ES: API debe estar detrás de una AWS API gateway, se debe asociar a un subdominio y debe tener CORS configurado correctamente.

- RNF05 ES: Backend y Frontend con HTTPS

- RNF06 ES: Implementación de servicio de autenticación IDEAL OAuth

RNF07: Frontend desplegado en S3 con distribución en Cloudfront

RNF08: API Gateway debe poder usar servicio de autenticación antes de enviar request a la API. Dentro de API Gateway deben crearle un Custom Authorizer si usan tipo REST para poder autenticar sus requests previos a mandarlos a su API.

RNF09: Implementar un pipeline de CI, CircleCI. Implementación de linter que revise el código

RNF09 BONUS: Implementar un build simple que resuelva un test trivial que pueda fallar para el backend

RNF09 BONUS: Implementar un pipeline CI para frontend con un linter y hacer uso de revisiones de performance de lighthouse 

## Documentación

Todo en la carpeta docs

--- RDOC01 (3 ptos): Deben crear un diagrama UML de componentes de la entrega, con explicaciones y
detalle sobre el sistema. Esto deben tenerlo para la fecha final de entrega.

--- RDOC02 (2 ptos): Deben documentar los pasos necesarios para replicar el pipe CI que usaron en su
aplicación (Qué pasos sigue si CI).

--- RDOC03 (1 ptos): Deben dejar una documentación de alguna forma de correr su aplicación en un
ambiente local para propósitos de testeo (que instalar, que poner en el .env, como correr la app, etc).






