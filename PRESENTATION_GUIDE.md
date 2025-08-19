# Guion Completo para la Presentación de la Prueba Técnica

## 1. Introducción y Entendimiento del Negocio

"Buenos días. Hoy les presento la solución completa para la plataforma de gestión de fondos de inversión de El Cliente.

El objetivo era claro: empoderar al cliente final con una herramienta de autogestión para sus inversiones. La plataforma permite suscribirse a fondos, cancelar suscripciones y consultar un historial detallado de transacciones. El resultado es una mejor experiencia de usuario y una reducción significativa de la carga operativa para el equipo comercial.

Para materializar esta visión, he desarrollado una solución full-stack que consta de un frontend en **React con TypeScript** y un backend en **Python con FastAPI**, siguiendo las mejores prácticas de la industria."

---

## 2. Arquitectura y Filosofía de Calidad del Software

"La calidad, mantenibilidad y escalabilidad fueron los pilares de este desarrollo. Por ello, la arquitectura se fundamenta en dos principios clave: **Clean Code** y los principios **SOLID**."

-   **Clean Code:** "Adopté prácticas de Clean Code para que el software sea legible y fácil de mantener. Esto se ve en los **nombres significativos** de variables y funciones (`InvestmentService`, `handleSubscribe`), en **métodos cortos y con una única responsabilidad**, y en una estructura de proyecto consistente y predecible."

-   **Principios SOLID (Backend):** "Para garantizar un diseño robusto, apliqué los principios SOLID. El más evidente es el **Principio de Responsabilidad Única (SRP)**, que se manifiesta en la clara separación de capas:
    -   **Capa de API (`endpoints.py`):** Su única responsabilidad es gestionar las peticiones HTTP y la validación de datos. No contiene lógica de negocio.
    -   **Capa de Servicio (`investment_service.py`):** Orquesta toda la lógica de negocio. Sabe *qué* hacer, pero no le importa *cómo* se presentan los datos (HTTP) ni *dónde* se guardan.
    -   **Capa de Repositorio (`user_repository.py`, etc.):** Su única responsabilidad es el acceso y la manipulación de los datos. Es la única capa que sabe dónde y cómo se persiste la información.

    Esta separación, junto al **Principio de Inversión de Dependencias**, nos da una flexibilidad enorme. Si mañana queremos cambiar la base de datos, solo modificamos los repositorios; el resto de la aplicación no se ve afectado."

---

## 3. Estrategia de Persistencia de Datos

"La prueba pedía una solución sin base de datos externa. La implementación actual cumple esto utilizando una **persistencia en memoria** gestionada por los repositorios. Los datos viven mientras el servidor está activo, lo cual es ideal para desarrollo y pruebas rápidas.

Sin embargo, el proyecto está preparado para un entorno real. Se incluye una configuración de **Docker Compose** que levanta una instancia de **DynamoDB Local**. Esto permite simular el entorno de AWS en la máquina de desarrollo, probando la aplicación contra una base de datos NoSQL real sin costo alguno. La arquitectura de repositorios que mencioné antes facilitaría enormemente la transición de la persistencia en memoria a esta instancia de DynamoDB."

---

## 4. Flujo de una Transacción: Demostración Conceptual

"Para ilustrar cómo funciona la arquitectura, sigamos el flujo de una suscripción:

1.  **Frontend:** El usuario hace clic en 'Suscribir'. La UI en React (`App.tsx`) captura el monto y llama a un servicio local (`api.ts`).
2.  **API Call:** Se realiza una petición `POST` al endpoint `/subscribe` de nuestro backend.
3.  **Backend - API Gateway:** El endpoint en `endpoints.py` recibe la petición, valida los datos de entrada y delega la acción al `InvestmentService`.
4.  **Backend - Servicio:** El `InvestmentService` ejecuta la lógica de negocio: valida el saldo del usuario, verifica el monto mínimo del fondo y orquesta las operaciones con los repositorios para actualizar el saldo, añadir la suscripción y, crucialmente, **crear una nueva transacción con un ID único universal (UUID) generado en el backend**, garantizando la integridad de los datos.
5.  **Respuesta y UI:** El servicio retorna el estado completo y actualizado de la aplicación. El frontend lo recibe y, gracias a la reactividad de React, la interfaz se actualiza instantáneamente mostrando el nuevo saldo, la suscripción y la transacción en el historial."

---

## 5. Ejecución Local y Tecnologías

"La solución es autocontenida y fácil de ejecutar.

-   **Backend (FastAPI):** Elegí FastAPI por su alto rendimiento, su moderna sintaxis asíncrona y su generación automática de documentación interactiva, lo cual acelera el desarrollo. Para ejecutarlo, simplemente se navega a la carpeta `backend`, se instalan las dependencias de `requirements.txt` y se inicia el servidor con `uvicorn`.

-   **Frontend (React):** En otra terminal, se navega a la carpeta `frontend`, se ejecuta `npm install` y luego `npm run dev`. La aplicación se abrirá en el navegador y se conectará automáticamente al backend."

