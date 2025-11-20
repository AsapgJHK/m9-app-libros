import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';    
import helmet from 'helmet';  
import morgan from 'morgan';  
import path from 'path'; 
import { fileURLToPath } from 'url'; 


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const app = express();

const PORT = process.env.PORT || 8080; 


app.use(helmet()); 
app.use(cors());   
app.use(morgan('dev')); 


app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 



const publicPath = path.join(__dirname, 'public');
console.log(`[STATUS] El servidor buscará archivos estáticos en: ${publicPath}`);
app.use(express.static(publicPath));


app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Error 404: La ruta solicitada (${req.method} ${req.originalUrl}) no existe.`,
        detail: `La aplicación web (index.html) no se encontró en la carpeta '${publicPath}'.`
    });
});


app.listen(PORT, () => {
    console.log(`🚀 Servidor Express iniciado en http://localhost:${PORT}`);
    console.log(`\n¡Abre http://localhost:${PORT} en tu navegador para ver la tienda!`);
});