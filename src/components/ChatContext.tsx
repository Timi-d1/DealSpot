"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";

import { ChatState, Message, ChatContact } from "./types";


// Get current user ID from localStorage
  const getCurrentUserId = () => {
    try {
      // Try to get user from local storage, fallback to a default for testing
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log("Current user:", user.id)
        return user.id || user.document_id || "current-user-id";
      }
      return "current-user-id";
    } catch (e) {
      console.error("Error getting user ID:", e);
      return "current-user-id";  // Default for testing
    }
  };


const initialState: ChatState = {
  currentUser: {
    id: "0",
    name: "You",
    status: "online",
  },
  contacts: [], // Initially empty, will be populated from API
  messages: [],
  selectedContactId: "", // Default to first contact
  onlineUsers: [1],
};

type ChatAction =
  | { type: "SELECT_CONTACT"; payload: string }
  | { type: "SEND_MESSAGE"; payload: { content: string; contactId: string; senderId: string; status: string } }
  | { type: "MARK_AS_READ"; payload: string }
  | { type: "SET_TYPING"; payload: { contactId: string; isTyping: boolean } }
  | { type: "UPDATE_MESSAGE_STATUS"; payload: { messageId: number; contactId: string; status: "sent" | "delivered" | "read" } }
  | { type: "UPDATE_CONTACTS"; payload: ChatContact[] }
  | { type: "FETCH_MESSAGES"; payload: { contactId: string; messages: Message[]; status: string } };

    const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
      switch (action.type) {
        case "SELECT_CONTACT":

          return {
            ...state,
            selectedContactId: action.payload,
          };
    
          case "SEND_MESSAGE": {
            const { content, contactId, senderId, status } = action.payload;  // Adjusted field names
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const ampm = hours >= 12 ? "pm" : "am";
            const formattedHours = hours % 12 || 12;
            const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
            const timestamp = `Today, ${formattedHours}:${formattedMinutes}${ampm}`;
          
            // Get current messages for the contact or default to an empty array
            const currentMessages = state.messages[contactId] || [];
          
            // Generate a new ID based on the length of the existing messages
            const newId = (currentMessages.length + 1).toString(); // Ensure it's a string
          
            const newMessage: Message = {
              id: newId,           // This matches the 'id' in your Message interface
              sender_id: senderId,  // Corrected to 'senderId' (camelCase)
              receiver_id: contactId, // Corrected to 'receiverId' (camelCase)
              message: content,     // Corrected to 'content' (camelCase)
              timestamp,
              status,
            };
          
            // Add the new message to the contact's messages
            return {
              ...state,
              messages: {
                ...state.messages,
                [contactId]: [...(state.messages[contactId] || []), newMessage],
              },
            };
          }
        case "FETCH_MESSAGES":
          console.log("Fetched messages:", action.payload.messages); // Add a log to check the messages
          return {
            ...state,
            messages: {
              ...state.messages,
              [action.payload.contactId]: action.payload.messages, // Set messages for the selected contact
            },
          };
    
        case "MARK_AS_READ": {
          const contactId = action.payload;
          const updatedMessages = { ...state.messages };
          if (updatedMessages[contactId]) {
            updatedMessages[contactId] = updatedMessages[contactId].map((message) => {
              if (String(message.senderId) !== String(state.currentUser.id)) {
                return { ...message, status: "read" };
              }
              return message;
            });
          }
          const updatedContacts = state.contacts.map((contact) => {
            if (contact.id === contactId) {
              return {
                ...contact,
                hasNotification: false,
                notificationCount: 0,
                isRead: true,
              };
            }
            return contact;
          });
          return {
            ...state,
            messages: updatedMessages,
            contacts: updatedContacts,
          };
        }
    
        case "SET_TYPING": {
          const { contactId, isTyping } = action.payload;
          const updatedContacts = state.contacts.map((contact) => {
            if (contact.id === contactId) {
              return {
                ...contact,
                isTyping,
              };
            }
            return contact;
          });
          return {
            ...state,
            contacts: updatedContacts,
          };
        }
    
        case "UPDATE_MESSAGE_STATUS": {
          const { messageId, contactId, status } = action.payload;
          const updatedMessages = { ...state.messages };
          if (updatedMessages[contactId]) {
            updatedMessages[contactId] = updatedMessages[contactId].map(
              (message) => {
                if (message.id === messageId) {
                  return { ...message, status };
                }
                return message;
              },
            );
          }
          return {
            ...state,
            messages: updatedMessages,
          };
        }
    
        case "UPDATE_CONTACTS": {
          console.log("Updated contacts:", action.payload);  // Log the updated contacts
          const updatedContacts = action.payload.map((contact: any) => ({
            id: contact.contact_id,  // Map `contact_id` to `id`
            name: contact.contact_name,  // Map `contact_name` to `name`
            message: "",  // You may need to fetch the latest message for each contact
            time: "",  // You may need to fetch the last message timestamp
            hasNotification: false,  // Set based on your business logic
            isRead: true,  // Set based on message read status
            status: "",  // You may need to fetch the user's status
            lastSeen: "",  // Optionally include last seen time
            isTyping: false,  // You may need to track whether the user is typing
          }));
        
          return {
            ...state,
            contacts: updatedContacts, // Update contacts array with the transformed data
          };
        }
    
        default:
          return state;
      }
    };
    

