interface MessageItemProps {
    username: string;
    message: string;
}

function MessageItem({username, message}: MessageItemProps) {
    return (
        <li>
            <strong>{username}</strong>: {message}
        </li>
    );
}

export default MessageItem;