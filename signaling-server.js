const https = require('node:https');
const express = require('express');
const WebSocket = require('ws');
const path = require('node:path');
const fs = require('node:fs');

const app = express();

// Load SSL certificate and key
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'cert/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert/cert.pem')),
};

const server = https.createServer(sslOptions, app);

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// WS server
// const wss = new WebSocket.Server({ port: 8080, host: '0.0.0.0' });
// const wss = new WebSocket.Server({ server });
const wss = new WebSocket.Server({ noServer: true });

// Handle WebSocket upgrade requests on "/ws"
server.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws') {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    } else {
        socket.destroy(); // reject unexpected upgrade requests
    }
});

// const clients = new Set();
const clients = [];

wss.on('connection', (ws) => {
    clients.push(ws);
    sendAllOther({type: 'join'}, ws);
    ws.send(JSON.stringify({type: 'channel', clients_num: clients.length, index: clients.indexOf(ws)}));

    ws.on('message', (message) => {
        // Relay message to all other clients
        sendRawAllOther(message, ws);
    });

    ws.on('close', () => {
        const i = clients.indexOf(ws);
        if (i !== -1) {
            clients.splice(i, 1);
            sendAllOther({type: 'leave'}, ws);
        }
    });
});

// Listen on all interfaces (0.0.0.0), port 8080
server.listen(8080, '0.0.0.0', () => {
    console.log('WebSocket server is listening on ws://0.0.0.0:8080');
});

function sendAll(message) {
    for (let client of clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({...message, index: clients.indexOf(client)}));
        }
    }
}

function sendAllOther(message, ws) {
    for (let client of clients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({...message, index: clients.indexOf(client)}));
        }
    }
}

function sendRawAllOther(message, ws) {
    for (let client of clients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
}
