import React, { useEffect, useState } from "react";
import styles from "./PeopleSection.module.css";
import ChatItem from "./ChatItem";
import { useChat } from "./ChatContext";

const PeopleSection: React.FC = () => {
  const { state, selectContact } = useChat();
  const { contacts, selectedContactId } = state;
  const [isLoading, setIsLoading] = useState(true);

  // Only set loading to false when contacts are populated
  useEffect(() => {
    if (contacts.length > 0) {
      setIsLoading(false); // Set loading to false when contacts are available
    }
  }, [contacts.length]); // Depend only on contacts length to avoid infinite loop

  const handleContactSelect = (contactId: string) => {
    selectContact(contactId);
  };

  return (
    <aside className={styles.peopleSection}>
      <h2 className={styles.sectionTitle}>People</h2>
      {isLoading ? (
        <p>Loading contacts...</p> // Display loading message
      ) : contacts.length === 0 ? (
        <p>No contacts available</p> // If no contacts after loading
      ) : (
        <ul className={styles.chatList}>
          {contacts.map((contact) => (
            <ChatItem
              key={contact.id}
              contact={contact}
              isSelected={contact.id === selectedContactId}
              onSelect={() => handleContactSelect(contact.id)}
            />
          ))}
        </ul>
      )}
    </aside>
  );
};

export default PeopleSection;
