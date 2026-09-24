import {
  useEffect,
  useState,
} from 'react';

import { socket } from '../socket';

import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface Message {
  id: string;
  userId: string;
  roomId: string;
  message: string;
  createdAt: string;
}

interface ChatRoomProps {
  roomId: string;
  currentUser: any;
  token: string;
}

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000';

export default function ChatRoom({
  roomId,
  currentUser,
  token,
}: ChatRoomProps) {

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [typingUser, setTypingUser] =
    useState<string | null>(null);

  const [connected, setConnected] =
    useState(socket.connected);

  useEffect(() => {

    const onConnect = () => {
      setConnected(true);

      socket.emit(
        'joinRoom',
        {
          roomId,
        },
      );
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onMessage = (
      message: Message,
    ) => {

      setMessages(
        (previous) => [
          ...previous,
          message,
        ],
      );
    };

    const onTyping = (
      data: { userId: string },
    ) => {

      if (
        data.userId ===
        currentUser?.id
      ) {
        return;
      }

      setTypingUser(
        data.userId,
      );

      setTimeout(() => {
        setTypingUser(null);
      }, 1500);
    };

    socket.on(
      'connect',
      onConnect,
    );

    socket.on(
      'disconnect',
      onDisconnect,
    );

    socket.on(
      'newMessage',
      onMessage,
    );

    socket.on(
      'userTyping',
      onTyping,
    );

    if (socket.connected) {

      socket.emit(
        'joinRoom',
        {
          roomId,
        },
      );
    }

    return () => {

      socket.off(
        'connect',
        onConnect,
      );

      socket.off(
        'disconnect',
        onDisconnect,
      );

      socket.off(
        'newMessage',
        onMessage,
      );

      socket.off(
        'userTyping',
        onTyping,
      );

    };

  }, [roomId, currentUser?.id]);

  /*
   * Load previous messages
   */
  useEffect(() => {

    const loadMessages =
      async () => {

        try {

          const response =
            await fetch(
              `${API_URL}/chat/rooms/${roomId}/messages`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

          if (!response.ok) {
            throw new Error(
              'Failed to load messages',
            );
          }

          const data =
            await response.json();

          setMessages(data);

        } catch (error) {

          console.error(error);

        }
      };

    loadMessages();

  }, [roomId, token]);

  return (
    <div className="chat-room">

      <div className="chat-header">

        <div>

          <h2>
            Chat Room
          </h2>

          <span>
            {roomId}
          </span>

          <span>
            You: {
              currentUser?.name ||
              currentUser?.username ||
              currentUser?.email ||
              'Unknown user'
            }
          </span>

        </div>

        <div
          className={
            connected
              ? 'status online'
              : 'status offline'
          }
        >
          {connected
            ? 'Connected'
            : 'Disconnected'}
        </div>

      </div>

      <MessageList
        messages={messages}
        currentUserId={
          currentUser?.id
        }
        currentUserName={
          currentUser?.name ||
          currentUser?.username ||
          currentUser?.email ||
          'Unknown user'
        }
      />

      {typingUser && (
        <div className="typing">
          {typingUser} is typing...
        </div>
      )}

      <MessageInput
        roomId={roomId}
        senderName={
          currentUser?.name ||
          currentUser?.username ||
          currentUser?.email ||
          'Unknown user'
        }
      />

    </div>
  );
}