# Flujo Accion Workers

Desde el frontend se hace una compra de bono y se envía una request hacia el backend principal con la información de compra, se valida y se efectúa. Posteriormente, el backend principal hace una request de RECOMENDACIONES al backend de workers, por lo que se crea un job relacionado al usuario. Este job debe ser tomado por un worker disponible y debe ser ejecutado, el worker debe retornar el resultado de las recomendaciones hacia la memoria de Redis.

El backend principal se debe preocupar de recuperar el resultado dado por el worker desde la memoria de Redis para posteriormente enviarselo al frontend.