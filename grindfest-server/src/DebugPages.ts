import NetState from "./world/NetState";
import Transform from "./world/Transform";
import ZoneManager from "./infrastructure/world/ZoneManager";

export function displayZonePage(response) {
    response.writeHead(200, {"Content-Type":"text/html", "Refresh": "1"});
    let data = "<html><body>";
    for (let zone of ZoneManager.zones) {
        data += `<svg width='${10*16}' height='${10*16}' style="border: 1px solid black">`;


        for (let gameObject of zone.gameObjects) {
            let transform = gameObject.components.get(Transform);
            let x = transform.x;
            let y = transform.y;

            let hasNetState = gameObject.components.has(NetState);

            data += `<circle cx="${x}" cy="${y}" r="4" stroke="black" stroke-width="1" fill="${hasNetState?'blue' : 'red'}" />`;
        }

        data += "</svg>";
    }

    data += "</body></html>";


    response.write(data);

    response.end();
}