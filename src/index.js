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
const fs= require('fs');
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
app.get('/obtener_caso', function (request, response) {

    if (request.session.loggedin1) {
        return response.render(path.join(__dirname + '/obtener_caso.ejs'));
    } else {
        return response.render(path.join(__dirname + '/login.ejs'));
    }
});

//Medico (General)
app.get('/general', function (request, response) {

    if (request.session.loggedin) {
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
app.post('/casos2', (req, res) => {
    let sql = `SELECT  id,  direc, nombre, apellido from casos order by id `
    client
        .query(sql)
        .then(raw => {
            res.json(raw.rows);
            console.log(raw.rows);
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
    let files= req.files;
    let fotosfile ;
    let fotosfile1 ;
   
    console.log(files)
    var i = 0;
      for ( i ; i< filelenght; i++ ){
        fotosfile = files[i].originalname;
        fotosfile1 = fotosfile1 +","+ fotosfile; 
        console.log(fotosfile1) 
        }  
    
    console.log(filelenght) 
    var fotosfile2 = fotosfile1.replace('undefined,','')
    console.log(fotosfile2) 
    fotosfile3 = fotosfile2.split(',')
    fotosfile3 = {fotos: fotosfile3} 
    console.log(fotosfile3) 
     
     res.json(fotosfile3);
     res.status(204);
     /* document.getElementById('mostrarimagenes').innerHTML('<img src="/fotos-rutas/'+fotosfile2[0]+'">'); */
});

app.post('/Riesgo', (req, res) => {
    
    let bicicletas = req.body.bicicletas;
        bicicletas = "0"+bicicletas;
    let motos = req.body.motos;
        motos = "0"+motos;
    let peaton = req.body.peaton;
        peaton ="0"+peaton;
    let via = req.body.via;
        via = "0"+via;
    let deslizamiento = req.body.deslizamiento;
        deslizamiento = "0"+deslizamiento;
    let obrasvia = req.body.obrasvia;
        obrasvia = "0"+obrasvia;
    let velocidad = req.body.velocidad;
       velocidad = "0"+velocidad;
    let alumbrado = req.body.alumbrado;
        alumbrado = "0"+alumbrado;
    let separador = req.body.separador;
       separador = "0"+separador;
    let calzadadiv = req.body.calzadadiv;
        calzadadiv = "0"+calzadadiv;
    let hora = req.body.hora;
        hora = "0"+hora;
        
    console.log(req.body)
    var Process = spawn('python',["PruebaPf.py",bicicletas,motos,peaton,via,velocidad,alumbrado,hora]);
    
    Process.stdout.on('data', (data) => {
        var calriesgo = {riesgo: data.toString('utf8')}
        console.log(calriesgo);
        res.json(calriesgo);
        var medidor = data.toString('utf8');
        medidor = medidor.substring(0, medidor.length - 8)
        var valormedidor = parseFloat(medidor) * 10;
        console.log('papi mira ve  '+valormedidor);
          let sql = `INSERT INTO public.inforuta(id,fecharuta, latitud, longitud, notas, fotos, riesgo) VALUES(DEFAULT,'${req.body.fecharuta}','${req.body.latitud}','${req.body.longitud}','${req.body.notas}','${req.body.fotos}','${valormedidor}') RETURNING *`;
        client.query(sql)  
 
    });
        
})

app.post('/consultaID', (req, res) => {
    var nombre = req.body.con;
    console.log(nombre);
    let sql = `SELECT * FROM inforuta WHERE id = ${req.body.con}`;
    client.query(sql)
        .then(raw => {
            console.log("estas son, crack. Pilla: ")
            console.log(raw.rows[0])
            if(raw.rows[0] == undefined) {
             var resultado = {id: 0}
             res.json(resultado)
            }else{
             res.json(raw.rows[0]);
            }
            

        })
        .catch(e => console.log(e))



});
