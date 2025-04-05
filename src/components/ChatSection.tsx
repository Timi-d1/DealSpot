import React, { useState, useRef, useEffect } from "react";
import styles from "./ChatSection.module.css";
import ChatMessage from "./ChatMessage";
import { useChat } from "./ChatContext";
import { Link, useNavigate } from 'react-router-dom'; 

const ChatSection: React.FC = () => {
  const { state, sendMessage, markAsRead } = useChat();
  const { selectedContactId, contacts, messages, currentUser } = state;
  const [messageText, setMessageText] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const navigate = useNavigate();     

  const selectedContact = contacts.find(
    (contact) => contact.id === selectedContactId
  );
  const currentMessages = selectedContactId
    ? messages[selectedContactId] || []
    : [];

  // Scroll function to handle scrolling behavior
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight === scrollTop + clientHeight;

      if (scrollTop < scrollHeight - clientHeight) {
        setIsUserInteracting(true);
      } else {
        setIsUserInteracting(false);
      }
    }
  };

  // Auto-scroll to bottom when new messages arrive (if user isn't scrolling manually)
  useEffect(() => {
    if (messagesContainerRef.current && !isUserInteracting) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [currentMessages, isUserInteracting]);

  // Mark messages as read when viewing them
  useEffect(() => {
    if (selectedContactId && messages[selectedContactId]?.some(msg => msg.status === "unread")) {
      markAsRead(selectedContactId);
    }
  }, [selectedContactId, markAsRead, messages]);

  const handleSendMessage = () => {
    if (selectedContactId && messageText.trim()) {
      sendMessage(messageText, selectedContactId);
        // additionally for email sending
     console.log("Sending message to:", selectedContactId);
     console.log("Current user ID:", currentUser?.id);
      setMessageText("");
   
    }
  };

  console.log("ChatSection info", currentMessages)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!selectedContact) {
    return (
      <section className={styles.chatSection}>
        <div className={styles.emptyState}>
          <p>Select a contact to start chatting</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.chatSection}>
      <header className={styles.chatHeader}>
        <div className={styles.chatUser}>
          <div style={{ position: "relative" }}>
            <span
              className={`${styles.statusIndicator} ${
                selectedContact.status === "online"
                  ? styles.online
                  : styles.offline
              }`}
            />
          </div>
          <div>
            <h3 className={styles.name}>{selectedContact.name}</h3>
            <p className={styles.status}>
              {selectedContact.status === "online"
                ? "Online"
                : `Offline - Last seen, ${selectedContact.lastSeen}`}
            </p>
          </div>
        </div>
        <div className={styles.chatActions}>
          <button aria-label="Call" className={styles.actionButton}>
            <i className={styles.tiTiPhone} />
          </button>
          <button aria-label="More options" className={styles.actionButton}>
            <i className={styles.tiTiDotsVertical} />
          </button>
        </div>
      </header>

      <div
        className={styles.chatMessages}
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {currentMessages.map((message) => (
          <ChatMessage
          key={message.id}
          message={{
            id: message.id,
            content: message.message, // Assuming 'message.message' holds the content of the message
            time: message.timestamp, // Make sure 'timestamp' exists
            isSent: message.senderId === String(currentUser.id),
            status: message.status as "sent" | "delivered" | "read", // Ensure status is one of these values
            recieverID: message.receiver_id, // Ensure the receiver's ID is correctly named here
            senderID: message.sender_id, // Ensure senderId is correctly named here
            
          }}
        />
        ))}
        {selectedContact.isTyping && (
          <div className={styles.messagereceived} style={{ marginTop: "8px" }}>
            <div
              className={styles.messageContentReceived}
              style={{
                display: "inline-block",
                padding: "8px 16px",
                minWidth: "60px",
              }}
            >
              <span className={styles.typingIndicator}>
                <span className={styles.typingDot}></span>
                <span className={styles.typingDot}></span>
                <span className={styles.typingDot}></span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.chatInput}>
        <div className={styles.inputContainer}>
          <input
            type="text"
            placeholder="Type your message here..."
            className={styles.messageInput}
            aria-label="Message input"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            aria-label="Send message"
            className={`${styles.sendButton} ${
              messageText.trim() ? styles.sendButtonActive : ""
            }`}
            onClick={handleSendMessage}
          >
            <i className={styles.tiTiSend} />
            <span>Send</span>
          </button>
          
        </div>
      </div>
    </section>
  );
};

export default ChatSection;