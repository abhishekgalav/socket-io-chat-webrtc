import {
  useEffect,
  useState,
} from 'react';

import {
  connectSocket,
  disconnectSocket,
} from '../socket';

import ChatRoom from '../components/ChatRoom';

interface ChatProps {
  token: string;
  user: any;
  onLogout: () => void;
}

export default function Chat({
  token,
  user,
  onLogout,
}: ChatProps) {

  const [roomId, setRoomId] =
    useState('room-123');

  useEffect(() => {

    connectSocket(token);

    return () => {
      disconnectSocket();
    };

  }, [token]);

  return (
    <div className="chat-page">

      <header className="topbar">

        <div>
          <strong>
            Real-Time Chat
          </strong>
        </div>

        <div className="user-info">

          <span>
            {user?.name}
          </span>

          <button
            onClick={onLogout}
          >
            Logout
          </button>

        </div>

      </header>

      <div className="room-selector">

        <label>
          Room:
        </label>

        <input
          value={roomId}
          onChange={(e) =>
            setRoomId(
              e.target.value,
            )
          }
        />

      </div>

      <ChatRoom
        roomId={roomId}
        currentUser={user}
        token={token}
      />

    </div>
  );
}