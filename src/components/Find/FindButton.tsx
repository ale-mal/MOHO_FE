import { type Component } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { searching, setSearching, setUsername } from "~/find/find_state";
import { getCID } from "~/utils/utils";

interface FindButtonProps {
  username: string;
}

const FindButton: Component<FindButtonProps> = (props) => {
  let ws: WebSocket;
  let heartbeatInterval: number;
  const cid = getCID();
  const navigate = useNavigate();

  const connectWebSocket = () => {
    const wsUrl =
      import.meta.env.VITE_WEBSOCKET_URL +
      "/find?cid=" +
      cid +
      "&username=" +
      encodeURIComponent(props.username);
    ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      if (event.data.startsWith("found:")) {
        const sessionId = event.data.slice("found:".length);
        setUsername(props.username);
        ws.close();
        navigate("/game?sessionId=" + sessionId);
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
  };

  const findGame = () => {
    if (!searching()) {
      setSearching(true);
      connectWebSocket();
      heartbeatInterval = window.setInterval(sendHeartbeat, 1000);
    }
  };

  return (
    <button onClick={findGame} disabled={searching() || props.username.trim() === ""}>
      {searching() ? "Searching..." : "Find Game"}
    </button>
  );
};

export default FindButton;
