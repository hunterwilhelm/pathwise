import {RoomInfo} from "../../shared/models/room.info.model";

type RoomInfoCallback = (roomInfo: RoomInfo) => void;
type VoidCallback = () => void;

export class DomUtils {
    private static setElementTextContent(selectors: string, content: string): boolean {
        const statusDom = document.querySelector(selectors);
        if (statusDom) {
            statusDom.textContent = content;
            return true;
        }
        return false;
    }

    static displayStatus(message: string) {
        DomUtils.setElementTextContent("#connection-status", message);
        document.title = message;
    }

    static displayUserIdStatus(message: string) {
        DomUtils.setElementTextContent("#user-id-status", message);
    }

    static displayErrorStatus(message: string) {
        DomUtils.setElementTextContent("#error-status", message);
    }

    static displayRoomInfos(roomInfo: RoomInfo[], userId: string, joinRoomCallback: RoomInfoCallback, leaveRoomCallback: RoomInfoCallback, messageCallback: VoidCallback) {
        const userInRoom = roomInfo.filter(r => r.userIds.includes(userId)).length > 0;

        const listRoomsTable = document.querySelector("#list-rooms-table tbody");
        if (listRoomsTable) {
            const documentFragment = document.createDocumentFragment();
            roomInfo.forEach(r => {
                const tr = document.createElement("tr");
                const users = document.createElement("td");
                const id = document.createElement("td");
                const action = document.createElement('td');

                users.textContent = r.userIds.length.toString() ?? null;
                id.textContent = r.id;

                if (r.userIds.includes(userId)) {
                    const button = document.createElement('button');
                    button.textContent = "Leave Room";
                    button.type = 'submit';
                    button.addEventListener("click", () => {leaveRoomCallback(r)}, false);
                    action.appendChild(button);

                    const messageButton = document.createElement('button');
                    messageButton.textContent = "Send Message";
                    messageButton.type = 'submit';
                    messageButton.addEventListener("click", () => {messageCallback()}, false);
                    action.appendChild(messageButton);
                } else {
                    const button = document.createElement('button');
                    button.textContent = "Join Room";
                    button.type = 'submit';
                    if (userInRoom) button.disabled = true;
                    button.addEventListener("click", () => {joinRoomCallback(r)}, false);
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
