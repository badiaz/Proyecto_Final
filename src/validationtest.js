let testvalues = [];
let fuzzyResult = [];
let fuzzyexp = [];
let valormedidor;
const spawn = require("child_process").spawn;
for (var i = 0; i <= 99; i++) {
    testvalues.push([Math.round(Math.random() * 10),
    Math.round(Math.random() * 10),
    Math.round(Math.random() * 10),
    Math.round(Math.random() * 10),
    Math.round(Math.random() * 10) * 10,
    Math.round(Math.random() * 24),
    Math.round(Math.random() * 10),
    Math.round(Math.random()) * 9 + 1,
    Math.round(Math.random() * 10),
    Math.round(Math.random() * 10),
    Math.round(Math.random() * 10)])

}
for (var i = 0; i <= 99; i++) {
    var val = testvalues[i];
    //BICIS
    if (val[0] == 0) {
        val[0] = 2;
    } else if (val[0] == 1) {
        val[0] = 3;
    } else if (val[0] == 2 || val[0] == 3) {
        val[0] = 4;
    } else if (val[0] == 4 || val[0] == 5) {
        val[0] = 6;
    } else if (val[0] == 6 || val[0] == 7) {
        val[0] = 8;
    } else {
        val[0] = 10;
    }
    //MOTOS
    if (val[1] == 0) {
        val[1] = 1;
    } else if (val[1] == 1) {
        val[1] = 2;
    } else if (val[1] == 2 || val[1] == 3) {
        val[1] = 3;
    } else if (val[1] == 4 || val[1] == 5) {
        val[1] = 5;
    } else if (val[1] == 6 || val[1] == 7) {
        val[1] = 7;
    } else {
        val[1] = 10;
    }
    //PEATON
    if (val[2] == 0) {
        val[2] = 1;
    } else if (val[2] == 1) {
        val[2] = 3;
    } else if (val[2] == 2 || val[2] == 3) {
        val[2] = 5;
    } else if (val[2] == 4 || val[2] == 5) {
        val[2] = 7;
    } else if (val[2] == 6 || val[2] == 7) {
        val[2] = 8;
    } else {
        val[2] = 10;
    }
    //VIA
    if (7 <= val[3] <= 10) {
        val[3] = 2;
    } else if (4 <= val[3] <= 6) {
        val[3] = 5;
    } else {
        val[3] = 10;
    }
    //Velocidad
    if (val[4] <= 30) {
        val[4] = 2;
    } else if (val[4] == 40) {
        val[4] = 4;
    } else if (val[4] == 50) {
        val[4] = 6;
    } else if (val[4] == 60) {
        val[4] = 8;
    } else {
        val[4] = 10;
    }
    //hora
    val[5] = 0;
    //alumbrado
    if (val[6] <= 5) {
        val[6] = 10;
    } else {
        val[6] = 1;
    }
    //calzada
    if (val[7] <= 5) {
        val[7] = 10;
    } else {
        val[7] = 1;
    }
    //obras
    if (1 <= val[8] <= 4) {
        val[8] = 4;
    } else if (val[8] >= 5) {
        val[8] = 10;
    } else {
        val[8] = 1;
    }

    //DESLIZAMIENTO
    if (8 <= val[9] <= 10) {
        val[9] = 4;
    } else if (5 <= val[9] <= 7) {
        val[9] = 7;
    } else if (0 <= val[9] <= 2) {
        val[9] = 10;
    } else {
        val[9] = 8;
    }

    //separador
    if (0 <= val[10] <= 2) {
        val[10] = 10;
    } else if (3 <= val[10] <= 4) {
        val[10] = 7;
    } else if (5 <= val[10] <= 8) {
        val[10] = 6;
    } else {
        val[10] = 4;
    }
    var sum = val[0] + val[1] + val[2] + val[3] + val[4] + val[6] + val[7] + val[8] + val[9] + val[10];
    sum = sum / 10;
    fuzzyexp.push(sum)
}

for (var i = 0; i <= 99; i++) {
    var val = testvalues[i];
    var Process = spawn('python', ["PruebaPf.py", val[0].toString(),
        val[1].toString(),
        val[2].toString(),
        val[3].toString(),
        val[4].toString(),
        val[5].toString(),
        val[6].toString(),
        val[7].toString(),
        val[8].toString(),
        val[9].toString(),
        val[10].toString(),]);

    Process.stdout.on('data', (data) => {
        var calriesgo = { riesgo: data.toString('utf8') }
        var medidor = data.toString('utf8');
        medidor = medidor.substring(0, medidor.length - 4)
        valormedidor = parseFloat(medidor);
        /* console.log(calriesgo); */
        fuzzyResult.push(valormedidor)
        //console.log(fuzzyResult[fuzzyResult.length-1])
        console.log(Math.abs((fuzzyexp[fuzzyResult.length-1] - fuzzyResult[fuzzyResult.length-1])/(fuzzyexp[fuzzyResult.length-1])));
    });
    
}


