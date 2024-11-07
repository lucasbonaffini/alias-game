const chatService = require("../services/chatService");

const listAllChats = async (req, res) => {
  const chats = await chatService.listAllChats(req.query);
  return res.send(chats);
};

const getChatById = async (req, res) => {
  const chat = await chatService.getChatById(req.params.chatId);
  return res.send(chat);
};

const createChat = async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  const chat = await chatService.createChat({ ...req.body, userId: user.id });
  return res.send(chat);
};

const updateChat = async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  const chat = await chatService.updateChat(req.params.chatId, {
    ...req.body,
    userId: user.id,
  });
  return res.send(chat);
};

const deleteChat = async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  const chat = await chatService.deleteChat(req.params.chatId);
  return res.send(chat);
};


module.exports = {
  listAllChats,
  getChatById,
  createChat,
  updateChat,
  deleteChat
};
