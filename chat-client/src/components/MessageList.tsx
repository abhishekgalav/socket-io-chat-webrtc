interface Message {
  id: string;
  userId: string;
  userName?: string;
  username?: string;
  senderName?: string;
  displayName?: string;
  user?: {
    name?: string;
    username?: string;
  };
  sender?: {
    name?: string;
    username?: string;
  };
  roomId: string;
  message: string;
  createdAt: string;
}

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
  currentUserName?: string;
}

export default function MessageList({
  messages,
  currentUserId,
  currentUserName,
}: MessageListProps) {

  return (
    <div className="message-list">

      {messages.length === 0 && (
        <div className="empty-chat">
          No messages yet.
          Start the conversation!
        </div>
      )}

      {messages.map((item) => {

        const isMine =
          item.userId === currentUserId;

        const senderName =
          item.userName ||
          item.username ||
          item.senderName ||
          item.displayName ||
          item.user?.name ||
          item.user?.username ||
          item.sender?.name ||
          item.sender?.username ||
          item.userId;

        return (
          <div
            key={item.id}
            className={
              isMine
                ? 'message-wrapper mine'
                : 'message-wrapper'
            }
          >

            <div className="message">

              <div className="message-user">
                {isMine
                  ? currentUserName || 'You'
                  : senderName}
              </div>

              <div className="message-text">
                {item.message}
              </div>

              <div className="message-time">
                {new Date(
                  item.createdAt,
                ).toLocaleTimeString()}
              </div>

            </div>

          </div>
        );
      })}

    </div>
  );
}