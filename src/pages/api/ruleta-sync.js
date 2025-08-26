import { Server } from 'socket.io';

let options = [];
let spinning = false;
let selected = null;
let showResult = false;

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      socket.emit('sync', { options, spinning, selected, showResult });
      socket.on('updateOptions', (data) => {
        options = data;
        io.emit('sync', { options, spinning, selected, showResult });
      });
      socket.on('spin', () => {
        spinning = true;
        selected = null;
        showResult = false;
        io.emit('sync', { options, spinning, selected, showResult });
      });
      socket.on('result', (data) => {
        spinning = false;
        selected = data.selected;
        showResult = true;
        io.emit('sync', { options, spinning, selected, showResult });
      });
    });
  }
  res.end();
}
