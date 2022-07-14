const fs = require("fs")

function calculoTotal(idRoommate, montonNuevo) {
    let arregloUsuarios = JSON.parse(fs.readFileSync("data/roommates.json", "utf8"));
    let arregloOperaciones = JSON.parse(fs.readFileSync("data/operaciones.json", "utf8"));
    let balance = 0
    for (let j of arregloOperaciones) {
        if (idRoommate == j.roommate_id) {
            balance = balance + j.monto
        }
    }
    balance = balance + montonNuevo;
    for (let i of arregloUsuarios) {
        if (idRoommate == i.id) {
            i.total = balance;
        }
    }
    fs.writeFileSync("data/roommates.json", JSON.stringify(arregloUsuarios, null, ' '));
    return balance;
}

function calculoEdicion(idRoommate, montoEditar, idOp) {    
    let arregloUsuarios = JSON.parse(fs.readFileSync("data/roommates.json", "utf8"));
    let arregloOperaciones = JSON.parse(fs.readFileSync("data/operaciones.json", "utf8"));
    let balance = 0
    for (let j of arregloOperaciones) {
        if (j.id === idOp) {
            j.monto = montoEditar;
        }
        if (idRoommate == j.roommate_id) {
            balance = balance + j.monto
        }
    }

    for (let i of arregloUsuarios) {
        if (idRoommate == i.id) {
            i.total = balance;
        }
    }
    fs.writeFileSync("data/roommates.json", JSON.stringify(arregloUsuarios, null, ' '));
    return balance;
}

module.exports = { calculoTotal, calculoEdicion}