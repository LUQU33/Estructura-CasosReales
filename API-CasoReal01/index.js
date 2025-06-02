// Modulos
const http = require('node:http');
const url = require('node:url');
const mysql = require('mysql2');
const { error } = require('node:console');

// Conexión a MySQL
const conection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '772312',
    database: 'product_master'
});

// Conexión Inicial
conection.connect(err => {
    if (err) {
        console.error(`Error al conectar con la base de datos: ${err}`);
        return;
    }
    console.log('Conectado a la base de datos');
});

// Creamos el servidor
const server = http.createServer((req, res) => {

    const myUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = myUrl.pathname.split('/').filter(Boolean);

    if (pathParts[0] === 'api' && pathParts[1] === 'product'){
        const productId = parseInt(pathParts[2]);

        if (req.method === 'GET') {
            const query = 'SELECT * FROM products WHERE id = ?';
            conection.query(query, [productId], (err, results) => {
                if (err) {
                    res.writeHead(500, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({error: 'Error en la consulta a la base de datos.'}));
                    return;
                }

                if (results.length > 0) {
                    res.writeHead(200, {'content-type': 'application/json'});
                    res.end(JSON.stringify(results[0]));
                } else {
                    res.writeHead(404, {'content-type': 'application/json'});
                    res.end(JSON.stringify({error: 'Producto no encontrado.'}));
                }
            });

        } else if (req.method === 'POST') {
            let body = '';

            req.on('data', chunk => body += chunk.toString());

            req.on('end', () => {
                const { name, description } = JSON.parse(body);

                const query = 'INSERT INTO products (name, description) VALUES (?, ?)';
                conection.query(query, [name, description], (err, result) => {
                    if (err) {
                        res.writeHead(500, {'content-type': 'application/json'});
                        res.end(JSON.stringify({error: 'Error al crear el producto.'}))
                        return;
                    }

                    res.writeHead(201, {'content-type': 'application/json'});
                    res.end(JSON.stringify({message: 'Producto creado', id: result.insertId}));
                });
            });

        } else if (req.method === 'PUT') {
            let body = '';

            req.on('data', chunk => body += chunk.toString());

            req.on('end', () => {
                const { name, description } = JSON.parse(body);

                const query = 'UPDATE products SET name = ?, description = ? WHERE id = ?';
                conection.query(query, [name, description, productId], (err, result) => {
                    if (err) {
                        res.writeHead(500, {'content-type': 'application/json'});
                        res.end(JSON.stringify({error: 'Error al actualizar el producto.'}));
                        return;
                    }

                    res.writeHead(200, {'content-type': 'application/json'});
                    res.end(JSON.stringify({message: 'Producto actualizado'}));
                });
            });

        } else if (req.method === 'PATCH') {
            let body = '';

            req.on('data', chunk => body += chunk.toString());

            req.on('end', () => {
                const updateData = JSON.parse(body);
                const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
                const values = Object.values(updateData);

                const query = `UPDATE products SET ${fields} WHERE id = ?`;
                conection.query(query, [...values, productId], (err, result) => {
                    if (err) {
                        res.writeHead(500, {'content-type': 'application/json'});
                        res.end(JSON.stringify({error: 'Error al actualizar el producto.'}));
                        return;
                    }

                    res.writeHead(200, {'content-type': 'application/json'});
                    res.end(JSON.stringify({message: 'Producto actualizado parcialmente.'}));
                });
            });
            
        } else if (req.method === 'DELETE') {
            const query = 'DELETE FROM products WHERE id = ?';
            conection.query(query, [productId], (err, result) => {
                if (err) {
                    res.writeHead(500, {'content-type': 'application/json'});
                    res.end(JSON.stringify({error: 'Error al eliminar el producto.'}))
                    return;
                }

                if (result.affectedRows === 0){
                    res.writeHead(404, {'content-type': 'application/json'});
                    res.end(JSON.stringify({message: 'Producto no encontrado.'}));
                } else {
                    res.writeHead(200, {'content-type': 'application/json'});
                    res.end(JSON.stringify({message: 'Producto eliminado.'}));
                }
            });

        } else {
            res.writeHead(405, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Método no permitido.'}));
        }

    } else {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Ruta no válida.'}));
    }
});

// Escuchar puerto
server.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
})