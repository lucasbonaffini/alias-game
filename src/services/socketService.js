const emit = (eventName, data) => {
  const socket = require("../index");
  const io = socket.getIO();
  io.emit(eventName, data);
};

module.exports = { emit };
