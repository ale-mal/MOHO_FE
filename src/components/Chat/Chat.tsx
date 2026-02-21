import { createSignal, onCleanup, type Component } from "solid-js";
import ChatBox from "~/components/Chat/ChatBox";
import { getCID } from "~/utils/utils";

interface Message {
  username: string;
  message: string;
}

interface ChatProps {
  sessionId: string;
  username: string;
}

const Chat: Component<ChatProps> = (props) => {
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [message, setMessage] = createSignal("");
  const cid = getCID();
  let ws: WebSocket;

  const connectWebSocket = () => {
    ws = new WebSocket(
      import.meta.env.VITE_WEBSOCKET_URL +
        "/game-ws?sessionId=" +
        props.sessionId +
        "&cid=" +
        cid
    );
    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, JSON.parse(event.data)]);
    };
    onCleanup(() => ws.close());
  };

  const sendMessage = () => {
    if (ws && ws.readyState === ws.OPEN && message()) {
      ws.send(JSON.stringify({ username: props.username, message: message() }));
      setMessage("");
    }
  };

  connectWebSocket();

  return (
    <div>
      <ChatBox messages={messages()} />
      <input
        type="text"
        placeholder="Message"
        value={message()}
        onInput={(e) => setMessage(e.currentTarget.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
