import {RoomInfo} from "../../shared/models/room.info.model";

type RoomInfoCallback = (roomInfo: RoomInfo) => void;

export class DomUtils {
    static displayStatus(message: string) {
        document.title = message;
    }

    static displayRoomInfos(roomInfos: RoomInfo[], userInRoom: boolean, userId: string, joinRoomCallback: RoomInfoCallback, leaveRoomCallback: RoomInfoCallback) {

        const listRoomsTable = document.querySelector("#list-rooms-table tbody");
        if (listRoomsTable) {
            const documentFragment = document.createDocumentFragment();
            roomInfos.forEach(r => {
                const tr = document.createElement("tr");
                const users = document.createElement("td");
                const id = document.createElement("td");
                const action = document.createElement('td');

                users.textContent = r.userIds.length.toString() ?? null;
                id.textContent = r.id;

                if (r.userIds.includes(userId)) {
                    const button = document.createElement('button');
                    button.textContent = "Leave Room";
                    button.className = "btn btn-danger";
                    button.type = 'submit';
                    button.addEventListener("click", () => {
                        leaveRoomCallback(r)
                    }, false);
                    action.appendChild(button);
                } else {
                    const button = document.createElement('button');
                    button.textContent = "Join Room";
                    button.className = "btn btn-success";
                    button.type = 'submit';
                    if (userInRoom) button.disabled = true;
                    button.addEventListener("click", () => {
                        joinRoomCallback(r)
                    }, false);
                    action.appendChild(button);
                }

                tr.appendChild(users);
                tr.appendChild(id);
                tr.appendChild(action);
                documentFragment.appendChild(tr);
            });
            Array.from(listRoomsTable.children).forEach(c => listRoomsTable.removeChild(c));
            listRoomsTable.appendChild(documentFragment);
        }
    }
}
