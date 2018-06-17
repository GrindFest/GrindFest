import ZoneServer from "./ZoneServer";


//TODO: separate authentican server from zone server


//TODO: start all zone servers

let zoneServer = new ZoneServer("/zones/test.json");
zoneServer.start();