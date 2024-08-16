import {type Component} from "solid-js";
import {searching, setSearching} from "~/find/find_state";
import {getCID} from "~/utils/utils"

const FindButton: Component = () => {
  let ws: WebSocket;
  let heartbeatInterval: number;
  let cid = getCID();

  const connectWebSocket = () => {
    let wsUrl = import.meta.env.VITE_WEBSOCKET_URL + "/find?cid=" + cid;
    ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      if (event.data === "found") {
        setSearching(false);
        ws.close();
      }
    };
    ws.onclose = () => {
      clearInterval(heartbeatInterval);
    };
  };

  const sendHeartbeat = () => {
    if (ws && ws.readyState === ws.OPEN) {
      ws.send("");
    }
  }

  const findGame = () => {
    if (!searching()) {
      setSearching(true);
      connectWebSocket();

      heartbeatInterval = window.setInterval(sendHeartbeat, 1000);
    }
  };

  return (
    <button onClick={findGame}>
      {searching() ? 'Searching' : 'Find'}
    </button>
  );
};

export default FindButton;