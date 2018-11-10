// instancio todas las dependencias a usar en el API.
var express = require('express');
var sql = require('mssql');
var cors = require('cors');
var bodyparser = require('body-parser');
var env = require('dotenv');

// Almaceno toda la funcionalidad del espress en la variable app.
var app = express();

const result = env.config();

// Ejecuto las funciones
app.use(cors());
app.use(bodyparser());

// creao una variable que almacenara la funcion de configuracion d acceso a la base detos.
const sqlconfig={
    server: process.env.DB_SERVER,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT),
    debug: true,
    options: {
        encrypt: false,
        instanceName: process.env.DB_INSTANCE_NAME
    }
}

// Crear la funcion que me atrapará errores.
app.use(function(err, req, res, next){
    console.log(err);
    res.send({success: false, message: err});
});

// Escucho el puerto para levantar el servidor
app.listen(parseInt(process.env.APP_PORT), () => {
    console.log("Esta corriendo el servidor!!!")
    console.log(result.parsed);
    console.log(sqlconfig);
});

// Creo funcion get para que los estudiantes pueden ver todas las clases a las que se encuentran matriculados.
app.get('/v1/search', (req, res, next) =>{
    // Obtendre del querystring el parametro de busqueda del usuario.
    // var SongTittle = req.query.q || "n/a";
    // var ArtistName = req.query.q || "n/a";
    // var GenreName = req.query.q || "n/a";
    // var CoverUrl = req.query.q || "n/a";
    var q = req.query.q || "n/a";
    var limit= req.query.limit || 10;

    // Comprobamos que los datos se hayan enviado
    if(!q){
        res.send("<h1>Se requiere un dato de busqueda.</h1> ");
    }

    // Ejecuto la consulta a la base de datos
    sql.connect(sqlconfig).then(() => {
        return sql.query(`select TOP (${limit}) dbo.Artists.ArtistName,dbo.Genres.GenreName,Songs.CoverUrl, Songs.SongTittle, Songs.SongLength from dbo.Artists,dbo.Genres, dbo.Songs where SongTittle = '${q}';`);
    }).then(result => {
        var data = {
            seccess: true,
            message: '',
            data: result.recordset,
        }
        res.send(data);

        // cerrare la conexion.
        sql.close();
    }).catch(err => {
        return next(err);
    });
});