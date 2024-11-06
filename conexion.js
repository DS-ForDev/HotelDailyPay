const mysql = require("mysql2");

const connection = mysql.createConnection(
    {
        host: 'localhost',
        port: 3312,
        user: 'root',
        password: '1234',
        database: 'Hotel'
    }
);

connection.connect((error) => {
    if (error) {
        console.log("Error tratando de conectar a la Base de Datos", error);
        return;
    } else {
        console.log("Conexion exitosa a la base de datos..");
    }
}
);

module.exports = connection;