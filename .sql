CREATE TABLE IF NOT EXISTS libros (
    
    id SERIAL PRIMARY KEY,
    
    
    nombre VARCHAR(255) NOT NULL UNIQUE,
    
    
    cantidad_disponible INTEGER NOT NULL DEFAULT 0
);



INSERT INTO libros (nombre, cantidad_disponible)
VALUES 
    ('Cien Años de Soledad', 15),
    ('1984', 8),
    ('El Principito', 25),
    ('Don Quijote de la Mancha', 5),
    ('Un Mundo Feliz', 12)
ON CONFLICT (nombre) DO NOTHING;


SELECT * FROM libros;