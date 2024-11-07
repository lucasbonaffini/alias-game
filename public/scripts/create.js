const loadingSpinner = document.getElementById("loading");

const fetchGameJoin = async (token, id, name) => {
  if (!token) {
    return;
  }
  if (name === "userT2_4") {
    // Dont join the userT2_4
    return;
  }
  const response = await fetch("/api/games/join", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId: id }),
  });
  const res = await response.json();
  return res;
};

const fetchLogin = async (username, password) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  const res = await fetchGameJoin(data.token, data.id, username);
  return res;
};

const fetchRegsister = async (username, password = "123") => {
  const response = await fetch("/api/users/createUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  if (data?.message === "User registered") {
    return await fetchLogin(username, password);
  }
  throw new Error(data?.message);
};

async function createUsers() {
  loadingSpinner.classList.remove("hidden");
  const team1Users = Array.from(
    { length: 4 },
    (_, index) => `userT1_${index + 1}`,
  );

  const team2Users = Array.from(
    { length: 4 },
    (_, index) => `userT2_${index + 1}`,
  );

  const intercatedUsers = [];
  Array.from({ length: 4 }).forEach((_, index) => {
    intercatedUsers.push(team1Users[index]);
    intercatedUsers.push(team2Users[index]);
  });

  for (const user of intercatedUsers) {
    try {
      await fetchRegsister(user);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.log(error);
      window.location.href = "login.html";
    }
  }

  loadingSpinner.classList.add("hidden");
  window.location.href = "login.html";
}

document.getElementById("create-button").addEventListener("click", createUsers);
