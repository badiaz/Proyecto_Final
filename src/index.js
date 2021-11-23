const express = require('express');
const app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const passport = require('passport');
const { json } = require('body-parser');
const cookieParser = require('cookie-parser');
const PassportLocal = require('passport-local').Strategy;
const multer = require('multer');
const fecharuta = [];
const spawn = require("child_process").spawn;
const fs = require('fs');
var https = require('https');
var pdf = require('html-pdf');
var fotosfile3;


app.use(bodyParser());
app.set('view engine', 'ejs');
app.use(express.json({ limit: '1mb' }));
//para poder acceder
app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/fotos-rutas'),
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
// multer
app.use(multer({
    storage,
    dest: path.join(__dirname, 'public/fotos-rutas'),
    fileFilter: function (req, file, cb) {

        var filetypes = /jpeg|jpg|png/;
        var mimetype = filetypes.test(file.mimetype);
        var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb("Error: File upload only supports the following filetypes - " + filetypes);
    }
}).array('fotos'));

/////POSTGRE/////
const { pool, Client } = require("pg");
const { request } = require('https');
const { exec } = require('child_process');
const { Console } = require('console');
const connectionString =
    "postgressql://Brayan:tiotaxi22@basededatostaxi.csgckedzjvw7.us-east-2.rds.amazonaws.com:5432/postgres";
const client = new Client({
    connectionString: connectionString,
});
//Generar conexion con la base de datos
client.connect(function (err) {
    if (err) {
        console.log(err)
    } else {
        console.log("Listo, papi. Conectado.")
    }
});

