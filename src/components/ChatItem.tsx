import React from "react";
import styles from "./ChatItem.module.css";
import { ChatContact } from "./types";

interface ChatItemProps {
  contact: ChatContact;
  isSelected: boolean;
  onSelect: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  contact,
  isSelected,
  onSelect,
}) => {
  const {
    name,
    message,
    time,
    hasNotification,
    notificationCount,
    isRead,
    isTyping,
    status,
  } = contact;

  return (
    <li
      className={`${styles.chatItem} ${isSelected ? styles.selected : ""}`}
      onClick={onSelect}
    >
      <div style={{ position: "relative" }}>
        <span
          className={`${styles.statusIndicator} ${
            status === "online" ? styles.online : styles.offline
          }`}
        />
      </div>

      <div className={styles.chatInfo}>
        <h3 className={styles.name}>{name}</h3>
        {isTyping ? (
          <p className={`${styles.message} ${styles.typingMessage}`}>
            typing...
          </p>
        ) : (
          <p className={styles.message}>{message}</p>
        )}
      </div>

      <div className={styles.chatMeta}>
        <time className={styles.time}>{time}</time>
        {isRead ? (
          <span className={styles.statusCheck}>
            <i className={styles.tiTiCheck} />
          </span>
        ) : hasNotification ? (
          <span className={styles.notification}>{notificationCount}</span>
        ) : null}
      </div>
    </li>
  );
};

export default ChatItem;