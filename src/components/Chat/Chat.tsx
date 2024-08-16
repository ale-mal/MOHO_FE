import { createSignal, onCleanup, type Component } from "solid-js";
import ChatBox from "~/components/Chat/ChatBox";

interface Message {
  username: string;
  message: string;
}

const Chat: Component = () => {
  const [messages, setMessages] = createSignal<Message[]>([]);
  const [username, setUsername] = createSignal("");
  const [message, setMessage] = createSignal("");
  let ws: WebSocket;

  const connectWebSocket = () => {
    ws = new WebSocket(import.meta.env.VITE_WEBSOCKET_URL + "/chat");
    ws.onmessage = (event) => {
      setMessages([...messages(), JSON.parse(event.data)]);
    };
    onCleanup(() => ws.close());
  };

  const sendMessage = () => {
    if (ws && message() && username()) {
      ws.send(JSON.stringify({ username: username(), message: message() }));
      setMessage("");
    }
  };

  connectWebSocket();

  return (
    <div>
      <input
        type="text"
        placeholder="Username"
        value={username()}
        onInput={(e) => setUsername(e.currentTarget.value)}
      />
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
}

export default Chat;