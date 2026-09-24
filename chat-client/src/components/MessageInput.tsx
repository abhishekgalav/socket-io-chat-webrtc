import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { socket } from '../socket';

interface MessageInputProps {
  roomId: string;
  senderName: string;
}

export default function MessageInput({
  roomId,
  senderName,
}: MessageInputProps) {

  const [message, setMessage] =
    useState('');

  const typingTimer =
    useRef<number | undefined>(
      undefined,
    );

  const sendMessage = () => {

    const text =
      message.trim();

    if (!text) {
      return;
    }

    socket.emit(
      'sendMessage',
      {
        roomId,
        message: text,
        senderName,
      },
    );

    setMessage('');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {

    const value =
      e.target.value;

    setMessage(value);

    socket.emit(
      'typing',
      {
        roomId,
      },
    );

    if (typingTimer.current) {
      window.clearTimeout(
        typingTimer.current,
      );
    }

    typingTimer.current =
      window.setTimeout(() => {
        // Stop typing event can be
        // added later.
      }, 1000);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {

    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  useEffect(() => {

    return () => {

      if (typingTimer.current) {
        window.clearTimeout(
          typingTimer.current,
        );
      }

    };

  }, []);

  return (
    <div className="message-input">

      <input
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
      />

      <button
        onClick={sendMessage}
      >
        Send
      </button>

    </div>
  );
}