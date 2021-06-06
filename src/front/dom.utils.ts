import {RoomInfo} from "../shared/models/room.info.model";

export class DomUtils {
  static displayStatus(message: string) {
    const statusDom = document.querySelector("#connection-status");
    if (statusDom) {
      statusDom.textContent = message;
    }
    document.title = message;
  }

  static displayRoomInfos(roomInfo: RoomInfo[]) {
    const listRoomsTable = document.querySelector("#list-rooms-table tbody");
    if (listRoomsTable) {
      const documentFragment = document.createDocumentFragment();
      roomInfo.forEach(r => {
        const tr = document.createElement("tr");
        const users = document.createElement("td");
        const name = document.createElement("td");

        users.textContent = r.userCount?.toString() ?? null;
        name.textContent = r.name;

        tr.appendChild(users);
        tr.appendChild(name);
        documentFragment.appendChild(tr);
      });
      Array.from(listRoomsTable.children).forEach(c => listRoomsTable.removeChild(c));
      listRoomsTable.appendChild(documentFragment);
    }
  }
}
