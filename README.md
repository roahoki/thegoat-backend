# The Goat BACKEND 🐐⚽📊💸

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