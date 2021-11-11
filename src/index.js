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
    let sql = `SELECT * FROM inforuta WHERE id = ${req.body.con}`;
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
    let sql = `SELECT  latitud, longitud,fecharuta, riesgo, geocode , latitud1, id, longitud1, notas from inforuta order by geocode DESC`
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

            var contenido = `

              <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css"
              integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">
            <link href="https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;600&display=swap" rel="stylesheet">
            <link href="https://unpkg.com/ionicons@4.5.10-0/dist/css/ionicons.min.css" rel="stylesheet">
            
              <style>
                          #informacionID{
                              width: 40%;
                          }
                          .logo img {
                              width: 60px;
                              margin-right: 0.6rem;
                              margin-top: -0.6rem;
                              }
                         
                           
               </style>
          </head>
          <div class="logo">
          <img src="https://i.postimg.cc/wTC1XTN5/logo-sin-fondo.png" alt="Logo" /> <h3>RISK TOOL</h3>
          </div>
          <h1 class="align-self-center mb-0">Route Section Report</h1>
          <p>Estoy generando PDF a partir de este código HTML sencillo</p>
          <div class="col-lg-4 my-4">
                          <div id="informacionID" class="card rounded-0" >
                            <div class="card-header bg-light">
                              <h5 class="font-weight-bold mb-0"> Route section information</h5>
                            </div>
                            <div class="card-body pt-2">
                              <div class="d-flex border-bottom py-2">
                                <div class="d-flex mr-3">
                                  <h2 class="align-self-center mb-0"><i class="icon ion-md-pricetag"></i></h2>
                                </div>
                                <div class="align-self-center">
                                  <h6 class="d-inline-block mb-0 font-weight-bold">Section ID</h6>
                                  <h6 class="mb-0" id="id">${nombre}</h6>
                                </div>
                              </div>
          
                              <div class="d-flex border-bottom py-2">
                                <div class="d-flex mr-3">
                                  <h2 class="align-self-center mb-0"><i class="icon ion-md-calendar"></i></h2>
                                </div>
                                <div class="align-self-center">
                                  <h6 class="d-inline-block mb-0 font-weight-bold">Date of analysis</h6>
                                  <h6 class="mb-0" id="fecharuta">${fecharuta}</h6>
                                </div>
                              </div>
                              <div class="d-flex border-bottom py-2">
                                <div class="d-flex mr-3 mb-0">
                                  <h2 class="align-self-center mb-0"><i class="icon ion-md-map" width="25px"></i></h2>
                                </div>
                                <div class="align-self-center">
                                  <h6 class="d-inline-block mb-0 font-weight-bold">Initial Coordinates</h6>
                                  <h6 class="mb-0" id="Initcoord">${result.latitud + ", " + result.longitud}</h6>
                                </div>
                              </div>
                              <div class="d-flex border-bottom py-2">
                                <div class="d-flex mr-3 mb-0">
                                  <h2 class="align-self-center mb-0"><i class="icon ion-md-map" width="25px"></i></h2>
                                </div>
                                <div class="align-self-center">
                                  <h6 class="d-inline-block mb-0 font-weight-bold">Final Coordinates</h6>
                                  <h6 class="mb-0" id="Finalcoord">${result.latitud1 + ", " + result.longitud1}</h6>
                                </div>
                              </div>
                              <div class="d-flex border-bottom py-2">
                                <div class="d-flex mr-3">
                                  <h2 class="align-self-center mb-0"><i class="icon ion-md-document"></i></h2>
                                </div>
                                <div class="align-self-center">
                                  <h6 class="d-inline-block mb-0 font-weight-bold">Risk level</h6>
                                  <h6 class="mb-0" id="riesgo">${descriptor + " (" + result.riesgo + '%)'}</h6>
                                </div>
                              </div>
                              <div class="d-flex border-bottom py-2">
                                <div class="d-flex mr-3">
                                  <h2 class="align-self-center mb-0"><i class="icon ion-md-book"></i></h2>
                                </div>
                                <div class="align-self-center">
                                  <h6 class="d-inline-block mb-0 font-weight-bold">Additional Notes</h6>
                                  <h6 class="mb-0" id="notasb">${result.notas}</h6>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div id="mapaglobal" class="card-body">
                          <div id="map"></div>
                          </div>

                          
                        </div>
                        <script async
                         src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCEen29bixPCHvTa7DWIErzdWhPg8Zp60Y&callback=initMap">
                        </script>
                        <script>
                        function initMap() {
                            map = new google.maps.Map(document.getElementById('map'), {
                              zoom: 13, center: { lat: 10.9861045, lng: -74.80928094 },
                              streetViewControl: false
                            });
                      
                          }
                        </script>
          `;


            pdf.create(contenido).toFile('./salida.pdf', function (err, res) {
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