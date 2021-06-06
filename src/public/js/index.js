let HOST = location.origin.replace(/^http/, 'ws')
let ws = new WebSocket(HOST);
let el;

const messageTypeEventListeners = {};


function main() {

  registerTypeListeners();
  registerListeners();
}

function registerTypeListeners() {

}

function registerListeners() {
  ws.onmessage = (event) => {
    el = document.getElementById('server-time');
    const data = DataUtils.deserializeMessage(event.data);
    if (data) {
      messageTypeEventListeners[data.type].forEach(eventHandler => eventHandler(data.message));
    }
  };

}

main()


