# A WebRTC P2P video chat with:

- WebSocket server for signaling (offer/answer/ICE).
- Two clients connect and see each other's webcam.

Let's assume we use `moon` as domain name.
You are probably going to use your.own.com domain name.

Add moon to /etc/hosts on both systems or use DNS.

Install dependencies:
```
npm i
```

Generate cert and key in cert/ subfolder:
```
openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365
```

Make sure the Common Name (CN) matches the domain you'll use it with.
It's `moon` in our case.

Start signaling server:
```
node signaling-server.js
```

Open in the browser: https://moon:8080/

You need to open this page in browsers on 2 computers.
The browser will ask you for permissions to use the camera and microphone.
Just allow.
It's important to use HTTPS for camera and microphone availability.


- Two clients connect to a signaling server (WebSocket).
- One initiates the connection: creates an offer and sends it to the other via the WebSocket.
- The second client responds with an answer via WebSocket.
- ICE candidates (network info) are exchanged between peers to establish a direct connection.
- Once WebRTC completes negotiation, video/audio streams flow directly P2P, bypassing the server.

