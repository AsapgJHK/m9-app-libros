import { Pool } from 'pg';
import 'dotenv/config'; 


const pool = new Pool({
    user: process.env.DB_USER || 'tu_usuario',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'bookstore_db',
    password: process.env.DB_PASSWORD || 'tu_password',
    port: process.env.DB_PORT || 5432,
});


async function initializeDatabase() {
    try {
        
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS libros (
                id SERIAL PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL UNIQUE, 
                cantidad_disponible INTEGER NOT NULL DEFAULT 0
            );
        `;
        await pool.query(createTableQuery);
        console.log('✅ Tabla "libros" asegurada/creada en PostgreSQL.');

        
        const initialBooks = [
            { nombre: "Cien Años de Soledad", cantidad_disponible: 15 },
            { nombre: "1984", cantidad_disponible: 8 },
            { nombre: "El Principito", cantidad_disponible: 25 },
            { nombre: "Don Quijote de la Mancha", cantidad_disponible: 5 },
            { nombre: "Un Mundo Feliz", cantidad_disponible: 12 },
        ];

        for (const book of initialBooks) {
             const insertQuery = `
                INSERT INTO libros (nombre, cantidad_disponible) 
                VALUES ($1, $2)
                ON CONFLICT (nombre) DO NOTHING;
            `;
            await pool.query(insertQuery, [book.nombre, book.cantidad_disponible]);
        }
        console.log('📚 Inventario inicial cargado o verificado.');

    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error);
        
        throw error; 
    }
}

export { pool, initializeDatabase };