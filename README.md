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

# DOCUMENTACIÓN

## REQUESTS
Modelos:
1. Request: Para el manejo de las requests internas de nuestro grupo que llegan del front. Incluye el user_id, el group_id tiene que ser 15.
2. ExternalRequest: Para el manejo de las requests ajenas que llegan por el listener, no tiene user_id y el group_id no es 15. Vienen con un request_id. 

Endpoints:
1. POST URL/requests

Crea una nueva request interna o externa en la bdd dependiendo del group_id. Si el group_id es '15', se crea una request interna (con un uuid autogenerado) y se publicará un mensaje MQTT. Para otros grupos, se crea una solicitud externa. En ambos casos se reservan los bonos en la fixture asociada.

Body:
```json
{
  "group_id": "15",
  "fixture_id": 123,
  "league_name": "Premier League",
  "round": "Round 1",
  "date": "2024-10-01",
  "result": "2-1",
  "deposit_token": "",
  "datetime": "2024-10-01T12:00:00Z",
  "quantity": 10,
  "user_id": 456,
  "status": "pending",
  "request_id": "uuid"  // Solo para solicitudes externas
}
```

Respuesta:

- 201 Created: Cuando la solicitud se crea correctamente. Devuelve el detalle de la solicitud y un mensaje de éxito.
- 500 Internal Server Error: Si ocurre un error en la creación de la solicitud.
-404 Not Found: Si no hay suficientes bonos disponibles o no se encuentra el fixture.

2. GET URL/requests

Devuelve una lista paginada de todas las requests internas, con filtros opcionales por user_id y status.

Query Parameters:
- page: Número de la página (por defecto 1).
- count: Cantidad de resultados por página (máximo 25, por defecto 25).
- user_id: Filtra las requests por el user_id del solicitante.
status: Filtra las requests por estado (pending, sent, etc.).

Respuesta:
- 200 OK: Devuelve un JSON con las requests, el total de resultados, la página actual, y la cantidad de resultados por página.
Ejemplo de respuesta:
```json
{
  "requests": [...],
  "total": 100,
  "page": 1,
  "count": 25
}
```

3. GET URL/requests/{id}

Obtiene una request interna específica basada en su request_id.

URL Parameters:
- id: El identificador de la request (request_id).

Respuesta:
- 200 OK: Devuelve los detalles de la request.
- 404 Not Found: Si no se encuentra la request con el id proporcionado.

4. PATCH URL/requests/validate

Valida o rechaza una solicitud interna o externa (Cambia el status a accepted o rejected). Si la solicitud es rechazada, se restauran los bonos reservados.
Body:
```json
{
  "request_id": "uuid",  // Identificador de la request
  "group_id": "15",  // El grupo al que pertenece la request
  "seller": 0,  // Por defecto 0
  "valid": true  // True para aceptar, false para rechazar
}
```

Respuesta:

- 200 OK: Cuando la request ha sido validada o rechazada exitosamente.
- 404 Not Found: Si no se encuentra la request o el fixture asociado.
- 500 Internal Server Error: Si ocurre algún error en la validación.

## USERS

Modelos: 
1. Usuario (pendiente cambiar a User): 
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "auth0Token": "your-auth0-token"
}
```

Endpoints:

1. GET:  http://localhost:3000/users/wallet?id=1&auth0Token=your-auth0-token

id y auth son querry params

result:
```json
{
    "billetera": 100
}
```

2. PUT:  http://localhost:3000/users/wallet

header: 
- key:Content-Type
- Value:application/json

body:
```json
{
  "user_id": "1",
  "auth0Token": "your-auth0-token",
  "amount": 100
}
```
result
```json
{
    "user": {
        "id": 1,
        "billetera": 100,
        "auth0Token": "your-auth0-token",
        "email": "user@example.com",
        "name": "John Doe"
    }
}
```