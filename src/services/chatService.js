const ChatModel = require("../models/chatModel");
//new
const GameService = require("./gameService");

const listAllChats = async (query = {}) => {
  const filters = {
    ...(query.gameId && { gameId: query.gameId }),
    ...(query.userId && { userId: query.userId }),
    ...(query.teamId && { teamId: query.teamId }),
    ...(query.message && { message: { $regex: query.message, $options: "i" } }),
  };
  const chats = await ChatModel.find(filters)
    .populate({
      path: "userId",
      select: "username",
    })
    .select("-__v ")
    .sort({ createdAt: query.order ? 1 : -1 });

  return chats;
};

const getChatById = async (chatId) => {
  const chat = await ChatModel.findById(chatId);
  return chat;
};

const updateChat = async (chatId, data = {}) => {
  const chat = await ChatModel.findById(chatId);
  if (!chat) {
    return null;
  }
  if (chat.userId.toString() !== data.userId) {
    return null;
  }

  chat.gameId = data.gameId || chat.gameId;
  chat.teamId = data.teamId || chat.teamId;
  chat.message = data.message || chat.message;
  chat.messageType = data.messageType || chat.messageType;
  await chat.save();

  return chat;
};

const deleteChat = async (chatId) => {
  const chat = await ChatModel.findByIdAndDelete(chatId);
  return chat;
};

const createChat = async (data = {}) => {
  
  let newChat = {
    gameId: data.gameId,
    teamId: data.teamId,
    userId: data.userId,
    message: data.message || "",
    messageType: data.messageType || "guess",
  };
  
  newChat.message = await handleDescriptionMessage(data);
  const chat = await ChatModel.create(newChat);
  const points = await handleGuessMessage(data);
  const chatObj = { ...chat._doc, points };
  return chatObj;
};


const handleGuessMessage = async (chatMessage) => {
  const { messageType } = chatMessage;

  if (messageType === "guess") {
    return await GameService.processGuess(chatMessage);
  }
  return 0;
};

const handleDescriptionMessage = async (chatMessage) => {
  const { messageType } = chatMessage;

  if (messageType === "description") {
    return await GameService.processClue(chatMessage);
  }

  return chatMessage.message;
};

module.exports = {
  listAllChats,
  getChatById,
  createChat,
  updateChat,
  deleteChat
};
