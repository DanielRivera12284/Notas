const express = require('express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Configuración de la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // tu usuario de MySQL
    password: '', // tu contraseña de MySQL
    database: 'controlnotas'
});

db.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
    } else {
        console.log('Conectado a la base de datos MySQL');
    }
});

// Ruta para registrar un nuevo usuario
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Insertar directamente la contraseña en texto plano
    db.query('INSERT INTO usuario (usuario, contraseña) VALUES (?, ?)', [username, password], (err, result) => {
        if (err) return res.json({ error: err });

        res.json({ success: 'Usuario registrado exitosamente' });
    });
});

// Ruta para el login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM usuario WHERE usuario = ?', [username], (err, result) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.json({ error: err });
        }

        if (result.length === 0) {
            return res.json({ error: 'Usuario no encontrado' });
        }

        const user = result[0];
        console.log('Usuario encontrado:', user); // Verificar datos del usuario

        // Comparar contraseñas en texto plano
        if (password !== user.contraseña) { 
            console.log('Contraseña ingresada:', password);
            console.log('Contraseña en la base de datos:', user.contraseña);
            return res.json({ error: 'Contraseña incorrecta' });
        }

        // Crear un token JWT
        const token = jwt.sign({ id: user.id }, 'secretKey', { expiresIn: '1h' });

        res.json({ success: 'Login exitoso', token, role: user.rol });
    });
});

// Ruta protegida (ejemplo)
app.get('/menu', (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ error: 'Token requerido' });
    }

    jwt.verify(token, 'secretKey', (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }

        res.json({ success: 'Bienvenido al menú' });
    });
});

// Iniciar el servidor en el puerto 3001
app.listen(3001, () => {
    console.log('Servidor corriendo en puerto 3001');
});
