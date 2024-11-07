const exitBtn = document.getElementById("exitBtn");
const playerName = document.getElementById("playerName");
const messagesList = document.getElementById("messages");
const startGameBtn = document.getElementById("startGameBtn");

const socket = io("/");
let user = null;

const setInLocalStorage = (key, value) => {
  localStorage.removeItem(key);
  const str = JSON.stringify(value);
  localStorage.setItem(key, str);
  return value;
};

const fetchGameJoin = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    startGameBtn.disabled = false;
    return;
  }
  const response = await fetch("/api/games/join", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JSON.parse(token)}`,
    },
    body: JSON.stringify({ userId: user.id }),
  });
  const res = await response.json();
  if (res.gameId && res.teamId) {
    setInLocalStorage("game", {
      gameId: res.gameId,
      teamId: res.teamId,
    });
    window.location.replace(`/game.html`);
  } else {
    alert(res?.message);
    startGameBtn.disabled = false;
  }
};

startGameBtn.onclick = async () => {
  startGameBtn.disabled = true;
  fetchGameJoin();
};

exitBtn.onclick = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("game");
  window.location.replace("/login.html");
};

const getUserFromLocalStorage = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const sendMessages = () => {
  const messageInput = document.getElementById("messageInput");
  const message = messageInput.value;
  const user = getUserFromLocalStorage();
  const userId = user.id;

  socket.emit("sendMessage", { message, userId, username: user.username });

  messageInput.value = "";
};

document.getElementById("sendButton").onclick = sendMessages;
document
  .getElementById("messageInput")
  .addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessages();
    }
  });

//listen for messages from the server
socket.on("receiveMessage", (data) => {
  const newMessage = document.createElement("li");
  newMessage.classList.add("text-gray-700");
  newMessage.innerHTML = `<strong>${data.username || data.userId}:</strong> ${
    data.message
  }`;
  messagesList.appendChild(newMessage);

  messagesList.scrollTop = messagesList.scrollHeight;
});

window.onload = () => {
  user = getUserFromLocalStorage();

  if (!user) {
    window.location.replace("/login.html");
  }
  playerName.textContent = user.username;
};
