import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';    
import helmet from 'helmet';  
import morgan from 'morgan';  
import path from 'path'; 
import { fileURLToPath } from 'url'; 


import { pool, initializeDatabase } from './db_config.js'; 


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();

const PORT = process.env.PORT || 8080; 


app.use(helmet()); 
app.use(cors());   
app.use(morgan('dev')); 


app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 



app.get('/api/books', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nombre, cantidad_disponible FROM libros ORDER BY id ASC');
        res.json(result.rows); 
    } catch (error) {
        console.error('Error al obtener libros:', error);
        res.status(500).json({ success: false, message: 'Error al obtener libros de la base de datos.' });
    }
});


app.post('/api/purchase', async (req, res) => {
    
    const { bookId, quantity } = req.body;
    const qty = parseInt(quantity, 10);
    
    if (qty <= 0 || isNaN(qty)) {
        return res.status(400).json({ success: false, message: 'La cantidad debe ser un número positivo.' });
    }

    const client = await pool.connect(); 

    try {
        await client.query('BEGIN'); 

        
        const checkQuery = 'SELECT cantidad_disponible, nombre FROM libros WHERE id = $1 FOR UPDATE';
        const bookResult = await client.query(checkQuery, [bookId]);

        if (bookResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ success: false, message: 'Libro no encontrado.' });
        }

        const book = bookResult.rows[0];
        
        if (book.cantidad_disponible < qty) {
            await client.query('ROLLBACK');
            return res.status(400).json({ success: false, message: `Stock insuficiente. Disponibles: ${book.cantidad_disponible}.` });
        }

        
        const newQuantity = book.cantidad_disponible - qty;
        const updateQuery = 'UPDATE libros SET cantidad_disponible = $1 WHERE id = $2';
        await client.query(updateQuery, [newQuantity, bookId]);

        await client.query('COMMIT'); 
        res.json({ success: true, message: `Compra exitosa de ${qty} unidad(es) de "${book.nombre}".` });

    } catch (error) {
        await client.query('ROLLBACK'); 
        console.error('Error de compra con DB:', error);
        res.status(500).json({ success: false, message: 'Error en el procesamiento de la compra.' });
    } finally {
        client.release(); 
    }
});




const publicPath = path.join(__dirname, 'public');
console.log(`[STATUS] El servidor buscará archivos estáticos en: ${publicPath}`);
app.use(express.static(publicPath));


app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Error 404: La ruta solicitada (${req.method} ${req.originalUrl}) no existe.`,
        detail: `Si estás buscando la app, asegúrate que 'index.html' esté en la carpeta '${publicPath}'.`
    });
});



initializeDatabase()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Servidor Express iniciado en http://localhost:${PORT}`);
            console.log(`\n¡Abre http://localhost:${PORT} en tu navegador para ver la tienda!`);
        });
    })
    .catch((err) => {
        console.error('No se pudo iniciar el servidor debido a un error de DB.');
        process.exit(1); 
    });