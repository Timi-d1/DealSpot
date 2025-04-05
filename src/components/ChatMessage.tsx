import React from "react";
import styles from "./ChatMessage.module.css";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    time: string;
    isSent: boolean;
    status?: "sent" | "delivered" | "read";
    recieverID: string;
    senderID: string;
  };
}

const getCurrentUserId = () => {
  try {
    // Try to get user from local storage, fallback to a default for testing
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || user.document_id || "current-user-id";
    }
    return "current-user-id";
  } catch (e) {
    console.error("Error getting user ID:", e);
    return "current-user-id";  // Default for testing
  }
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { content, time, isSent, status, recieverID, senderID } = message;

  // Retrieve the current user's ID from local storage
  const currentUser = getCurrentUserId(); // Get the current user ID
  const isMessageSentByUser = message.senderID === currentUser;

const messageClass = isMessageSentByUser ? styles.sentMessage : styles.receivedMessage;
const contentClass = isMessageSentByUser ? styles.sentContent : styles.receivedContent;

console.log("New Message info: ", message)

  const renderStatus = () => {
    if (!status) return null;

    switch (status) {
      case "sent":
        return (
          <span className={`${styles.statusIndicator} ${styles.statusSent}`}>
            ✓
          </span>
        );
      case "delivered":
        return (
          <span className={`${styles.statusIndicator} ${styles.statusDelivered}`}>
            ✓✓
          </span>
        );
      case "read":
        return (
          <span className={`${styles.statusIndicator} ${styles.statusRead}`}>
            ✓✓
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <article className={messageClass}>
      <p className={contentClass}>{content}</p>
      <div className={styles.messageTime}>
        <time>{time}</time>
        {renderStatus()}
      </div>
    </article>
  );
};

export default ChatMessage;