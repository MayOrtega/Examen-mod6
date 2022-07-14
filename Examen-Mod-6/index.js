const fs = require("fs");
const http = require("http")
const url = require("url")
const axios = require("axios");

let { calculoEdicion, calculoTotal } = require("./funciones")


http.createServer(async (req, res) => {

    if (req.url == "/" && req.method == "GET") {
        res.setHeader("content-type", "text/html");
        res.end(fs.readFileSync("index.html", "utf8"));
    }

    if (req.url.startsWith("/roommate") && req.method == "POST") {
        try {
            const data = await axios.get("https://randomuser.me/api");
            const datosUsuario = data.data.results[0];
            let arregloUsuarios = JSON.parse(fs.readFileSync("data/roommates.json", "utf8"));
            const objUsuario = {
                id: arregloUsuarios.length + 1,
                nombre: datosUsuario.name.first + ' ' + datosUsuario.name.last,
                total: 0
            };
            arregloUsuarios.push(objUsuario)
            fs.writeFileSync("data/roommates.json", JSON.stringify(arregloUsuarios, null, ' '));
            res.end();
        } catch (e) {
            res.statusCode = 500;
            res.end();
        }
    }

    if (req.url.startsWith("/roommates") && req.method == "GET") {
        res.setHeader("Content-Type", "application/json");
        let JSONUsuarios = fs.readFileSync("data/roommates.json", "utf8");
        res.end(JSONUsuarios);
    }

    if (req.url.startsWith("/gastos") && req.method == "GET") {
        res.setHeader("Content-Type", "application/json");
        let JSONUsuarios = fs.readFileSync("data/operaciones.json", "utf8");
        res.end(JSONUsuarios);
    }

    if (req.url == "/gasto" && req.method == "POST") {
        try {
            let body = "";
            req.on("data", (chunk) => {
                body = chunk.toString();
            });
            req.on("end", () => {
                const datosOperacion = JSON.parse(body);
                let arregloUsuarios = JSON.parse(fs.readFileSync("data/roommates.json", "utf8"));
                let arregloOperaciones = JSON.parse(fs.readFileSync("data/operaciones.json", "utf8"));
                let idAux = 0
                for (let i of arregloUsuarios) {
                    if (datosOperacion.roommate == i.nombre) {
                        idAux = i.id
                    }
                }
                let b = calculoTotal(idAux, datosOperacion.monto);
                const objOperacion = {
                    id: arregloOperaciones.length + 1,
                    descripcion: datosOperacion.descripcion,
                    monto: datosOperacion.monto,
                    roommate_id: idAux,
                    roommate_name: datosOperacion.roommate,
                    total: b
                };
                arregloOperaciones.push(objOperacion)
                fs.writeFileSync("data/operaciones.json", JSON.stringify(arregloOperaciones, null, ' '));
                res.end("Gasto editado con exito");
            });
        } catch (e) {
            res.statusCode = 500;
            res.end();
        }
    }

    if (req.url.startsWith("/gasto") && req.method == "PUT") {
        const idOp = url.parse(req.url, true).query.id;
        let body = "";
        req.on("data", (chunk) => {
            body = chunk.toString();
        });
        req.on("end", () => {
            const datosOperacion = JSON.parse(body);            
            let arregloUsuarios = JSON.parse(fs.readFileSync("data/roommates.json", "utf8"));
            let arregloOperaciones = JSON.parse(fs.readFileSync("data/operaciones.json", "utf8"));
            let idAux = 0
            for (let i of arregloUsuarios) {
                if (datosOperacion.roommate == i.nombre) {
                    idAux = i.id
                }
            }
            let b = calculoEdicion(idAux, datosOperacion.monto, idOp);
            for (let k of arregloOperaciones) {
                if (k.id === idOp) {
                    k.descripcion = datosOperacion.descripcion,
                        k.monto = datosOperacion.monto,
                        k.roommate_name = datosOperacion.roommate,
                        k.total = b
                }
            }
            fs.writeFileSync("data/operaciones.json", JSON.stringify(arregloOperaciones, null, ' '));
            res.end("Gasto editado con exito");
        });
    }

    if (req.url.startsWith("/gasto") && req.method == "DELETE") {
        const idOperacion = url.parse(req.url, true).query.id;
        let arregloUsuarios = JSON.parse(fs.readFileSync("data/roommates.json", "utf8"));
        let arregloOperaciones = JSON.parse(fs.readFileSync("data/operaciones.json", "utf8"));
        let idAux = 0;
        let montoEliminado = 0;
        for (let q of arregloOperaciones) {
            if (q.id == idOperacion) {
                idAux = q.roommate_id;
                montoEliminado = q.monto;
            }
        }
        let operacionesFiltrado = arregloOperaciones.filter(function (e) {
            return e.id != idOperacion;
        })
        for (let e of arregloUsuarios) {
            if (e.id == idAux) {
                e.total = e.total - montoEliminado;
                break;
            }  
        }     
        fs.writeFileSync("data/roommates.json", JSON.stringify(arregloUsuarios, null, ' '));
        fs.writeFileSync("data/operaciones.json", JSON.stringify(operacionesFiltrado, null, ' '));
        res.end("gasto eliminado");
    }






}).listen(8080, console.log("Server iniciado en puerto 8080")); 