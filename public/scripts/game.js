const exitBtn = document.getElementById("exitBtn");
const playerName = document.getElementById("playerName");
const messagesList = document.getElementById("messages");
const guessInput = document.getElementById("guessInput");
const status = document.getElementById("status");
const round = document.getElementById("round");
const timerElement = document.getElementById("timer");

const socket = io("/");
let user = null;
let game = null;
let gameDetails = null;
let isUserDescribe = false;
const TIMER_IN_SECONDS = 60;

document.getElementById("backBtn").onclick = () => {
  window.location.href = "/";
};

guessInput.addEventListener("input", function () {
  this.value = this.value.replace(/\s/g, "");
});

const setInLocalStorage = (key, value) => {
  localStorage.removeItem(key);
  const str = JSON.stringify(value);
  localStorage.setItem(key, str);
  return value;
};

const clearAll = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("game");
  localStorage.removeItem("token");
  localStorage.removeItem("gameDetails");
  localStorage.clear();
};
exitBtn.onclick = () => {
  clearAll();
  window.location.replace("/login.html");
};

const getUserFromLocalStorage = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const getGameFromLocalStorage = () => {
  const game = localStorage.getItem("game");
  return game ? JSON.parse(game) : null;
};

const sendMessages = (messageType = "guess", id = "messageInput") => {
  const messageInput = document.getElementById(id);
  const message = messageInput.value;
  const user = getUserFromLocalStorage();
  const game = getGameFromLocalStorage();
  const userId = user.id;

  socket.emit("sendMessage", {
    message,
    userId,
    username: user.username,
    gameId: game.gameId,
    teamId: game.teamId,
    messageType,
  });

  messageInput.value = "";
};

document.getElementById("sendButton").onclick = () =>
  sendMessages("guess", "guessInput");
document
  .getElementById("messageInput")
  .addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      isUserDescribe ? sendMessages("description") : sendMessages("chat");
    }
  });

const createNewLine = (data) => {
  const newMessage = document.createElement("li");

  newMessage.classList.add(
    "text-gray-700",
    "p-2",
    "rounded-md",
    "mb-2",
    "flex",
    "justify-between",
  );

  if (data.messageType === "guess") {
    newMessage.classList.add(
      "bg-green-300",
      "bg-opacity-50",
      "border",
      "border-green-300",
    );
  } else if (data.messageType === "description") {
    newMessage.classList.add(
      "bg-blue-300",
      "bg-opacity-50",
      "border",
      "border-blue-300",
      "mx-auto",
      "w-full",
    );
  } else {
    newMessage.classList.add("bg-gray-100", "bg-opacity-50");
  }

  newMessage.innerHTML = `<p><strong>${
    data.username || data.userId
  }:</strong> ${data.message}</p>${
    data.points ? `<em class="ml-auto">+${data.points} points</em>` : ""
  }`;

  messagesList.appendChild(newMessage);

  messagesList.scrollTop = messagesList.scrollHeight;
};

const toggleTurn = async () => {
  resetTimer();
  await fetchChangeTurn();
};

const showTheWord = (theWord) => {
  const wordToGuess = document.getElementById("wordToGuess");
  if (isUserDescribe) {
    return (wordToGuess.innerHTML = `Describe the word: ${theWord}`);
  }
  wordToGuess.innerHTML = "";
};

socket.on("receiveMessage", (data) => {
  if (data.gameId === game.gameId) {
    createNewLine(data);
    if (data.points && data.userId === user.id) {
      toggleTurn();
    }
  }
});

socket.on("startGame", () => {
  resetTimer();
  startTimer();
  setGameDetails().then((r) => {
    showTheWord(r?.currentWord);
  });
});

socket.on("hitTheWord", (data) => {
  if (data.gameId === game.gameId) {
    resetTimer();
    toggleTurn();
  }
});

socket.on("endGame", (data) => {
  if (data.gameId === game.gameId) {
    const winnerTeam = data?.winnerTeam || {};
    drawEndGame(winnerTeam.teamName, data?.isTie);
    setGameDetails().then(() => {
      resetTimer();
      setNonPlaying();
    });
  }
});

socket.on("turnChanged", async (data) => {
  if (data.gameId === game.gameId) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await setGameDetails();
    resetTimer();
    startTimer();
  }
});

// socket.on("changeTurn", (data) => {
//   if (isUserDescribe && data.gameId === game.gameId) toggleTurn();
// });

const drawEndGame = (message, isTie = false) => {
  const finishedGameDiv = document.getElementById("finishedGame");
  finishedGameDiv.innerHTML = "";

  const messageDiv = document.createElement("div");
  messageDiv.classList.add(
    "text-white",
    "font-bold",
    "p-4",
    "rounded-md",
    "mt-2",
    "text-center",
  );

  if (isTie) {
    messageDiv.classList.add("bg-blue-500");
    messageDiv.textContent = "It's a draw! Well played!";
  } else {
    messageDiv.classList.add("bg-green-500");
    messageDiv.textContent = `Congratulations ${message}, you won!`;
  }

  finishedGameDiv.appendChild(messageDiv);
};

const fetchGameMessages = async (gameId) => {
  const response = await fetch(`/api/chats?gameId=${gameId}&order=1`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
    },
  });
  const data = await response.json();
  return data;
};

const loadMessages = async () => {
  if (!user || !game) {
    return;
  }
  const data = await fetchGameMessages(game.gameId, game.teamId);

  (data || []).forEach((chat) => {
    createNewLine({
      ...chat,
      username: chat?.userId.username,
      userId: chat?.userId._id,
    });
  });

  document.getElementById("messages").scrollTop = messagesList.scrollHeight;
};