---

## 6. Despliegue en AWS: Arquitectura Serverless

"La solución está diseñada para un despliegue en AWS moderno, escalable y costo-eficiente, utilizando una arquitectura **100% serverless** definida con plantillas de **CloudFormation**."

-   **Frontend (`frontend-template.yml`):**
    -   Se utiliza **Amazon S3** para alojar los archivos estáticos de React.
    -   Se usa **Amazon CloudFront** como CDN para distribuir la aplicación globalmente con baja latencia y alta seguridad (HTTPS). El bucket de S3 se mantiene privado, accesible únicamente por CloudFront.

-   **Backend (`backend-template.yml`):**
    -   El código de FastAPI se ejecuta en **AWS Lambda**, eliminando la necesidad de gestionar servidores.
    -   **Amazon API Gateway** expone un endpoint HTTP seguro que invoca la función Lambda.
    -   La persistencia en la nube se realiza con **Amazon DynamoDB**, una base de datos NoSQL totalmente gestionada.

-   **Proceso de Despliegue (`DEPLOYMENT.md`):**
    -   El documento `DEPLOYMENT.md` detalla los pasos. El proceso está automatizado, pero, como se solicitó, se señalan los puntos de **'Intervención Humana Necesaria'**:
        1.  **Para el frontend**, es necesario construir la aplicación (`npm run build`) y subir los archivos resultantes al bucket S3 creado por CloudFormation.
        2.  **Para el backend**, se utiliza la **AWS SAM CLI** para empaquetar el código Python y sus dependencias antes de desplegarlo.
    -   Estos pasos son el puente necesario entre los artefactos de nuestro entorno local y la infraestructura creada en la nube."

---

## 7. Consulta SQL

"Finalmente, la prueba incluía un desafío de SQL: *'Obtener los nombres de los clientes con productos inscritos disponibles **únicamente** en las sucursales que visitan'*.

La solución, detallada en `query.sql`, utiliza una subconsulta con `NOT EXISTS`. En lugar de buscar directamente los clientes que cumplen la condición, la consulta identifica y excluye a aquellos que fallan. Un cliente falla si tiene un producto disponible en una sucursal que él no visita. Si no se encuentra ninguna de estas 'condiciones de fallo' para un cliente, este se incluye en el resultado final. Es una solución eficiente y robusta."

---

## 8. Conclusión

"En resumen, he entregado una solución integral que no solo cumple con todos los requisitos funcionales, sino que también está construida sobre una base técnica sólida, siguiendo las mejores prácticas de desarrollo, arquitectura de software y despliegue en la nube. El resultado es una aplicación mantenible, escalable y lista para producción.

Muchas gracias. Quedo a su disposición para cualquier pregunta."

---
---

## Apéndice: Posibles Preguntas y Respuestas Clave

### P: ¿Tengo que desplegar la aplicación en AWS durante la presentación?

**Respuesta:** "No, la prueba no exige realizar el despliegue completo. El requisito es demostrar que la aplicación está **lista para ser desplegada** de manera profesional. Para ello, he entregado un 'kit de despliegue' completo que incluye:
1.  **Plantillas de AWS CloudFormation:** Para crear la infraestructura de frontend y backend de forma automatizada.
2.  **Documentación de Despliegue Detallada:** El archivo `DEPLOYMENT.md` con el paso a paso.
3.  **Identificación de Pasos Manuales:** La guía señala explícitamente los puntos de 'Intervención Humana Necesaria'.

Con estos elementos, la aplicación está completamente preparada para ser desplegada en un entorno de AWS de manera robusta y repetible."

### P: ¿De dónde sacaste las plantillas de CloudFormation?

**Respuesta:** "Las diseñé y escribí yo mismo, basándome en las arquitecturas de referencia y las mejores prácticas recomendadas por la propia documentación de AWS para este tipo de aplicaciones serverless.

Mi proceso fue el siguiente:
1.  **Diseño Conceptual:** Primero diseñé la arquitectura ideal. Para el frontend, la solución estándar de oro es S3 con CloudFront para obtener rendimiento y seguridad. Para el backend, una arquitectura serverless con Lambda, API Gateway y DynamoDB es la más escalable y costo-eficiente.
2.  **Seguridad como Prioridad:** En ambas plantillas, apliqué el principio de mínimo privilegio. El bucket de S3 es privado y solo accesible por CloudFront. El rol de IAM de la Lambda solo tiene permisos para escribir logs y acceder a su tabla de DynamoDB, nada más.
3.  **Funcionalidad Específica:** Añadí configuraciones clave, como el manejo de errores 403/404 en CloudFront para asegurar que el enrutamiento de React funcione correctamente.
4.  **Consulta y Escritura:** Finalmente, consulté la documentación oficial de CloudFormation para obtener la sintaxis precisa de cada recurso y sus propiedades, y escribí las plantillas para que implementaran mi diseño."
