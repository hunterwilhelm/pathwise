import {ClientService} from "./client/client.service";
import p5 from "p5";
import {sketchFactory} from "./sketch.factory";

window.addEventListener('load', () => {
    const client = new ClientService();
    new p5(sketchFactory(client));
});