const fetchGameDetails = async () => {
  if (!game || !game.gameId) return;
  const response = await fetch(`/api/games/${game.gameId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
    },
  });
  const data = await response.json();
  if (data) {
    const gameDetails = {
      teamIdTurn: data?.currentTurnTeam,
      userIdDescriber: data.currentDescriber,
      status: data?.status,
      currentRound: data?.currentRound,
    };
    setInLocalStorage("gameDetails", gameDetails);
    return { ...data, ...gameDetails };
  }
  return data;
};

const fetchChangeTurn = async () => {
  const response = await fetch(`/api/games/${game.gameId}/endTurn`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
    },
  });
  const data = await response.json();
  return data;
};

const setDescriberInputs = () => {
  isUserDescribe = true;
  document.getElementById("guessContainer").remove();
  document.getElementById("messageInput").placeholder = "Describe the word";
};

const setNonPlaying = () => {
  isUserDescribe = false;
  document.getElementById("messageContainer")?.remove();
};

const setPlaying = () => {
  if (!document.getElementById("messageContainer")) {
    const messageContainer = document.createElement("div");
    messageContainer.id = "messageContainer";
    messageContainer.classList.add("flex", "w-full", "space-x-2");

    const messageInput = document.createElement("input");
    messageInput.type = "text";
    messageInput.id = "messageInput";
    messageInput.placeholder = "Chat with your team";
    messageInput.classList.add(
      "w-full",
      "px-4",
      "py-2",
      "border",
      "border-gray-300",
      "rounded-md",
      "focus:outline-none",
      "focus:ring",
      "focus:ring-blue-500",
    );

    const guessContainer = document.createElement("div");
    guessContainer.id = "guessContainer";
    guessContainer.classList.add("w-3/5", "flex", "space-x-2");

    const guessInput = document.createElement("input");
    guessInput.type = "text";
    guessInput.id = "guessInput";
    guessInput.placeholder = "Try guess";
    guessInput.classList.add(
      "w-full",
      "px-4",
      "py-2",
      "border",
      "border-gray-300",
      "rounded-md",
      "focus:outline-none",
      "focus:ring",
      "focus:ring-blue-500",
    );
    guessInput.maxLength = 12;

    const sendButton = document.createElement("button");
    sendButton.id = "sendButton";
    sendButton.classList.add(
      "bg-green-500",
      "text-white",
      "px-4",
      "py-2",
      "rounded-md",
      "hover:bg-green-600",
      "transition",
      "duration-200",
    );
    sendButton.textContent = "Guess";

    guessContainer.appendChild(guessInput);
    guessContainer.appendChild(sendButton);

    messageContainer.appendChild(messageInput);
    messageContainer.appendChild(guessContainer);

    const messagesList = document.getElementById("messages");
    messagesList.parentNode.insertBefore(
      messageContainer,
      messagesList.nextSibling,
    );

    sendButton.onclick = () => sendMessages("guess", "guessInput");
    messageInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        isUserDescribe ? sendMessages("description") : sendMessages("chat");
      }
    });

    guessInput.addEventListener("input", function () {
      this.value = this.value.replace(/\s/g, "");
    });
  }
};

const setRounds = (roundNumber) => {
  round.textContent = `Round ${roundNumber}`;
};

const setStatus = (statusInfo) => {
  status.textContent = `Status: ${statusInfo}`;
};

const setGameDetails = async () => {
  setNonPlaying();
  const data = await fetchGameDetails();
  console.log(data, "<<< game details");
  gameDetails = data;

  if (!gameDetails) {
    return;
  }

  if (data.currentRound || data.currentRound === 0) {
    setRounds(data.currentRound);
  }

  if (data.status) {
    setStatus(data.status);
  }

  if (user.id === data.userIdDescriber) {
    setPlaying();
    setDescriberInputs();
    showTheWord(data?.currentWord);
    return data;
  }
  isUserDescribe = false;
  showTheWord("");
  if (game.teamId !== data.teamIdTurn) {
    setNonPlaying();
    return data;
  }
  setPlaying();
  return data;
};

let timerInterval;
let timeRemaining = TIMER_IN_SECONDS;
let isPaused = true;

const updateTimerDisplay = () => {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  timerElement.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const startTimer = () => {
  if (isPaused) {
    isPaused = false;
    timerInterval = setInterval(() => {
      if (timeRemaining > 0) {
        timeRemaining--;
        updateTimerDisplay();
      } else {
        clearInterval(timerInterval);
        if (isUserDescribe) {
          // socket.emit("goChangeTurn", { gameId: game.gameId });
          toggleTurn();
        }
      }
    }, 1000);
  }
};

const resetTimer = () => {
  clearInterval(timerInterval);
  timeRemaining = TIMER_IN_SECONDS;
  isPaused = true;
  updateTimerDisplay();
};

window.onload = () => {
  user = getUserFromLocalStorage();
  game = getGameFromLocalStorage();
  if (!user || !game) {
    clearAll();
    window.location.replace("/login.html");
    return;
  }
  updateTimerDisplay();
  playerName.textContent = user.username;
  loadMessages();
  setGameDetails().then((r) => {
    if (r.status === "in progress") {
      resetTimer();
      startTimer();
      if (isUserDescribe) showTheWord(r?.currentWord);
    }
  });
};
