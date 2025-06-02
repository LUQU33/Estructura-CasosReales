const http = require('node:http');
const fs = require('node:fs');
const url = require('node:url');

// Definimos el puerto
const PORT = 3000;

// Creamos el servidor
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean); // ['api', 'product', '1']

    // Solo continuamos si es ruta tipo /api/product
    if (pathParts[0] === 'api' && pathParts[1] === 'product') {
        const productId = parseInt(pathParts[2]);

        // GET /api/product/:id
        if (req.method === 'GET') {
            fs.readFile('./products.json', 'utf-8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Error leyendo el archivo' }));
                    return;
                }

                const products = JSON.parse(data);
                const product = products.find(p => p.id === productId);

                if (product) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(product));
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Producto no encontrado' }));
                }
            });
        }
        else if (req.method === 'POST') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ mensaje: `Producto creado exitosamente (POST)` }));
        }
        else if (req.method === 'PUT') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ mensaje: `Producto con id ${productId} actualizado completamente (PUT)` }));
        }
        else if (req.method === 'PATCH') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ mensaje: `Producto con id ${productId} actualizado parcialmente (PATCH)` }));
        }
        else if (req.method === 'DELETE') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ mensaje: `Producto con id ${productId} eliminado (DELETE)` }));
        }
        else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Método no permitido para esta ruta' }));
        }

    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Ruta no válida' }));
    }
});

// Escuchamos el puerto
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});