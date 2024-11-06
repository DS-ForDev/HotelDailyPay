// Importación de módulos
const path = require('path');   // Para ejecutar desde index.html
const express = require('express');
const connection = require('./conexion');  // Asegúrate de que tu archivo 'conexion.js' esté correctamente configurado
const app = express();

app.use(express.json());  // Middleware para parsear solicitudes con formato JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'template')));  // Servir archivos estáticos
app.use('/assets', express.static(path.join(__dirname, 'assets')));


// Ruta GET para verificar el estado de la API
app.get('/api/prueba', (req, res) => {
    res.send("La API está funcionando bien...");
});

// --- CRUD para la tabla huespedes ---

// Obtener todos los huéspedes
app.get('/api/huespedes', (req, res) => {
    const query = "SELECT * FROM huespedes";
    connection.query(query, (error, result) => {
        if (error) res.status(500).json({ success: false, message: "Error al recuperar los datos", details: error.message });
        else res.status(200).json({ success: true, message: "Lista de huéspedes", data: result });
    });
});

// Agregar un nuevo huésped
app.post('/api/guardarhuespedes', (req, res) => {
    const { id_huesped, nombre, correo, telefono, direccion } = req.body;
    const sql = 'INSERT INTO huespedes (id_huesped, nombre, correo, telefono, direccion) VALUES (?, ?, ?, ?, ?)';
    connection.query(sql, [id_huesped, nombre, correo, telefono, direccion], (error, result) => {
        if (error) {
            res.status(500).json({ error });
        } else {
            res.status(201).json({ message: "Huésped agregado exitosamente", data: { id: result.insertId, nombre, correo, telefono, direccion } });
        }
    });
});

// Ruta PUT para actualizar un huésped existente
app.put('/api/huespedes/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, correo, telefono, direccion } = req.body;

    if (!id) {
        return res.status(400).json({ error: "The 'id' field is required for update." });
    }

    const query = `
        UPDATE huespedes
        SET 
            nombre = COALESCE(?, nombre),
            correo = COALESCE(?, correo),
            telefono = COALESCE(?, telefono),
            direccion = COALESCE(?, direccion)
        WHERE id_huesped = ?
    `;
    connection.query(query, [nombre, correo, telefono, direccion, id], (error, result) => {
        if (error) {
            res.status(500).json({ error });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: "No guest found with the provided id." });
        } else {
            res.status(200).json({ message: "Guest updated successfully", id, nombre, correo, telefono, direccion });
        }
    });
});

// Ruta DELETE para eliminar un huésped
app.delete('/api/huespedes/:id', (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "The 'id' field is required for deletion." });
    }

    const query = 'DELETE FROM huespedes WHERE id_huesped = ?';
    connection.query(query, [id], (error, result) => {
        if (error) {
            res.status(500).json({ error });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ message: "No guest found with the provided id." });
        } else {
            res.status(200).json({ message: `Guest deleted successfully: ${id}` });
        }
    });
});

// Configuración del puerto y mensaje de conexión
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en el puerto ${PORT}`);

});

// Ruta POST para guardar el formulario

app.post('/api/contact', (req, res) => {
    const { name, email, phone, message } = req.body;
    const sql = 'INSERT INTO formulario (name, email, phone, message) VALUES (?, ?, ?, ?)';

    connection.query(sql, [name, email, phone, message], (error, result) => {
        if (error) {
            res.status(500).json({ error });
        } else {
            res.status(201).json({ 
                message: "Mensaje de contacto guardado exitosamente", 
                data: { 
                    id: result.insertId, 
                    name, 
                    email, 
                    phone, 
                    message 
                } 
            });
        }
    });
});

// Ruta GET para listar el formulario 

// Ruta para obtener todos los registros del formulario
app.get('/api/formulario', (req, res) => {
    const sql = 'SELECT * FROM formulario';
    
    connection.query(sql, (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Error al obtener los datos del formulario' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Registro de usuario
app.post('/api/registro', (req, res) => {
    const { nombre, correo, contrasea } = req.body;
    
    const sql = 'INSERT INTO usuarios (nombre, correo, contrasea) VALUES (?, ?, ?)';
    
    connection.query(sql, [nombre, correo, contrasea], (error, result) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: "Error al registrar usuario",
                error: error
            });
        } else {
            res.status(201).json({
                success: true,
                message: "Usuario registrado exitosamente"
            });
        }
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { correo, contrasea } = req.body;
    
    const sql = 'SELECT * FROM usuarios WHERE correo = ? AND contrasea = ?';
    
    connection.query(sql, [correo, contrasea], (error, results) => {
        if (error) {
            res.status(500).json({
                success: false,
                message: "Error en el servidor"
            });
        } else if (results.length === 0) {
            res.status(401).json({
                success: false,
                message: "Correo o contraseña incorrectos"
            });
        } else {
            res.status(200).json({
                success: true,
                message: "Inicio de sesión exitoso",
                usuario: results[0]
            });
        }
    });
});
