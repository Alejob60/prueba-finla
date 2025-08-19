-- Parte 2 de la prueba técnica

CREATE TABLE Cliente (
    id NUMBER PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    ciudad VARCHAR(255)
);

CREATE TABLE Sucursal (
    id NUMBER PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    ciudad VARCHAR(255) NOT NULL
);

CREATE TABLE Producto (
    id NUMBER PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipoProducto VARCHAR(255) NOT NULL
);

CREATE TABLE Visitan (
    idCliente NUMBER,
    idSucursal NUMBER,
    fechaVisita DATE NOT NULL,
    PRIMARY KEY (idCliente, idSucursal),
    FOREIGN KEY (idCliente) REFERENCES Cliente(id),
    FOREIGN KEY (idSucursal) REFERENCES Sucursal(id)
);

CREATE TABLE Disponibilidad (
    idProducto NUMBER,
    idSucursal NUMBER,
    PRIMARY KEY (idProducto, idSucursal),
    FOREIGN KEY (idProducto) REFERENCES Producto(id),
    FOREIGN KEY (idSucursal) REFERENCES Sucursal(id)
);

CREATE TABLE Inscripcion (
    idCliente NUMBER,
    idProducto NUMBER,
    PRIMARY KEY (idCliente, idProducto),
    FOREIGN KEY (idCliente) REFERENCES Cliente(id),
    FOREIGN KEY (idProducto) REFERENCES Producto(id)
);

-- =================================================================================
-- CONSULTA SQL REQUERIDA
-- =================================================================================
-- Objetivo: Obtener los nombres de los clientes que tienen inscrito algún producto
-- que está disponible SÓLO en las sucursales que visitan.

-- Lógica de la consulta:
-- 1. (Subconsulta `Sucursales_Disponibles_No_Visitadas`): Para cada inscripción (cliente-producto),
--    se buscan las sucursales donde el producto está disponible pero que el cliente NO visita.
-- 2. (Consulta principal): Se seleccionan los nombres de los clientes para los cuales
--    el número de estas "sucursales no visitadas" es CERO. Si no hay ninguna sucursal
--    donde el producto esté disponible y que el cliente no visite, significa que todas
--    las sucursales donde está disponible SÍ son visitadas por el cliente.

SELECT DISTINCT
    c.nombre
FROM
    Cliente c
JOIN
    Inscripcion i ON c.id = i.idCliente
WHERE
    NOT EXISTS (
        -- Subconsulta que busca una "condición de fallo":
        -- una sucursal donde el producto está disponible y que el cliente NO visita.
        SELECT 1
        FROM Disponibilidad d
        WHERE
            d.idProducto = i.idProducto
            AND d.idSucursal NOT IN (
                -- Conjunto de sucursales que el cliente SÍ visita
                SELECT v.idSucursal
                FROM Visitan v
                WHERE v.idCliente = c.id
            )
    );