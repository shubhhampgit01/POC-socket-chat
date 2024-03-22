import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import Chat from "./chat";
import Lobby from "./lobby";
import "./App.css";

const App = () => {
  // const socket = useMemo(() => io("http://localhost:3000"), []);

  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [userName, setUserName] = useState("");
  const [chattingWith, setChattingWith] = useState([]);
  // const [userId, setUserId] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [socketId, setSockedId] = useState("");
  const [messages, setMessages] = useState([]);
  const socket = io("http://localhost:3000");

  // to get the msg sent or received time
  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12; // Convert to 12-hour format
    const formattedHours = hours.toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");

    return `${formattedHours}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    socket.on("connect", () => {
      setSockedId(socket.id);
    });

    socket.on("receive", (s) => {
      setMessages((messages) => [
        ...messages,
        { message: s?.message, id: s?.id, name: s?.sender, time: s?.time },
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    socket.on("userJoined", (user) => {
      setChattingWith((prev) => {
        if (prev.length < 1) {
          setMessages((messages) => [
            ...messages,
            {
              message: `${user.name} has joined the chat`,
              id: socketId,
              isJoined: true,
            },
          ]);
          return [...prev, { user: user.name, id: user.id }];
        }
        return prev;
      });
    });
  }, [chattingWith, messages]);

  const isJoined = messages[0]?.isJoined;

  // submission of msg
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isJoined) {
      return;
    }

    if (message.trim().length < 1) {
      return;
    }
    setMessages((messages) => [
      ...messages,
      { message: message, id: socketId, time: getCurrentTime() },
    ]);
    // setMessages((messages) => [...messages, message:message,id:socketId]);
    socket.emit("message", {
      message,
      room,
      id: socketId,
      sender: userName,
      time: getCurrentTime(),
    });
    setMessage("");
  };

  // register a user

  const handleRegistration = (e) => {
    e.preventDefault();

    if (userName.trim() == "" || room.trim() == "" || room.trim() == socketId) {
      return;
    }
    setIsRegistered(true);
    socket.emit("register", { id: socketId, name: userName, room: room });
  };

  // scroll to bottom
  const messageContainerRef = useRef();
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="container">
      {isRegistered ? (
        <div className="chat_container">
          <div className="header">
            <h1>YooChat</h1>
            {chattingWith.map((user) => (
              <div key={user.id}>
                {user.id !== socketId && (
                  <p>
                    Chatting with:{" "}
                    <span className="chatWith"> {user.user}</span>
                  </p>
                )}
              </div>
            ))}
            {chattingWith.every((user) => user.id === socketId) && (
              <p>Waiting for someone to join...</p>
            )}
          </div>

          <div ref={messageContainerRef} className="message_container">
            {messages.map((value, key) => (
              <div
                key={key}
                className={`msg_container `}
                style={
                  value.id !== socketId && !value?.isJoined
                    ? { flexDirection: "row" }
                    : { flexDirection: "column" }
                }
              >
                {value.id !== socketId && !value?.isJoined && (
                  <div className="avatar_container">
                    <div className="avatar">
                      {value?.name?.substring(0, 1).toUpperCase()}
                    </div>
                  </div>
                )}
                <div
                  className={`message ${
                    value.id === socketId ? "sent" : "received"
                  } ${value?.isJoined && "joined"}`}
                >
                  <span className="single_msg"> {value.message}</span>
                  <span className="time">{value.time}</span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="input_container">
            <input
              className="chatInput"
              type="text"
              disabled={!isJoined}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message"
            />

            {/* <button type="submit">Send</button> */}

            <button type="submit">
              <div class="svg-wrapper-1">
                <div class="svg-wrapper">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                  >
                    <path fill="none" d="M0 0h24v24H0z"></path>
                    <path
                      fill="currentColor"
                      d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z"
                    ></path>
                  </svg>
                </div>
              </div>
              <span>Send</span>
            </button>
          </form>
        </div>
      ) : (
        <div style={{}} className="lobby_container">
          <Lobby
            userName={userName}
            setUserName={setUserName}
            socketId={socketId}
            room={room}
            setRoom={setRoom}
          />
          <button
            className="joinButton"
            style={{ width: "100px" }}
            onClick={handleRegistration}
          >
            Join
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
