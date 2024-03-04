import React, { useState, useEffect } from "react";
import Head from "next/head";
import { FaUserFriends, FaUsers } from "react-icons/fa";

// Liste d'emojis
const emojis = ["😊", "😎", "👍", "❤️", "🎉", "😂", "😍", "😘", "😜"];

export default function ChatComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showGroups, setShowGroups] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem("id")
      ? { id: JSON.parse(localStorage.getItem("id")) }
      : { id: 99 }
  );

  const [ws, setWs] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const backendHost = window.location.hostname;
  const apiUrl = `http://${backendHost}:8080/api/users`;
  const wsUrl = `ws://${backendHost}:8080/ws`;

  const updateUserOrder = (friendId) => {
    setUsers((prevUsers) => {
      const updatedUsers = prevUsers.filter((user) => user.id !== friendId);
      const friend = prevUsers.find((user) => user.id === friendId);
      const newOrder = [friend, ...updatedUsers];
      localStorage.setItem("userOrder", JSON.stringify(newOrder));
      return newOrder;
    });
  };

  const isNewDay = (prevTimestamp, currentTimestamp) => {
    const prevDate = new Date(prevTimestamp).toLocaleDateString();
    const currentDate = new Date(currentTimestamp).toLocaleDateString();
    return prevDate !== currentDate;
  };

  useEffect(() => {
    const userOrder = localStorage.getItem("userOrder");
    if (userOrder) {
      setUsers(JSON.parse(userOrder));
    }
    const newWs = new WebSocket(wsUrl);

    newWs.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    newWs.onmessage = (event) => {
      console.log("Message received from server:", event.data);
      const receivedMessage = JSON.parse(event.data);
      setMessages((prevMessages = []) => {
        if (!Array.isArray(prevMessages)) {
          prevMessages = [];
        }
        return [...prevMessages, receivedMessage];
      });
    };

    newWs.onclose = () => {
      console.log("WebSocket connection closed");
    };

    newWs.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setWs(newWs);

    fetchUsers();
    fetchGroups();

    return () => {
      if (newWs) {
        newWs.close();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedFriend || selectedGroup) {
      fetchOldMessages();
    } else {
      setMessages([]); // Réinitialiser les messages lorsque ni un ami ni un groupe n'est sélectionné
    }
  }, [selectedFriend, selectedGroup]);

  const handleSendMessage = () => {
    if (messageText.trim() !== "") {
      const currentDate = new Date();
      const formattedDate = currentDate
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
      let newMessage = {
        text: messageText,
        senderId: currentUser.id,
        senderName: currentUser.name,
        groupId: selectedGroup ? selectedGroup.id : null,
        timestamp: formattedDate,
      };

      if (selectedFriend) {
        newMessage = {
          ...newMessage,
          recipientId: selectedFriend.id,
          destinataireType: "Friend", // Si un ami est sélectionné, le type de destinataire est "Friend"
        };
      } else {
        newMessage = {
          ...newMessage,
          destinataireType: "Group", // Sinon, le type de destinataire est "Group"
        };
      }

      console.log("Message sent from client:", newMessage);

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(newMessage));
      }
      if (selectedFriend) {
        updateUserOrder(selectedFriend.id);
      }
      setMessageText("");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(apiUrl, {
        credentials: "include",
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(`http://${backendHost}:8080/api/groupschat`);
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchOldMessages = async () => {
    if (selectedFriend || selectedGroup) {
      try {
        let recipientId;
        let recipientType;
        if (selectedFriend) {
          recipientId = selectedFriend.id;
          recipientType = "Friend";
        } else if (selectedGroup) {
          recipientId = selectedGroup.id;
          recipientType = "Group";
        }

        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderId: currentUser.id,
            recipientId,
            recipientType,
          }),
        };
        const response = await fetch(
          `http://${backendHost}:8080/api/oldmessages`,
          requestOptions
        );
        console.log("test", recipientType);
        // console.log(data)
        const data = await response.json();
        console.log(data);
        setMessages(data);
      } catch (error) {
        console.error("Error fetching old messages:", error);
      }
    }
  };

  // useEffect(() => {
  //   if (selectedFriend) {
  //     fetchOldMessages();
  //   }
  // }, [selectedFriend]);

  const handleUserClick = (event, friend) => {
    if (friend) {
      setSelectedFriend(friend);
      // setSelectedGroup(null)

      const user = event.currentTarget;
      const childOffset = user.getBoundingClientRect();
      const parentOffset =
        user.parentElement.parentElement.getBoundingClientRect();
      const childTop = childOffset.top - parentOffset.top;
      const clone = user.querySelector("img").cloneNode(true);
      const top = `${childTop + 12}px`;

      const profileName = document.querySelector("#profile p");
      const profileEmail = document.querySelector("#profile span");

      clone.classList.add("floatingImg");
      clone.style.top = top;
      document.getElementById("chatbox").appendChild(clone);

      setTimeout(() => {
        profileName.classList.add("animate");
        document.getElementById("profile").classList.add("animate");
      }, 100);

      setTimeout(() => {
        document.getElementById("chat-messages").classList.add("animate");
        document
          .querySelectorAll(".cx, .cy")
          .forEach((element) => element.classList.add("s1"));
        setTimeout(
          () =>
            document
              .querySelectorAll(".cx, .cy")
              .forEach((element) => element.classList.add("s2")),
          100
        );
        setTimeout(
          () =>
            document
              .querySelectorAll(".cx, .cy")
              .forEach((element) => element.classList.add("s3")),
          200
        );
      }, 150);

      clone.animate([{ width: "68px", left: "108px", top: "20px" }], {
        duration: 200,
        fill: "forwards",
      });

      const name = user.querySelector("p strong").innerHTML;
      profileName.innerHTML = name;

      const messagesWithoutRight = document.querySelectorAll(
        ".message:not(.right)"
      );
      messagesWithoutRight.forEach((message) => {
        const imgElement = message.querySelector("img");
        if (imgElement) {
          imgElement.src = clone.src;
        }
      });

      document.getElementById("friendslist").style.display = "none";
      document.getElementById("chatview").style.display = "block";

      document.getElementById("close").addEventListener("click", () => {
        document.getElementById("chat-messages").classList.remove("animate");
        document.getElementById("profile").classList.remove("animate");
        document
          .querySelectorAll(".cx, .cy")
          .forEach((element) => element.classList.remove("s1", "s2", "s3"));

        clone.animate([{ width: "40px", top: top, left: "12px" }], {
          duration: 200,
          fill: "forwards",
        }).onfinish = () => {
          clone.remove();
        };

        setTimeout(() => {
          document.getElementById("chatview").style.display = "none";
          document.getElementById("friendslist").style.display = "block";
        }, 50);
      });
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredUsers = users
    ? users.filter(
        (user) =>
          user &&
          user.name &&
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const filteredGroups = groups
    ? groups.filter((group) =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const filteredMessages = messages
    ? messages.filter((msg) => {
        if (selectedFriend) {
          return (
            (msg.senderId === currentUser.id &&
              msg.recipientId === selectedFriend.id &&
              msg.destinataireType === "Friend") ||
            (msg.senderId === selectedFriend.id &&
              msg.recipientId === currentUser.id &&
              msg.destinataireType === "Friend")
          );
        } else if (selectedGroup) {
          return (
            msg.groupId === selectedGroup.id && msg.destinataireType === "Group"
          );
        } else {
          return true;
        }
      })
    : [];

  useEffect(() => {
    const newFriends = document.querySelectorAll(".friend");
    newFriends.forEach((friend) => {
      friend.addEventListener("click", handleUserClick);
    });

    return () => {
      newFriends.forEach((friend) => {
        friend.removeEventListener("click", handleUserClick);
      });
    };
  }, [filteredUsers]);

  const handleGroupsClick = () => {
    setShowGroups(!showGroups);
  };

  const handleFriendsClick = () => {
    setShowGroups(false);
  };

  const handleGroupClick = (event, group) => {
    if (group) {
      setSelectedGroup(group);
      setSelectedFriend(null);
      const groupElement = event.currentTarget;

      const childOffset = groupElement.getBoundingClientRect();
      const parentOffset =
        groupElement.parentElement.parentElement.getBoundingClientRect();
      const childTop = childOffset.top - parentOffset.top;

      const clone = groupElement.querySelector("img").cloneNode(true);

      const top = `${childTop + 12}px`;

      const profileName = document.querySelector("#profile p");

      clone.classList.add("floatingImg");
      clone.style.top = top;

      document.getElementById("chatbox").appendChild(clone);

      setTimeout(() => {
        profileName.classList.add("animate");
        document.getElementById("profile").classList.add("animate");
      }, 100);

      setTimeout(() => {
        document.getElementById("chat-messages").classList.add("animate");
        document
          .querySelectorAll(".cx, .cy")
          .forEach((element) => element.classList.add("s1"));
        setTimeout(
          () =>
            document
              .querySelectorAll(".cx, .cy")
              .forEach((element) => element.classList.add("s2")),
          100
        );
        setTimeout(
          () =>
            document
              .querySelectorAll(".cx, .cy")
              .forEach((element) => element.classList.add("s3")),
          200
        );
      }, 150);

      clone.animate([{ width: "68px", left: "108px", top: "20px" }], {
        duration: 200,
        fill: "forwards",
      });

      const name = groupElement.querySelector("p strong").innerHTML;

      profileName.innerHTML = name;

      document.getElementById("friendslist").style.display = "none";
      document.getElementById("chatview").style.display = "block";

      document.getElementById("close").addEventListener("click", () => {
        document.getElementById("chat-messages").classList.remove("animate");
        document.getElementById("profile").classList.remove("animate");
        document
          .querySelectorAll(".cx, .cy")
          .forEach((element) => element.classList.remove("s1", "s2", "s3"));

        clone.animate([{ width: "40px", top: top, left: "12px" }], {
          duration: 200,
          fill: "forwards",
        }).onfinish = () => {
          clone.remove();
        };

        setTimeout(() => {
          document.getElementById("chatview").style.display = "none";
          document.getElementById("friendslist").style.display = "block";
        }, 50);
      });
    }
  };

  const insertEmoji = (emoji) => {
    setMessageText(messageText + emoji);
  };

  const formatDateFull = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div id="chatbox">
      <Head>
        <link
          href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700"
          rel="stylesheet"
          type="text/css"
        />
      </Head>
      <div id="friendslist">
        <div id="topmenu">
          <span
            className={`friends ${!showGroups ? "active" : ""}`}
            onClick={handleFriendsClick}
          >
            Friends
            <FaUserFriends />{" "}
          </span>
          <span
            className={`groups ${showGroups ? "active" : ""}`}
            onClick={handleGroupsClick}
          >
            {" "}
            <FaUsers />
          </span>
          <span className="history"></span>
        </div>
        <div id="friends">
          {!showGroups ? (
            <div>
              {filteredUsers.length === 0 ? (
                <div>Aucun utilisateur trouvé.</div>
              ) : (
                filteredUsers.map((user, index) => (
                  <div
                    className="friend"
                    key={index}
                    onClick={(event) => handleUserClick(event, user)}
                  >
                    <img src={user.avatar} />
                    <p>
                      <strong>{user.name}</strong>
                      <br />
                      <span>{user.email}</span>
                    </p>
                    <div className={`status ${user.status}`}></div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div id="groupslist">
              {filteredGroups.length === 0 ? (
                <div>Aucun groupe trouvé.</div>
              ) : (
                filteredGroups.map((group, index) => (
                  <div
                    className="group"
                    key={index}
                    onClick={(event) => handleGroupClick(event, group)}
                  >
                    <img src={group.imageUrl} />
                    <p>
                      <strong>{group.name}</strong>
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div id="search">
          <input
            type="text"
            id="searchfield"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search contacts..."
          />
        </div>
      </div>

      <div id="chatview" className="p1">
        <div id="profile">
          <div id="close">
            <div className="cy"></div>
            <div className="cx"></div>
          </div>

          <p>Lamine</p>
        </div>

        <div id="chat-messages">
        {filteredMessages.map((msg, index) => (
            <div key={index}>
              {index === 0 ||
              isNewDay(filteredMessages[index - 1].timestamp, msg.timestamp) ? (
                <div className="day">{formatDateFull(msg.timestamp)}</div>
              ) : null}
              <div
                className={
                  msg.senderId === currentUser.id
                    ? "message sender-message"
                    : "message recipient-message"
                }
              >
                <div className="bubble">
                  <p>{msg.text}</p>
                </div>
                <div class="message-info">
                  <span>
                    {formatTime(msg.timestamp)}
                  </span>
                  {msg.senderId !== currentUser.id && (
                    <span>{msg.senderName}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div id="sendmessage">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Send message..."
          />
          {/* Bouton pour afficher/masquer le sélecteur d'emojis */}
          <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            😊 Emoji
          </button>
          {/* Sélecteur d'emojis */}
          {showEmojiPicker && (
            <div id="emojiPicker">
              {emojis.map((emoji, index) => (
                <span key={index} onClick={() => insertEmoji(emoji)}>
                  {emoji}
                </span>
              ))}
            </div>
          )}
          <button id="send" onClick={handleSendMessage}></button>
        </div>
      </div>
    </div>
  );
}
