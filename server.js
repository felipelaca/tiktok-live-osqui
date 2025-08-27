const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3005;
const hostname = process.env.HOSTNAME || '0.0.0.0';

// Archivo para persistir los datos
const DATA_FILE = path.join(__dirname, 'data', 'options.json');

// Función para cargar datos del archivo
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      // Asegurar que todas las opciones tengan ID
      if (data.allOptions) {
        data.allOptions = data.allOptions.map(opt => {
          if (!opt.id) {
            opt.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
          }
          return opt;
        });
      }
      return data;
    }
  } catch (error) {
    console.log('Error loading data file:', error.message);
  }
  return { allOptions: [], options: [] };
}

// Función para guardar datos en el archivo
function saveData(allOptionsData) {
  try {
    // Crear directorio si no existe
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const data = {
      allOptions: allOptionsData,
      options: allOptionsData.filter(opt => opt.active),
      lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log(`Data saved successfully: ${allOptionsData.length} options`);
  } catch (error) {
    console.log('Error saving data file:', error.message);
  }
}

// Función para hacer backup de los datos
function backupData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const backupFile = path.join(__dirname, 'data', `options_backup_${Date.now()}.json`);
      fs.copyFileSync(DATA_FILE, backupFile);
      console.log(`Backup created: ${backupFile}`);
      return backupFile;
    }
  } catch (error) {
    console.log('Error creating backup:', error.message);
  }
  return null;
}

// Cargar datos al iniciar
const initialData = loadData();
let options = initialData.options || [];
let allOptions = initialData.allOptions || [];

console.log(`Loaded ${allOptions.length} options from persistent storage`);
if (allOptions.length > 0) {
  console.log(`Active options: ${options.length}`);
}

let spinning = false;
let selected = null;
let showResult = false;

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });

  io.on('connection', (socket) => {
    socket.emit('sync', { options, allOptions, spinning, selected, showResult });
    socket.on('updateOptions', (data) => {
      options = data.activeOptions || [];
      allOptions = data.allOptions || [];
      io.emit('sync', { options, allOptions, spinning, selected, showResult });
    });
    socket.on('addOption', (data) => {
      const newOption = { ...data, id: Date.now().toString(), active: true };
      allOptions.push(newOption);
      options = allOptions.filter(opt => opt.active);
      // Solo limpiar resultado si no está girando
      if (!spinning) {
        showResult = false;
        selected = null;
      }
      saveData(allOptions); // Guardar datos
      io.emit('sync', { options, allOptions, spinning, selected, showResult });
    });
    socket.on('toggleOption', (data) => {
      const option = allOptions.find(opt => opt.id === data.id);
      if (option) {
        option.active = data.active;
        options = allOptions.filter(opt => opt.active);
        // Solo limpiar resultado si no está girando
        if (!spinning) {
          showResult = false;
          selected = null;
        }
        saveData(allOptions); // Guardar datos
        io.emit('sync', { options, allOptions, spinning, selected, showResult });
      }
    });

    socket.on('deleteOption', (data) => {
      const index = allOptions.findIndex(opt => opt.id === data.id);
      if (index !== -1) {
        allOptions.splice(index, 1);
        options = allOptions.filter(opt => opt.active);
        // Solo limpiar resultado si no está girando
        if (!spinning) {
          showResult = false;
          selected = null;
        }
        saveData(allOptions); // Guardar datos
        io.emit('sync', { options, allOptions, spinning, selected, showResult });
      }
    });

    socket.on('updateOption', (data) => {
      const option = allOptions.find(opt => opt.id === data.id);
      if (option) {
        option.title = data.title;
        option.image = data.image;
        options = allOptions.filter(opt => opt.active);
        // Solo limpiar resultado si no está girando
        if (!spinning) {
          showResult = false;
          selected = null;
        }
        saveData(allOptions); // Guardar datos
        io.emit('sync', { options, allOptions, spinning, selected, showResult });
      }
    });
    socket.on('spin', () => {
      if (options.length > 0) {
        spinning = true;
        selected = null;
        showResult = false;
        io.emit('sync', { options, allOptions, spinning, selected, showResult });
      }
    });
    socket.on('result', (data) => {
      // Solo actualizar si actualmente está girando
      if (spinning) {
        spinning = false;
        selected = data.selected;
        
        // Desactivar automáticamente la opción ganadora
        const winnerOption = allOptions.find(opt => opt.id === data.selected.id);
        let autoDisabledName = null;
        if (winnerOption) {
          winnerOption.active = false;
          options = allOptions.filter(opt => opt.active);
          autoDisabledName = winnerOption.title;
          console.log(`Option "${winnerOption.title}" has been automatically deactivated`);
        }
        
        // Mostrar el resultado con un pequeño delay
        setTimeout(() => {
          showResult = true;
          saveData(allOptions); // Guardar cambios
          io.emit('sync', { 
            options, 
            allOptions, 
            spinning, 
            selected, 
            showResult, 
            autoDisabled: autoDisabledName 
          });
        }, 500);
      }
    });

    socket.on('clearResult', () => {
      showResult = false;
      selected = null;
      io.emit('sync', { options, allOptions, spinning, selected, showResult });
    });

    socket.on('backupData', () => {
      const backupFile = backupData();
      socket.emit('backupCreated', { 
        success: !!backupFile,
        filename: backupFile ? path.basename(backupFile) : null
      });
    });
  });

  server.use((req, res) => {
    return handle(req, res);
  });

  httpServer.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
