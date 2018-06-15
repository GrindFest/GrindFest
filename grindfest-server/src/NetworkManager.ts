import * as http from "http";
import websocket from "websocket";
import EventEmitter from "./infrastructure/EventEmitter";
import Client from "./Client";
import {Message, MessageId} from "./infrastructure/network/Messages";



export default class NetworkManager {

    static handlers: Map<number, EventEmitter> = new Map();
    static disconnectHandler: EventEmitter = new EventEmitter();

    static clients: Client[] = [];

    static onMessage(client: Client, messageData) {
        let message: Message = JSON.parse(messageData.utf8Data);

        console.log("NetworkManager.onMessage", MessageId[message.id], message);


        let handlers = NetworkManager.handlers.get(message.id);

        if (handlers != null) {
            handlers.emit2(client, message);
        }

        //
        // if (messageData.type === 'utf8') {
        //     console.log('Received Message: ' + messageData.utf8Data);
        //     connection.sendUTF(messageData.utf8Data);
        // }
        // else if (messageData.type === 'binary') {
        //     console.log('Received Binary Message of ' + messageData.binaryData.length + ' bytes');
        //     connection.sendBytes(messageData.binaryData);
        // }
    }

    static send(client: Client, message: Message) { //TODO: wouldn't this method be better on Client?
        //console.log("NetworkManager.send", message);
        client.connection.sendUTF(JSON.stringify(message));
    }


    static registerHandler(messageId: number, handler: (...args) => void) {
        let handlers = NetworkManager.handlers.get(messageId);
        if (handlers == null) {
            handlers = new EventEmitter();
            NetworkManager.handlers.set(messageId, handlers);
        }
        handlers.register(handler);
    }


    static initialize() {
        console.log("NetworkManager.initialize");
        const server = http.createServer( (request, response) => {
            console.log((new Date()) + ' Received request for ' + request.url);
            response.writeHead(404);
            response.end();
        });

        server.listen(8080, (err) => {
            if (err) {
                return console.log('something bad happened', err)
            }

            console.log((new Date()) + ' Server is listening on port 8080');
        });

        const wsServer = new websocket.server({
            httpServer: server,
            autoAcceptConnections: false
        });



        function originIsAllowed(origin) {
            // put logic here to detect whether the specified origin is allowed.
            return true;
        }

        wsServer.on('request', function(request) {
            if (!originIsAllowed(request.origin)) {
                request.reject();
                return;
            }

            let connection = request.accept(null, request.origin);

            connection.client = new Client(connection);

            NetworkManager.clients.push(connection.client);
            console.log("Clients: " + NetworkManager.clients.length);

            console.log((new Date()) + ' Connection accepted.');
            connection.on('message', (message) => {
                NetworkManager.onMessage(connection.client, message);

            });
            connection.on('close', function(reasonCode, description) {

                NetworkManager.clients.splice( NetworkManager.clients.indexOf(connection.client), 1);
                console.log("Clients: " + NetworkManager.clients.length);

                NetworkManager.disconnectHandler.emit1(connection.client);
            });
        });
    }
}