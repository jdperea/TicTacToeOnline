'use strict';

const express = require('express');
const socketIO = require('socket.io');

const PORT = process.env.PORT || 8000;

const app = express();

app.get("/", function (req, res) {
  res.sendFile("index.html", { root: __dirname });
});

const server = app.listen(PORT, () => {
  const port = server.address().port;
  console.log("http://localhost:" + port);
});

const io = socketIO(server);

let partidas = {}
let posicionjugadas = {}

io.on('connection', (socket) => {
  console.log('Cliente conectado');

  socket.on("entrar_a_sala", (id_sala) => {
    console.log("Ingresa un jugador a la sala " + id_sala);
    socket.join(id_sala);
    socket.roomID = id_sala;

    if(partidas[id_sala] == undefined){
      // no se habia creado la sala
      socket.emit("asiginacion_jugador", "X");
      partidas[id_sala] = {"cantidad_jugadores": 1, "turno": "X", "jugadas_realizadas": []}
      posicionjugadas[id_sala] = {"X": []};
      socket.emit("jugadas_realizadas",partidas[id_sala]);
    }else{
      socket.emit("asiginacion_jugador", "O");
      socket.emit("jugadas_realizadas",partidas[id_sala]);
      partidas[id_sala]["cantidad_jugadores"] = 2;
      posicionjugadas[id_sala]["O"]=[];
    }
  });

  socket.on("jugada", (data) => {
    let jugada = data["jugada"]; // a1 a2 a2, b1 b2 b3, c1 c2 c3
    let jugador = data["jugador"];
    let id_sala = data["id_sala"];

    let se_respeta_turno = partidas[id_sala]["turno"] == jugador;
    let casilla_libre = ! partidas[id_sala]["jugadas_realizadas"].includes(jugada);

    let se_permite_jugada = se_respeta_turno && casilla_libre;

    if(se_permite_jugada) {
      partidas[id_sala]["turno"] = jugador === "X" ? "O" : "X";
      posicionjugadas[id_sala]["X"].push(jugada);
      console.log(posicionjugadas);
      partidas[id_sala]["jugadas_realizadas"].push(jugada);
      io.to(id_sala).emit("mostrar_letra", {"id_casilla": jugada, "letra": jugador});
      validarJugadas( partidas[id_sala] );
    }

  });

  socket.on('disconnect', (data) => {
    console.log("Cliente desconectado", JSON.stringify(data));
    console.log(socket);
  });
});

function validarJugadas(datos) {
  console.log(datos);
}
