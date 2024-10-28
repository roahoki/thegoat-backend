
# The Goat BACKEND 🐐⚽📊💸

# DOCUMENTACIÓN

## Como correr el código

### LOCAL

1. Crear .env en la raíz del proyecto
```
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=mydatabase
DB_HOST=db
#DB_HOST=localhost
PORT=3000
BROKER_HOST=broker.iic2173.org
BROKER_PORT = 9000
BROKER_USER=students
BROKER_PASSWORD=iic2173-2024-2-students
API_URL=http://api:3000
BACKEND_URL=http://localhost:3000
REDIRECT_URL=http://localhost:5173/purchase-completed

MQTT_HOST = broker.iic2173.org
MQTT_PORT = 9000
MQTT_USER = students
MQTT_PASSWORD = iic2173-2024-2-students
MQTT_PROTOCOL = mqtt
```

2. Bajar contenedores de docker si están arriba: 
```
docker compose down
```

3. Subir contenedores de docker (corre automáticamente las migraciones pendientes):
```
docker compose up --build -d
```

El backend debería estar visible en http://localhost:3000. 

4. Para ver los logs:
```
docker compose logs -f
```

### AWS



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

## WEBPAY

No agrega modelos nuevos, solo atributo wallet a Request y ExternalRequest. Cuando wallet=true, pago fue con billetera, cuando wallet=false, fue con webpay. 

Endpoints:

1. #### POST /webpay/create

Este endpoint se encarga de iniciar una transacción en Webpay para una solicitud específica. La request está asociada a un request_id, que identifica la transacción en la base de datos. Es llamado desde la api, en POST /requests, cuando la request es por webpay. 

Funcionalidad:

1. Busca la request asociada en la base de datos utilizando el request_id.
2. Calcula el monto total multiplicando la cantidad por el valor unitario ($1000).
3. Inicia la transacción en Webpay utilizando el método tx.create() con el request_id, el nombre del comercio, el monto y la URL de retorno (definida en process.env.REDIRECT_URL). 
4. Actualiza la request con el token de Webpay y cambia su estado a pending payment.
5. Devuelve al frontend la URL de Webpay y el token de la transacción para redirigir al usuario al portal de pago.

Body:

```json
{
  "request_id": "uuid",  // ID de la solicitud
  "quantity": 2  // Cantidad de bonos
}
```

Respuesta:

- 201 Created: La transacción fue iniciada correctamente, se devuelve la URL de Webpay y el token.
- 404 Not Found: Si no se encuentra la request en la base de datos.
- 500 Internal Server Error: Si ocurre algún error al iniciar la transacción en Webpay.


2. #### POST /webpay/commit

Este endpoint se encarga de confirmar la transacción en Webpay después de que el usuario haya completado (o cancelado) el proceso de pago. Es llamado desde el frontend en la página de redirección (PurchaseCompleted), cuando el usuario termina de realizar el pago por webpay, para confirmar si se realizó o no. 

Funcionalidad:

1. Si el token no está presente (indicando que el usuario canceló la transacción), busca una request con estado pending payment y sin deposit_token, y la marca como rejected.
2. Si el token está presente, confirma la transacción con Webpay utilizando el método tx.commit().
3. Dependiendo de la respuesta de Webpay (response_code), la request se actualiza a rejected (si la transacción fue rechazada) o accepted (si fue exitosa).
4. En ambos casos, publica el resultado en el canal MQTT fixtures/validation para informar a otros grupos sobre el estado de la transacción.
Mensaje que publica:

```json
{
  "request_id": "uuid",  // ID de la solicitud
  "group_id": "15",  // Grupo al que pertenece la solicitud
  "seller": 0,  // Siempre 0
  "valid": true  // true si fue aceptada, false si fue rechazada
}
```

Body:

```json
{
  "token": "webpay-token"  // Token de Webpay que se recibe después del pago
}
```

Respuesta:

- 200 OK: La transacción fue procesada correctamente, ya sea aceptada o rechazada.
- 404 Not Found: Si no se encuentra la request asociada al token después de actualizarla.
- 500 Internal Server Error: Si ocurre un error durante la confirmación de la transacción.


# Pasos integración Webpay

Para la integración de Webpay se utilizó como referencia la ayuantía del curso. Pasos:

1. Configurar Webpay

Se creó un archivo llamado webpayConfig.js, donde desde el SDK de Transbank (el cual debimos instalar en yarn) se importa webpay y se define la variable tx, que es una instancia de una transacción de webpay. 

2. Crear la ruta /webpay/create

Esta ruta se encarga de crear la transacción en webpay, utilizando la configuración recién creada, recibiendo de vuelta la URL y el token para redirigir al usuario al pago. Al crearla, se le entrega un id (en este caso el de la request), el monto total, y una ruta en el frontend a la cual el usuario va a ser redirigido al completar la transacción. 

3. Llamar a la ruta webpay/create desde el frontend

En el frontend, cuando se selecciona pagar por webpay, se hace una llamada a la ruta recién creada, entregando la información de la request, y luego se redirige al usuario a la url que webpay retorna con el token asociado. 

4. Crear la ruta webpay/commit

Se crea la ruta en el backend que hace commit a la transacción (utilizando la configuración definida en webpayConfig), y dependiendo de la respuesta envía el mensaje de validación adecuado al canal y modifica el estado de la request. 

4. Crear la vista de redirección

En el frontend, se crea la vista de redirección (que es entregada a webpay al crear la transacción). En esta vista, en primer lugar, se llama a una función que, con el token asociado (obtenido de los parámetros) se llama a la ruta /webpay/commit recién creada. Luego de que se haya hecho el commit de la transacción, se muestra una pantalla de compra finalizada, junto con el estado de esta (aprobado, rechazado, anulado), el cual es recibido como mensaje desde /webpay/commit. 
