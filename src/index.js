const express = require('express');
const app = express();
var server = require('http').createServer(app);
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


//Ayudante (Registro caso)
app.get('/Route_analysis', function (request, response) {

    if (request.session.loggedin1) {
        return response.render(path.join(__dirname + '/analisis_de_ruta.ejs'));
    } else {
        return response.render(path.join(__dirname + '/login.ejs'));
    }
});


//Medico (Busqueda)
app.get('/Search_Id', function (request, response) {
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
            
        })
        .catch(e => console.log(e))
    res.status(204).send();
});



app.post('/login', (req, res) => {
    
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
                    res.redirect(301, '/Route_analysis');

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

server.listen(80, () => {
    console.log('Servidor abierto en puerto 15002');
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
    let sql = `SELECT * FROM ruta idruta ORDER BY idruta DESC
    LIMIT 1`;
    client.query(sql)
        .then(raw => {
            console.log("este es el id, crack. Pilla: ")
            console.log(raw.rows[0].idruta)
            fotosfile3 = { fotos: fotosfile3, id: raw.rows[0].idruta, idsegrut: raw.rows[0].idsegrut}
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

    var Process = spawn('python', ["PruebaPf.py", bicicletas, motos, peaton, via, velocidad, hora, alumbrado, calzadadiv, obrasvia, deslizamiento, separador]);

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
                res.json(raw.rows);
            }


        })
        .catch(e => console.log(e))
});