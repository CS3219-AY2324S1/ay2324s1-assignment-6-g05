import http from "http";
import { AddressInfo } from "net";
import { type Socket as ClientSocket, io as io_client } from "socket.io-client";
import { type Socket as ServerSocket, Server } from "socket.io";

let roomId: string = "SAMPLE_ROOM_ID";

describe("Basic Test", () => {

    let ioServer: Server;
    let serverSocket: ServerSocket;
    let clientSocketUser1: ClientSocket;
    let clientSocketUser2: ClientSocket;
    let httpServer: http.Server;

    beforeAll((done) => {
        httpServer = http.createServer();
        ioServer = new Server(httpServer);
        httpServer.listen(() => {
        const port = (httpServer.address() as AddressInfo).port;
            clientSocketUser1 = io_client(`http://localhost:${port}`);
            clientSocketUser2 = io_client(`http://localhost:${port}`);

            ioServer.on("connection", async (socket) => {
                serverSocket = socket;
                serverSocket.join(roomId)
            });


            clientSocketUser1.connect();
            clientSocketUser2.on("connect", () => {
                done();
            });

        });
    });

    afterAll(() => {
        clientSocketUser1.disconnect();
        clientSocketUser2.disconnect();
        ioServer.close();
        httpServer.close();
    });

    test("Server to Clients", (done) => {
        clientSocketUser1.on("hello", (arg) => {
            expect(arg).toBe("world");
            done();
        });

        clientSocketUser2.on("hello", (arg) => {
            expect(arg).toBe("world");
            console.log("Server to clients: 2")
            done();
        });

        ioServer.in(roomId).emit("hello", "world");

    });

    test("Clients to server", () => {
        const serverReceivedEvents = new Map();
    
        // Listen for events on serverSocket and save them to the map
        serverSocket.on("hello", (arg) => {
            serverReceivedEvents.set(serverSocket.id, arg);
    
            // Check if both clients have sent events
            if (serverReceivedEvents.has(clientSocketUser1.id) && serverReceivedEvents.has(clientSocketUser2.id)) {
                expect(serverReceivedEvents.get(clientSocketUser1.id)).toBe("world1");
                expect(serverReceivedEvents.get(clientSocketUser2.id)).toBe("world2");
            }
        });
    
        // Emit events from clients
        clientSocketUser1.emit("hello", "world1");
        clientSocketUser2.emit("hello", "world2");
    
    });    

})

