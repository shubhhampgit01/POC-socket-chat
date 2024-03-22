import React, { useState } from "react";
import "./styles.css";
import { MdOutlineContentCopy } from "react-icons/md";

const Lobby = ({
  userName,
  setUserName,
  onNameSubmit,
  socketId,
  room,
  setRoom,
}) => {
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [showTips, setShowTips] = useState(false);

  // copy to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(socketId);
    setShowCopiedMessage(true);
    setTimeout(() => {
      setShowCopiedMessage(false);
    }, 1000);
  };
  return (
    <div className="name_entry_container">
      <h2>Welcome to the YooChat</h2>
      <form className="name_entry_form">
        <div className="single_input">
          <label htmlFor="userName">Enter your name:</label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter Your Name"
          />
        </div>

        <div className="single_input">
          <label htmlFor="targetUserId">Enter someone else's ID:</label>
          <input
            type="text"
            id="targetUserId"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Enter ID"
          />
        </div>

        {socketId && (
          <div className="socket_id_info">
            <p>Your ID:</p>

            <div>
              <p id="socketId">{socketId}</p>
              {/* <div className="copy_button"> */}

              <MdOutlineContentCopy
                className="copy_button"
                onClick={handleCopyToClipboard}
              />
              {showCopiedMessage && (
                <span className="copied_message">Copied</span>
              )}
            </div>
            {/* </div> */}
          </div>
        )}
      </form>

      <div className="help_section">
        {!showTips && (
          <a className="help_button" onClick={() => setShowTips(!showTips)}>
            Need Help?
          </a>
        )}
        {showTips && (
          <div className="tips_section">
            <h3>Tips for Getting Started:</h3>
            <ol>
              <li>Enter your name in the "Your Name" field.</li>
              <li>Copy your ID by clicking the copy button.</li>
              <li>Send your ID to the person you want to chat with.</li>
              <li>Ask them to provide their ID.</li>
              <li>Paste their ID in the "Enter someone else's ID" field.</li>
              <li>Click on "Join" to start the chat.</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;
