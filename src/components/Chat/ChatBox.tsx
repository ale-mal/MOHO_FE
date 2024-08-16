import MessageItem from "~/components/Chat/MessageItem";

interface ChatBoxProps {
    messages: { username: string; message: string }[];
}

function ChatBox(props: ChatBoxProps) {
    return (
        <ul class="chat-box">
            {props.messages.map((message, index) => (
                <MessageItem username={message.username} message={message.message} />
            ))}
        </ul>
    );
}

export default ChatBox;