////////////**SESION*////////////
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser('secreto'));
app.use(session({
    secret: 'secreto',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new PassportLocal(function (username, contra, done) {

}))
////////////////////////////////////////////

app.get('/', (request, response) => {
    request.session.loggedin = false;
    request.session.loggedin1 = false;
    request.session.loggedin2 = false;
    response.render(path.join(__dirname + '/index.ejs'));
});

//Login
app.get('/login', (request, response) => {
    response.render(path.join(__dirname + '/login.ejs'));
});

//get css
app.get('/estilo', (request, response) => {
    response.sendFile(path.join(__dirname + '/public/css/Estilos.css'));
});
app.get('/loginestilo', (request, response) => {
    response.sendFile(path.join(__dirname + '/public/css/login.css'));
});
app.get('/userestilo', (request, response) => {
    response.sendFile(path.join(__dirname + '/public/css/users.css'));
});
app.get('/mainestilo', (request, response) => {
    response.sendFile(path.join(__dirname + '/public/css/main.css'));
});
app.get('/reportestilo', (request, response) => {
    response.sendFile(path.join(__dirname + '/public/css/report.css'));
});
app.get('/reportuser', (request, response) => {
    response.sendFile(path.join(__dirname + '/public/css/reportuser.css'));
});

//Admin
app.get('/admin', function (request, response) {
    console.log(request.session)

    if (request.session.loggedin2 == true) {
        return response.render(path.join(__dirname + '/admin.ejs'));
    } else {
        return response.render(path.join(__dirname + '/login.ejs'));
    }
});

//Ayudante (Registro caso)
app.get('/registro_caso', function (request, response) {

    if (request.session.loggedin1) {
        return response.render(path.join(__dirname + '/analisis_de_ruta.ejs'));
    } else {
        return response.render(path.join(__dirname + '/login.ejs'));
    }
});

//Ayudante (Obtener caso)
app.get('/report', function (request, response) {

    if (request.session.loggedin1) {
        return response.render(path.join(__dirname + '/report.ejs'));
    } else {
        return response.render(path.join(__dirname + '/login.ejs'));
    }
});

//Medico (General)
app.get('/general', function (request, response) {

    if (request.session.loggedin1) {
        return response.render(path.join(__dirname + '/general.ejs'));
    } else {
        return response.render(path.join(__dirname + '/login.ejs'));
    }
});

//Medico (Busqueda)
app.get('/busqueda', function (request, response) {
    request.session.loggedin = true;
    if (request.session.loggedin) {
        return response.render(path.join(__dirname + '/busqueda.ejs'));
    } else {
        return response.render(path.join(__dirname + '/login.ejs'));
    }
});
app.get('/nuevo', function (request, response) {
    request.session.loggedin = true;
    if (request.session.loggedin) {
        return response.render(path.join(__dirname + '/nuevo.ejs'));
    } else {
        return response.render(path.join(__dirname + '/login.ejs'));
    }
});


app.post('/form', (req, res) => {
    let sql = `INSERT INTO usuarios(nombre, apellido, cedula, rol, usuario, contra) VALUES('${req.body.nombre}','${req.body.apellido}',${req.body.cedula},2,'${req.body.usuario}','${req.body.contra}' ) RETURNING *`;
    let post = [req.body.nombre, req.body.apellido, req.body.cedula, req.body.rol, req.body.usuario, req.body.contra];
    client
        .query(sql)
        .then(raw => {
            console.log("Anotado, crack. Pilla: ")
            console.log(raw.rows[0])
        })
        .catch(e => console.log(e))
    res.status(204).send();
});

app.post('/estado', (req, res) => {
    var data = req.body.con;
    var id = data[0];
    var fecha = data[1];
    var estado = data[2];
    let post = [id, fecha, estado];
    let sql = `INSERT INTO public.estado (
        id, fecha, estado) VALUES (
        '${id}'::bigint, '${fecha}'::date, ${estado}::bigint)
         returning *;`;

    client
        .query(sql)
        .then(raw => {
            console.log("Anotado, crack. Pilla: ")
            console.log(raw.rows)
            res.json(raw.rows)
        })
        .catch(e => {
            console.log("Nada mi rey, como que no.");
            console.log(e)
        })
});

app.post('/login', (req, res) => {
    console.log(req.body)
    var username = req.body.username;
    var contra = req.body.contra;
    let results;
    if (username && contra) {
        let sql = `SELECT * FROM usuarios WHERE usuario = '${username}' AND contra = '${contra}'`;
        client.query(sql)
            .then(raw => {
                results = raw.rows[0];
                console.log(results);

                if (username == results.usuario && contra == results.contra && 1 == results.rol) {
                    req.session.loggedin = true;
                    req.session.username = username;

                    res.redirect(301, '/general');
                } else if (username == results.usuario && contra == results.contra && 2 == results.rol) {
                    req.session.loggedin1 = true;
                    req.session.username = username;
                    res.redirect(301, '/registro_caso');

                } else if (username == results.usuario && contra == results.contra && 3 == results.rol) {
                    req.session.loggedin2 = true;
                    req.session.username = username;

                    res.redirect(301, '/admin');
                };

            })
            .catch(e => {
                console.log(e)
                res.send(401, 'Nombre de usuario y/o contraseña incorrecta')
            });


    }


});

app.post('/logeado_ayudante', (req, res) => {
    console.log(req.body)
    let sql = `INSERT INTO casos(nombre, apellido, cedula, sexo, fechanac, direc, dirt, resultado, fechaex) VALUES('${req.body.nombre}','${req.body.apellido}',${req.body.cedula},${req.body.sexo},'${req.body.fechanac}','${req.body.direc}','${req.body.dirt}','${req.body.resultado}','${req.body.fechaex}' ) RETURNING *`;

    let post = [req.body.nombre, req.body.apellido, req.body.cedula, req.body.rol, req.body.usuario, req.body.contra];
    client.query(sql)

        .then(raw => {
            //     console.log("Anotado, crack. Pilla: ")
            //     console.log(raw.rows[0])
            var buffer = raw.rows[0];
            var id = buffer.id
            //     var estado = buffer.resultado
            //     var fecha = buffer.fechaex;
            let sql1 = `INSERT INTO public.estado (id, fecha, estado) VALUES ('${id}'::bigint, '${req.body.fechaex}'::date, ${req.body.resultado}::bigint) returning *`;
            //     let sql1 = `INSERT INTO estado(id, fecha, estado) VALUES(${id},${fecha},${estado}) RETURNING *`;
            //     client
            //         .query(sql1)
            client.query(sql1)
        })
        .catch(e => console.log(e))
    res.status(204).send();
});

app.post('/tabla', (req, res) => {
    var nombre = req.body.con;
    sql = ` SELECT * FROM estado
              WHERE id = '${nombre}'
              ORDER BY estado.fecha DESC
              `;
    client
        .query(sql)
        .then(raw => {
            var data = raw.rows[0];
            id = data.id;
            res.json(raw.rows);
            console.log('Tabla enviada.')

        })

});

//Buscar caso
app.post('/gest_caso', (req, res) => {
    var nombre = req.body.con;
    var id;
    let sql = ` SELECT * FROM casos
              WHERE id = '${parseInt(nombre)}' OR cedula = '${parseInt(nombre)}'
              ORDER BY casos.fechaex DESC
              LIMIT 1`;
    client
        .query(sql)
        .then(raw => {
            var data = raw.rows[0];
            id = data.id;
            res.json(raw.rows[0]);
            console.log('caso enviado')

        })
        .catch(e => {
            let sql1 = ` SELECT * FROM casos
              WHERE nombre LIKE '${nombre}' OR apellido LIKE '${nombre}'
              ORDER BY casos.fechaex DESC
              LIMIT 1`;
            client
                .query(sql1)
                .then(raw => {
                    res.json(raw.rows[0]);
                    console.log('caso enviado')
                })
                .catch(e => { console.log(e) });
        });
});

app.post('/casos', (req, res) => {

    let sql1 = `SELECT  estado.id, estado.estado, MAX(fecha) 
    from estado 
    GROUP BY estado.id, estado.estado
    order by estado.id ASC, MAX DESC; `
    var data;
    client
        .query(sql1)
        .then(raw => {
            console.log(raw.rows)
            res.json(raw.rows);
        })
        .catch(e => console.log(e))
});




app.post('/mapaplan2', (req, res) => {
    var idcaso = req.body.con;
    let sql = `SELECT es.fecha, es.estado FROM estado es WHERE es.id = ${req.body.con} `;
    let query = database.query(sql, (err, result) => {
        if (err) { throw err; }
        res.end(JSON.stringify(result));
        console.log(result)
    });
});

server.listen(15002, () => {
    console.log('Servidor abierto en puerto 15002');
});

app.post('/resumencasos', (req, res) => {
    let sql = `SELECT resultado,COUNT(resultado) FROM casos group by resultado`
    client
        .query(sql)
        .then(raw => res.json(raw.rows))
});
app.post('/resumenestados', (req, res) => {
    let sql = `SELECT estado, COUNT(estado) FROM estado group by estado`
    client
        .query(sql)
        .then(raw => res.json(raw.rows))
});
app.post('/resumencasospordia', (req, res) => {
    let sql = 'SELECT COUNT(fechaex), resultado, fechaex FROM casos group by fechaex, resultado'
    client
        .query(sql)
        .then(raw => res.json(raw.rows))
});


app.post('/inforuta', (req, res) => {

    console.log(req.body)
    var filelenght = req.files.length;
    let files = req.files;
    let fotosfile;
    let fotosfile1;

    console.log(files)
    var i = 0;
    for (i; i < filelenght; i++) {
        fotosfile = files[i].originalname;
        fotosfile1 = fotosfile1 + "," + fotosfile;
        console.log(fotosfile1)
    }

    console.log(filelenght)
    var fotosfile2 = fotosfile1.replace('undefined,', '')
    console.log(fotosfile2)
    fotosfile3 = fotosfile2.split(',')

    console.log(fotosfile3)
    let sql = `SELECT * FROM inforuta id ORDER BY id DESC
    LIMIT 1`;
    client.query(sql)
        .then(raw => {
            console.log("este es el id, crack. Pilla: ")
            console.log(raw.rows[0].id)
            fotosfile3 = { fotos: fotosfile3, id: raw.rows[0].id }
            res.json(fotosfile3);
            res.status(204);
        })
        .catch(e => console.log(e))


    /* document.getElementById('mostrarimagenes').innerHTML('<img src="/fotos-rutas/'+fotosfile2[0]+'">'); */
});

app.post('/Riesgo', (req, res) => {

    let bicicletas = req.body.bicicletas;
    bicicletas = "0" + bicicletas;
    let motos = req.body.motos;
    motos = "0" + motos;
    let peaton = req.body.peaton;
    peaton = "0" + peaton;
    let via = req.body.via;
    via = "0" + via;
    let deslizamiento = req.body.deslizamiento;
    deslizamiento = "0" + deslizamiento;
    let obrasvia = req.body.obrasvia;
    obrasvia = "0" + obrasvia;
    let velocidad = req.body.velocidad;
    velocidad = "0" + velocidad;
    let alumbrado = req.body.alumbrado;
    alumbrado = "0" + alumbrado;
    let separador = req.body.separador;
    separador = "0" + separador;
    let calzadadiv = req.body.calzadadiv;
    calzadadiv = "0" + calzadadiv;
    let hora = req.body.hora;
    hora = "0" + hora;

    console.log(req.body)
    var options = {
        host: 'maps.googleapis.com',
        path: `/maps/api/geocode/json?latlng=${req.body.latitud},${req.body.longitud}&key=AIzaSyCEen29bixPCHvTa7DWIErzdWhPg8Zp60Y`
    };
    https.request(options, callback).end();
    console.log(req.body)

    var Process = spawn('python', ["PruebaPf.py", bicicletas, motos, peaton, via, velocidad, alumbrado, hora]);

    Process.stdout.on('data', (data) => {
        var calriesgo = { riesgo: data.toString('utf8') }
        console.log(calriesgo);
        res.json(calriesgo);
        var medidor = data.toString('utf8');
        medidor = medidor.substring(0, medidor.length - 4)
        var valormedidor = parseFloat(medidor) * 10;
        console.log('papi mira ve  ' + valormedidor);
        let sql = `INSERT INTO public.inforuta(id,fecharuta, latitud, longitud, notas, fotos, riesgo,geocode,latitud1,longitud1) VALUES('${req.body.id}','${req.body.fecharuta}','${req.body.latitud}','${req.body.longitud}','${req.body.notas}','${req.body.fotos}','${valormedidor}','${geocoded.results[0].formatted_address}','${req.body.latitud1}','${req.body.longitud1}') RETURNING *`;
        client.query(sql)

    });


})

var geocoded;
callback = function (response) {
    var str = '';

    //another chunk of data has been received, so append it to `str`
    response.on('data', function (chunk) {
        str += chunk;
    });

    //the whole response has been received, so we just print it out here
    response.on('end', function () {

        geocoded = JSON.parse(str);
        console.log(geocoded.results[0].formatted_address)
    });
}



app.post('/consultaID', (req, res) => {
    var nombre = req.body.con;
    console.log(nombre);
    let sql = `SELECT * FROM ruta WHERE idruta = ${req.body.con}`;
    client.query(sql)
        .then(raw => {
            console.log("estas son, crack. Pilla: ")
            console.log(raw.rows[0])
            if (raw.rows[0] == undefined) {
                var resultado = { id: 0 }
                res.json(resultado)
            } else {
                res.json(raw.rows[0]);
            }


        })
        .catch(e => console.log(e))
});

app.post('/mapageneral', (req, res) => {
    let sql = `SELECT  latitud, longitud,fecharuta, riesgo, geocode , latitud1, id, longitud1, notas, fotos from inforuta order by geocode DESC`
    client
        .query(sql)
        .then(raw => {
            var general = raw.rows;
            console.log(general)
            var generalTemp = []
            for (var i = 1; i < general.length - 1; i++) {
                var temp = general[i].geocode.split('-');
                var temp2 = general[i + 1].geocode.split('-');
                if (temp[0] == temp2[0]) {
                    if (general[i].id > general[i + 1].id) {
                        generalTemp.push(general[i]);
                    } else {
                        generalTemp.push(general[i + 1]);
                    }
                    i++;
                } else {
                    generalTemp.push(general[i]);
                }
            }

            var temp = general[general.length - 1].geocode.split('-');
            var temp2 = general[general.length - 2].geocode.split('-');
            if (temp[0] == temp2[0]) {
                if (general[general.length - 2].id > general[general.length - 1].id) {
                    generalTemp.push(general[general.length - 2]);
                } else {
                    generalTemp.push(general[general.length - 1]);
                }

            } else {
                generalTemp.push(general[general.length - 1]);
            }
            res.json(generalTemp);
            console.log(generalTemp);
        })

        .catch(e => console.log(e))
});

app.post('/informe', (req, res) => {
    var nombre = req.body.con;
    var fecharuta = req.body.fecharuta;
    console.log(nombre);
    let result;
    let rut;

    let intensidadriesgo;
    let Lat;
    let Lng;
    let Lat1;
    let Lng1;
    let descriptor;
    let sql = `SELECT * FROM inforuta WHERE id = ${req.body.con}`;
    client.query(sql)
        .then(raw => {
            console.log("estas son, crack. Pilla: ")
            result = raw.rows[0];
            console.log(result)

            intensidadriesgo = result.riesgo;
            if (intensidadriesgo <= 30) {
                intensidadriesgo = 0.3;
                descriptor = "Low";

            } else if (intensidadriesgo > 30 && intensidadriesgo <= 70) {
                intensidadriesgo = 0.5;
                descriptor = "Moderate";

            } else if (intensidadriesgo > 70 && intensidadriesgo <= 100) {
                intensidadriesgo = 1;
                descriptor = "High";

            }

            var contenido = `<!DOCTYPE html>
            <html lang="en">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css"
                    integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">
                <link rel="stylesheet" href="userestilo">
                <link rel="stylesheet" href="report.css" media="print">
                <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;600&display=swap" rel="stylesheet">
                <link href="https://unpkg.com/ionicons@4.5.10-0/dist/css/ionicons.min.css" rel="stylesheet">
            
                <title>Report</title>
            </head>
            
            <body>
                <div class="d-flex" id="content-wrapper">
                    <!-- Sidebar -->
                    <!--  <div id="sidebar-container" class="bg-primary">
                        <div class="logo">
                            <h4 class="text-light font-weight-bold mb-0"><img src="https://i.postimg.cc/k4cVktLT/RISK-TOOL.png" alt="">
                            </h4>
                        </div>
                        <div class="menu">
                            <a href="/registro_caso" class="d-block text-light p-3 border-0"><i
                                    class="icon ion-md-map lead mr-2"></i>
                                Registro de casos</a>
                            <a href="/obtener_caso" class="d-block text-light p-3 border-0"><i
                                    class="icon ion-md-search lead mr-2"></i>
                                Obtener caso</a>
                        </div>
                    </div> -->
                    <!-- Fin sidebar -->
            
                    <div class="w-100">
                        <!-- Navbar -->
                        <!-- <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
                            <div class="container">
                                <button class="navbar-toggler" type="button" data-toggle="collapse"
                                    data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                                    aria-expanded="false" aria-label="Toggle navigation">
                                    <span class="navbar-toggler-icon"></span>
                                </button>
            
                                <div class="collapse navbar-collapse" id="navbarSupportedContent">
                                    <ul class="navbar-nav ml-auto mt-2 mt-lg-0">
                                        <li class="nav-item dropdown">
                                            <a class="nav-link text-dark dropdown-toggle" href="#" id="navbarDropdown" role="button"
                                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                <img src="https://i.postimg.cc/j25tSgL0/prescripcion.png"
                                                    class="img-fluid rounded-circle avatar mr-2" alt="https://generated.photos/" />
                                                Usuario
                                            </a>
                                            <div class="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                                                <a class="dropdown-item" href="/">Cerrar sesión</a>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </nav> -->
                        <!-- Fin Navbar -->
            
                        <!-- Page Content -->
                        <div id="content" class="bg-grey w-100">
                            <section class="bg-light py-3">
                                <div class="container-fluid">
                                    <div class="row">
                                        <div class="col-lg-9 col-md-8">
                                            <h1 class="font-weight-bold mb-0">Report</h1>
                                            <p class="lead text-muted"></p>
                                        </div>
                                        <div class="col-lg-3 col-md-4 d-flex">
                                            <!-- <button class="btn btn-primary w-100 align-self-center">Descargar reporte de hoy</button> -->
                                        </div>
                                    </div>
                                </div>
                            </section>
            
                            <section>
                                <div class="container-fluid">
                                    <div class="row">
                                        <div class="col-lg-4 my-4">
                                            <div class="card rounded-0">
                                                <div class="card-header bg-light">
                                                    <h5 class="font-weight-bold mb-0">Route Information</h5>
                                                </div>
                                                <div class="card-body">
                                                    <table class="table">
                                                        <!-- <thead class="thead-dark">
                                                            <tr>
                                                                <th scope="col"></th>
                                                                <th scope="col"></th>
                                                            </tr>
                                                        </thead> -->
                                                        <tbody id="table">
                                                            <!-- Filas generadas dinamicamente xd -->
                                                            <tr>
                                                                <th scope="row">Product to be transported</th>
                                                                <td>
                                                                    <h6 class="mb-0" id="producto">-</h6>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th scope="row"> Risk product </th>
                                                                <td>
                                                                    <h6 class="mb-0" id="riesgoproducto">-</h6>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th scope="row"> UN Number </th>
                                                                <td>
                                                                    <h6 class="mb-0" id="UN">-</h6>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th scope="row"> Presentation </th>
                                                                <td>
                                                                    <h6 class="mb-0" id="presentation">-</h6>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th scope="row"> Packing </th>
                                                                <td>
                                                                    <h6 class="mb-0" id="packing">-</h6>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th scope="row"> Labels </th>
                                                                <td>
                                                                    <h6 class="mb-0" id="labels">-</h6>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <th scope="row"> Total Risk </th>
                                                                <td>
                                                                    <h6 class="mb-0" id="risk">-</h6>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    
                                                </div>
                                            </div>
                                        </div>
                                        <div class="saltopagina"></div>
                                        <div class="col-lg-8 my-4">
                                            <div class="card rounded-0">
                                                <div id ="selectpro" class="card-header bg-light">
                                                    <h5 class="font-weight-bold mb-4">Product</h5>
                                                    <h6 class="mb-3">Select the product to be transported</h6>
                                                    <select oninput="actualizar(this)" class="custom-select mb-4" id="lista_product"
                                                        name="lista_estados">
                                                        <option value="1">-</option>
                                                        <option value="2">Carbon disulfide</option>
                                                        <!-- <option value="3">Tratamiento en hospital</option>
                                                        <option value="4">En UCI</option>
                                                        <option value="1">Curado</option>
                                                        <option value="5">Fallecido</option> -->
                                                    </select>
                                                    <input onclick="generatePDF()" class="btn btn-primary" type="button" id="pdf" value="Save Report">
                                                </div>
                                                <div class="card-body">
                                                    <h5 class="font-weight-bold mb-4">Route Generator</h5>
                                                    <h6 class="mb-3"></h6>
                                                    <div id="map"></div>
                                                    
                                                </div>
                                                <br>
                            <div class="col-lg-12">
                              <div class="card rounded-0">
                                <div class="card-header bg-light">
                                  <h5 class="font-weight-bold mb-0">Selected route segments</h5>
                                </div>
                                <div class="card-body">
                                  <table class="table">
                                    <thead class="thead-dark">
                                      <tr>
                                        <th scope="col">Segment ID</th>
                                        <th scope="col">Risk level</th>
                                      </tr>
                                    </thead>
                                    <tbody id="tableroute">
                                      <!-- Filas generadas dinamicamente xd -->
                                      <tr>
                                        <th scope="row">-</th>
                                        <td>-</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                                            </div>
                                        </div>
            
                                        <div class="col-lg-12">
            
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
                
            
            
            </body>
            <script async
                    src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCEen29bixPCHvTa7DWIErzdWhPg8Zp60Y&libraries=visualization&callback=initMap"></script>
                <script>
                    function initMap() {
                  var table = document.getElementById('tableroute');
                      table.innerHTML = "";
            
                  map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 12, center: { lat: 10.949185, lng: -74.803391 },
                    streetViewControl: false
                  });
                  geocoder = new google.maps.Geocoder();
                  casos();
                }
            
                async function casos() {
                  routePath =[];
                  var mapaconsult;
                  const consulta = { con: mapaconsult };
                  const options1 = {
                    method: "POST",
                    body: JSON.stringify(consulta),
                    headers: {
                      "Content-Type": "application/json"
                    }
                  };
            
            
            
                  const response2 = await fetch('/mapageneral', options1);
                  result2 = await response2.json();
                  console.log(result2);
            
            
            
                  initHeatMap();
                  map.addListener('click', (e) => {
                    addRoutePoint(e.latLng)
                  } )
                }
                function addRoutePoint(pos){
                  var marker = new google.maps.Marker({
                    position: pos,
                    map: map
                });
                  routePath.push(pos)
                  routeMarkers.push(marker)
                  drawRoute();
                }
                let routePath =[];
                let routeMarkers =[];
                let markers = [];
                let polylines = [];
                let routeSegments=[]
                function initHeatMap() {
            
                  var color;
                  var icon;
                  var descriptor
                  for (var i = 0; i < result2.length; i++) {
                    if (result2[i].riesgo <= 30) {
                      
                      descriptor = "Low";
                      color = "#008000";
                      icon = "http://maps.google.com/mapfiles/ms/icons/green.png";
                    } else if (result2[i].riesgo > 30 && result2[i].riesgo <= 70) {
                      
                      descriptor = "Moderate";
                      color = "#f6d866";
                      icon = "http://maps.google.com/mapfiles/ms/icons/orange.png";
                    } else if (result2[i].riesgo > 70 && result2[i].riesgo <= 100) {
                      
                      color = "#ff0000";
                      descriptor = "High";
                      icon = "http://maps.google.com/mapfiles/ms/icons/red.png";
                    }
                    var pos = { lat: parseFloat(result2[i].latitud), lng: parseFloat(result2[i].longitud) };
                    var segment = [pos, { lat: parseFloat(result2[i].latitud1), lng: parseFloat(result2[i].longitud1) }];
                    DrawSection(segment, color);
                    addMarker(segment, result2[i].id, icon, result2[i], descriptor)
                  }
            
                  console.log('pai entré a la fun')
            
            
            
                  //heatmap.setData(heatMapData);
                  //heatmap.setMap(map);
                  //heatmaps.push(heatmap)
                }
                function DrawSection(segment, color) {
                  var lineSymbol = {
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  };
            
                  var riskpath = new google.maps.Polyline({
                    path: segment,
                    geodesic: true,
                    strokeColor: color,
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                    icons: [
                      {
                        icon: lineSymbol,
                        offset: "100%",
                        repeat: '20px'
                      },
                    ]
                  });
            
                  riskpath.setMap(map)
                  polylines.push(riskpath)
                }
                function addMarker(segment, id, icon, result, descriptor) {
                  var marker = new google.maps.Marker({
                    position: segment[0],
                    label: {
                      text: String(id),
                      fontFamily: 'Source Sans Pro',
                      fontSize: '17px',
                      fontWeight: 'bold'
                    },
                    map: map,
                    icon: {
                      url: icon,
                      labelOrigin: { x: 16, y: 10 },
            
                    }
                  });
                  var rut = result.fecharuta.split("T")
                  var fecharuta = rut[0];
            
                  marker.addListener('click', () => {
                    routePath.push(segment[0])
                    routePath.push(segment[1])
                    drawRoute();
                    insertTable(result.riesgo.toFixed(2), result.id);
                    
                  })
                  markers.push(marker);
                }
                function insertTable(res1, res2){
                  console.log("executed")
                  var table = document.getElementById('tableroute');
                        var tr = document.createElement('tr');
                        tr.innerHTML = '<th>' + res2 + '</th>' + '<td>' + res1 + '</td>';
                        table.appendChild(tr);  
                };
                var snappedCoordinates = [];
                var placeIdArray = [];
                var apiKey = 'AIzaSyCEen29bixPCHvTa7DWIErzdWhPg8Zp60Y'
                function drawRoute(){
                  var lineSymbol = {
                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                  };
                  if (route != null){
                    route.setMap(null)
                  }
                  route = new google.maps.Polyline({
                    path: routePath,
                    geodesic: true,
                    strokeColor: "#000000",
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                    icons: [
                      {
                        icon: lineSymbol,
                        offset: "100%",
                        repeat: '20px'
                      },
                    ]
                  });
                var path = route.getPath();
                placeIdArray = [];
                runSnapToRoad(path);
                  
                  route.setMap(map)
                };
                let route;
                </script>
                <script>
            
                    var select = document.getElementById("lista_product");
                    select.addEventListener('onchange', () => {
                        if (document.getElementById("lista_product").value == 2) {
                            console.log("entré")
                        }
            
            
                    })
                    function actualizar(option) {
            
                        if (option.value == 2) {
                            console.log("entré")
                            document.getElementById("producto").innerHTML = "Carbon disulfide"
                            document.getElementById("riesgoproducto").innerHTML = "H225 - Highly flammable liquid and vapor Content." + "<br> H315 - Causes skin irritation." +
                                "<br> H319 - Causes serious eye irritation." + "<br> H372 - Causes damage to organs through prolonged or repeated exposure." + "<br> H361fd - Suspected of causing eye irritation." +
                                "<br> H372 - Causes damage to organs through prolonged or repeated exposure." + "<br> H361fd - Suspected of damaging fertility. Suspected of damaging the unborn child. " + "<br> H332 - Harmful if inhaled."
                            document.getElementById("UN").innerHTML = "UN 1131 Carbon disulfide, Class 3 (6.1)"
                            document.getElementById("presentation").innerHTML = "Liquid"
                            document.getElementById("packing").innerHTML = "Isocontainer"
                            document.getElementById("labels").innerHTML = '<img src="/fotos-rutas/carbondisulfide.png"></img>'
                        }
            
                    }
                 /*  document.getElementById("fecharuta").innerHTML = fecharuta
                          document.getElementById("Initcoord").innerHTML = result.latitud + ", " + result.longitud;
                          document.getElementById("Finalcoord").innerHTML = result.latitud1 + ", " + result.longitud1;
                          document.getElementById("riesgo").innerHTML = descriptor + " (" + result.riesgo + '%)';
                          document.getElementById("notasb").innerHTML = result.notas; */
                </script>
            <script>
               
              </script>
              <script>// Snap a user-created polyline to roads and draw the snapped path
                function runSnapToRoad(path) {
                  var pathValues = [];
                  for (var i = 0; i < path.getLength(); i++) {
                    pathValues.push(path.getAt(i).toUrlValue());
                  }
                
                  $.get('https://roads.googleapis.com/v1/snapToRoads', {
                    interpolate: true,
                    key: apiKey,
                    path: pathValues.join('|')
                  }, function(data) {
                    processSnapToRoadResponse(data);
                    drawSnappedPolyline();
                  });
                }
                
                // Store snapped polyline returned by the snap-to-road service.
                function processSnapToRoadResponse(data) {
                  snappedCoordinates = [];
                  placeIdArray = [];
                  for (var i = 0; i < data.snappedPoints.length; i++) {
                    var latlng = new google.maps.LatLng(
                        data.snappedPoints[i].location.latitude,
                        data.snappedPoints[i].location.longitude);
                    snappedCoordinates.push(latlng);
                    placeIdArray.push(data.snappedPoints[i].placeId);
                  }
                }
                
                // Draws the snapped polyline (after processing snap-to-road response).
                function drawSnappedPolyline() {
                  var snappedPolyline = new google.maps.Polyline({
                    path: snappedCoordinates,
                    strokeColor: '#add8e6',
                    strokeWeight: 4,
                    strokeOpacity: 0.9,
                  });
                
                  snappedPolyline.setMap(map);
                  polylines.push(snappedPolyline);
                }
                </script> 
                <script>
                  async function generatePDF() {
                  var input = 2;
                  const consulta2 = { con: input,
                  fecharuta: 2021-01-22};
                  const options2 = {
                    method: "POST",
                    body: JSON.stringify(consulta2),
                    headers: {
                      "Content-Type": "application/json"
                    }
                  };
            
                  const response2 = await fetch('/informe', options2);
                  result = await response2.json();
                  console.log(result);
                }
                </script>
            
            
                <script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>
                <!-- Optional JavaScript -->
                <!-- jQuery first, then Popper.js, then Bootstrap JS -->
                
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"
                    integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1"
                    crossorigin="anonymous"></script>
                <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"
                    integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM"
                    crossorigin="anonymous"></script>
                <script src="https://cdn.jsdelivr.net/npm/chart.js@2.9.3/dist/Chart.min.js"
                    integrity="sha256-R4pqcOYV8lt7snxMQO/HSbVCFRPMdrhAFMH+vr9giYI=" crossorigin="anonymous"></script>
            </html>
          `;


            pdf.create(contenido).toFile('./pdfs/salida.pdf', function (err, res) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(res);
                    pdffile = res;
                }
            });

            res.sendFile(path.join(__dirname + '/salida.pdf'));
        })
        .catch(e => console.log(e))
    console.log(fecharuta)

});

app.post('/ruta', (req, res) => {
    var polylinestr = req.body;
    console.log(polylinestr)
      let sql = `INSERT INTO public.ruta(idruta,polyline, segment, risk, idsegrut) VALUES ('${req.body.idruta}','${req.body.polylines}','${req.body.segments}','${req.body.risk}','${req.body.idsrut}') RETURNING *`;
    client.query(sql)
 



})

app.post('/consultaSeg', (req, res) => {
    var nombre = req.body.con;
    console.log(nombre);
    let sql = `SELECT * FROM inforuta WHERE id in (${req.body.con})`;
    client.query(sql)
        .then(raw => {
            console.log("estas son, crack. Pilla: ")
            console.log(raw.rows)
            if (raw.rows[0] == undefined) {
                var resultado = { id: 0 }
                res.json(resultado)
            } else {
                res.json(raw.rows[0]);
            }


        })
        .catch(e => console.log(e))
});