interface ChatContextType {
  state: ChatState;
  selectContact: (contactId: string) => void;
  sendMessage: (content: string, contactId: string) => void;
  markAsRead: (contactId: string) => void;
  setTyping: (contactId: string, isTyping: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const location = useLocation();

  useEffect(() => {
    // Extract sellerId from the query string when the component mounts
    const urlParams = new URLSearchParams(location.search);
    const sellerId = urlParams.get("sellerId");
  
    if (sellerId) {
      // Dispatch SELECT_CONTACT to set the selectedContactId in the state
      dispatch({ type: "SELECT_CONTACT", payload: sellerId });
  
      // Send a "Hey" message to the selected contact (sellerId) right after selecting
      const currentUserId = getCurrentUserId();  // Get the current user ID
      const messageData = {
        content: "Hi, I'm interested in this product.",  // Send a "Hey" message
        contactId: sellerId,  // The selected sellerId as the contact
        senderId: currentUserId,  // Current user's ID
        status: "sent",  // Status can be "sent"
      };

      // Call sendMessage function to make the API request
      sendMessage(messageData.content, messageData.contactId);
    }
  }, [location, dispatch]); 

  const selectContact = (contactId: string) => {
    dispatch({ type: "SELECT_CONTACT", payload: contactId });
    dispatch({ type: "MARK_AS_READ", payload: contactId });
  };

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch(`http://localhost:5001/contacts?user_id=${getCurrentUserId()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch contacts");
        }
        const data = await response.json();
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contacts });
      } catch (err) {
        console.error(err);
      }
    };
  
    console.log("Updated_Contacts:", fetchContacts());
    fetchContacts();
  }, [state.currentUser.id, state.contacts]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (state.selectedContactId) {
        try {
          const response = await fetch(
            `http://localhost:5001/messages?user_id=${getCurrentUserId()}&other_user_id=${state.selectedContactId}`
          );
          const data = await response.json();
  
          // Dispatch action to store the fetched messages in the state
          dispatch({
            type: "FETCH_MESSAGES",
            payload: {
              contactId: state.selectedContactId,
              messages: data.messages,
              status: "delivered"
            },
          });
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };
  
    fetchMessages();
  }, [state.selectedContactId, state.messages]);

  

  const sendMessage = async (content: string, contactId: string) => {
    if (!content.trim()) return; // Don't send an empty message
  
    const senderId = getCurrentUserId(); // Get the current user ID
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timestamp = `Today, ${formattedHours}:${formattedMinutes}${ampm}`;
  
    // Send the message to the backend
    try {
      const response = await fetch("http://localhost:5001/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender_id: senderId, // Ensure the field names are correct here
          receiver_id: contactId,
          message: content,
        }),
      });
  
      const data = await response.json();
  
      if (data.message === "Message sent successfully") {
        const newMessage = {
          id: Date.now().toString(), // Generate a new ID for the message
          sender_id: senderId, // Correct field name
          receiver_id: contactId, // Correct field name
          message: content,  // Use 'message' instead of 'content'
          timestamp,  // Add the timestamp
          status: "sent",  // Keep status as 'sent'
        };
  
        // Dispatch the action to add the message to the state
        dispatch({
          type: "SEND_MESSAGE",
          payload: {
            content,        // the actual message content
            contactId,      // the ID of the contact to send the message to
            senderId,       // the sender's ID
            status: "sent",  // message status (e.g., sent, delivered)
          },
        });
  
        // Simulate message delivery and update the status
        setTimeout(() => {
          dispatch({
            type: "UPDATE_MESSAGE_STATUS",
            payload: {
              messageId: parseInt(newMessage.id),
              contactId,
              status: "delivered",
            },
          });
        }, 1000); // Simulate delivery after 1 second
  
      } else {
        console.error("Error sending message:", data.error);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  

  const markAsRead = useCallback((contactId: string) => {
    dispatch({ type: "MARK_AS_READ", payload: contactId });
  }, [dispatch]);

  const setTyping = (contactId: string, isTyping: boolean) => {
    dispatch({ type: "SET_TYPING", payload: { contactId, isTyping } });
  };

  // Simulate occasional online status changes
  useEffect(() => {
    const interval = setInterval(() => {
      const randomContactId =
        Math.floor(Math.random() * [].length) + 1;
      const randomContactIdStr = randomContactId.toString();
      const isCurrentlyOnline = state.onlineUsers.includes(randomContactId);

      // Toggle online status
      if (isCurrentlyOnline) {
        // Set to offline
        const updatedOnlineUsers = state.onlineUsers.filter(
          (id) => id !== randomContactId,
        );
        const updatedContacts = state.contacts.map((contact) => {
          if (contact.id === randomContactIdStr) {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const ampm = hours >= 12 ? "pm" : "am";
            const formattedHours = hours % 12 || 12;
            const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
            return {
              ...contact,
              status: "offline" as const,
              lastSeen: `Today, ${formattedHours}:${formattedMinutes}${ampm}`,
            };
          }
          return contact;
        });

        // Update state directly since we don't have a reducer action for this
        // This is a bit of a hack but works for the demo
        state.onlineUsers = updatedOnlineUsers;
        state.contacts = updatedContacts;
      } else {
        // Set to online
        const updatedOnlineUsers = [...state.onlineUsers, randomContactId];
        const updatedContacts = state.contacts.map((contact) => {
          if (contact.id === randomContactIdStr) {
            return {
              ...contact,
              status: "online" as const,
            };
          }
          return contact;
        });

        // Update state directly
        state.onlineUsers = updatedOnlineUsers;
        state.contacts = updatedContacts;
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [state]);

  return (
    <ChatContext.Provider
      value={{
        state,
        selectContact,
        sendMessage,
        markAsRead,
        setTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};