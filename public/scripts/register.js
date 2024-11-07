const form = document.getElementById("registerForm");

const setInLocalStorage = (key, value) => {
  localStorage.removeItem(key);
  const str = JSON.stringify(value);
  localStorage.setItem(key, str);
  return value;
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
  return data;
};

const fetchRegsister = async (username, password) => {
  const response = await fetch("/api/users/createUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  if (data?.message === "User registered") {
    const res = await fetchLogin(username, password);
    if (res.token) {
      setInLocalStorage("token", res.token);
      setInLocalStorage("user", { id: res.id, username });
      window.location.replace("/");
    }
  } else {
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
    alert(data?.message);
  }
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  if (username === "" || password === "") {
    alert("Please enter username and password");
    return;
  }

  fetchRegsister(username, password);
});
