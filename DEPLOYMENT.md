# Guía de Despliegue en AWS (Stack Python/React)

Este documento describe los pasos para desplegar las aplicaciones de backend y frontend en AWS utilizando AWS SAM y CloudFormation.

## Prerrequisitos

- Una cuenta de AWS.
- AWS CLI instalado y configurado.
- AWS SAM CLI instalado.
- Docker instalado y corriendo (para `sam build`).
- Node.js y npm instalados.

---

## Parte 1: Despliegue del Backend (Python Serverless)

### Paso 1: Construir el paquete de despliegue

1.  Navega a la carpeta `backend`:
    ```sh
    cd backend
    ```

2.  SAM CLI construirá el paquete, instalará las dependencias de Python y lo preparará para el despliegue.
    ```sh
    sam build
    ```
    Esto creará una carpeta `.aws-sam` con los artefactos de despliegue.

### Paso 2: Desplegar la aplicación

1.  Ejecuta el comando de despliegue guiado de SAM. La primera vez te hará varias preguntas.
    ```sh
    sam deploy --guided
    ```
    -   **Stack Name:** `InvestmentFundBackendStack` (o el nombre que prefieras).
    -   **AWS Region:** La región que desees (ej: `us-east-1`).
    -   **Confirm changes before deploy:** `y`
    -   **Allow SAM CLI IAM role creation:** `y`
    -   **Disable rollback:** `n`
    -   **Save arguments to samconfig.toml:** `y` (Recomendado para futuros despliegues).

2.  SAM empaquetará y desplegará los recursos (DynamoDB, Lambda, API Gateway). Al finalizar, mostrará la URL de la API en los "Outputs".

    **Guarda esta URL. La necesitarás para el frontend.**

### Paso 3: Cargar los datos iniciales (Seed)

**INTERVENCIÓN HUMANA NECESARIA:** La tabla de DynamoDB en la nube está vacía. Debes ejecutar el script de setup apuntando a la nube.

1.  Comenta o elimina la variable `DYNAMODB_ENDPOINT_URL` en tu archivo `.env`.
2.  Asegúrate de que tus credenciales de AWS CLI tengan permisos para escribir en DynamoDB.
3.  Ejecuta el script:
    ```sh
    python setup_dynamodb_local.py
    ```
    Esto poblará la tabla en la nube con los fondos y el usuario inicial.

---

## Parte 2: Despliegue del Frontend (React)

### Paso 1: Actualizar la URL de la API

**INTERVENCIÓN HUMANA NECESARIA:** Conecta el frontend con el backend desplegado.

1.  Abre el archivo `frontend/src/services/api.ts`.
2.  Reemplaza la URL de `API_URL` por la URL del endpoint que obtuviste de la salida de `sam deploy`.
    ```typescript
    // Ejemplo:
    const API_URL = 'https://abcdef123.execute-api.us-east-1.amazonaws.com/api';
    ```

### Paso 2: Construir la aplicación de React

1.  Navega a la carpeta `frontend`:
    ```sh
    cd frontend
    ```
2.  Instala dependencias y construye el proyecto:
    ```sh
    npm install
    npm run build
    ```

### Paso 3: Desplegar la plantilla de CloudFormation

1.  Desde la raíz del proyecto, ejecuta:
    ```sh
    aws cloudformation deploy \
      --template-file frontend-template.yml \
      --stack-name InvestmentFundFrontendStack
    ```

2.  Obtén el nombre del bucket S3 creado:
    ```sh
    aws cloudformation describe-stacks --stack-name InvestmentFundFrontendStack --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text
    ```

### Paso 4: Subir los archivos del frontend

1.  Sincroniza la carpeta `frontend/dist` con el bucket S3:
    ```sh
    aws s3 sync frontend/dist/ s3://<BUCKET-CREADO-POR-CLOUDFORMATION>
    ```

### Paso 5: Acceder a la aplicación

1.  Obtén la URL de CloudFront de los "Outputs" de la pila:
    ```sh
    aws cloudformation describe-stacks --stack-name InvestmentFundFrontendStack --query "Stacks[0].Outputs[?OutputKey=='DistributionDomainName'].OutputValue" --output text
    ```
2.  Abre esta URL en tu navegador. La aplicación web estará completamente funcional.