-- =============================================
-- Script para crear la base de datos RelojDB
-- Ejecutar en SQL Server Management Studio (SSMS)
-- =============================================

-- Crear la base de datos
CREATE DATABASE RelojDB;
GO

USE RelojDB;
GO

-- Tabla Marcas
CREATE TABLE Marcas (
    Id          INT PRIMARY KEY IDENTITY(1,1),
    Nombre      NVARCHAR(100) NOT NULL,
    PaisOrigen  NVARCHAR(100) NOT NULL,
    Descripcion NVARCHAR(500) NOT NULL
);
GO

-- Tabla Relojes
CREATE TABLE Relojes (
    Id      INT PRIMARY KEY IDENTITY(1,1),
    Nombre  NVARCHAR(100)  NOT NULL,
    Modelo  NVARCHAR(100)  NOT NULL,
    Precio  DECIMAL(18,2)  NOT NULL,
    Stock   INT            NOT NULL DEFAULT 0,
    MarcaId INT            NOT NULL,
    CONSTRAINT FK_Relojes_Marcas FOREIGN KEY (MarcaId) REFERENCES Marcas(Id)
);
GO

-- Datos de ejemplo
INSERT INTO Marcas (Nombre, PaisOrigen, Descripcion) VALUES
('Rolex',   'Suiza',    'Marca suiza de relojes de lujo fundada en 1905'),
('Casio',   'Japon',    'Marca japonesa conocida por sus relojes digitales'),
('Seiko',   'Japon',    'Fabricante japones fundado en 1881'),
('Omega',   'Suiza',    'Marca suiza usada por astronautas y agentes 007');
GO

INSERT INTO Relojes (Nombre, Modelo, Precio, Stock, MarcaId) VALUES
('Submariner',        'Sub-116610',  12500.00,  5, 1),
('Datejust',          'DJ-126200',    8900.00,  3, 1),
('G-Shock Classic',   'DW-5600E',      89.99, 50, 2),
('Pro Trek',          'PRW-3500',     299.99, 20, 2),
('Seiko 5 Sports',    'SRPD55K1',     249.99, 15, 3),
('Seiko Presage',     'SARX055',      595.00,  8, 3),
('Seamaster 300M',    'SM-210.30',   5200.00,  6, 4),
('Speedmaster Pro',   'SP-310.30',   6300.00,  4, 4);
GO
