const app = require("../../app");
const supertest = require("supertest");
const { signToken } = require("../../utils/jwt");

jest.mock("../../models/chatModel");
jest.mock("../../models/userModel");
jest.mock("../../services/gameService");

const ChatModel = require("../../models/chatModel");
const User = require("../../models/userModel");
const GameService = require("../../services/gameService");

const BASE_PATH = "/api/chats";

const token = signToken(
  { id: "66fedbcd52619e12028fb7b7", username: "Megas" },
  "yourSecret",
  "1h",
);

describe("Chat messages", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.findById.mockResolvedValue({
      _id: "66fedbcd52619e12028fb7b7",
      username: "Megas",
      password: "123",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  });

  it("GET - list all chats", async () => {
    const mockChats = [
      {
        _id: "66ff16b73758f8f5b37b2123",
        gameId: "66fedf7e772c64b73cd38b1b",
        teamId: "66fedf7e772c64b73cd38b1b",
        userId: { _id: "66fedbcd52619e12028fb7b7", username: "Megas" },
        message: "Lorem ipsum XXX",
        messageType: "guess",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    ChatModel.find.mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockChats),
    }));

    const response = await supertest(app).get(BASE_PATH);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toEqual(mockChats);
    expect(response.status).toBe(200);
  });

  it("GET - Chat by id", async () => {
    const mockChat = {
      _id: "66fedf7e772c64b73cd38b1b",
      gameId: "66fede6b7664cf99c3e16ab8",
      teamId: "66fede6b7664cf99c3e16ab4",
      userId: "66fedbcd52619e12028fb7b7",
      message: "Lorem ipsum",
      messageType: "guess",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
    };

    ChatModel.findById.mockResolvedValue(mockChat);

    const chatId = "66fedf7e772c64b73cd38b1b";
    const response = await supertest(app).get(BASE_PATH + "/" + chatId);

    expect(response.body).toEqual(mockChat);
    expect(response.status).toBe(200);
  });

  it("POST - Create Chat", async () => {
    const mockChat = {
      gameId: "66fedf7e772c64b73cd38b1b",
      teamId: "66fedf7e772c64b73cd38b1b",
      userId: "66fedbcd52619e12028fb7b7",
      message: "Lorem ipsum XXX",
      messageType: "guess",
      _id: "66ff16b73758f8f5b37b2123",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
      points: null,
    };

    GameService.processGuess.mockResolvedValue(null);
    ChatModel.create.mockResolvedValue({ _doc: mockChat });
    const response = await supertest(app)
      .post(BASE_PATH)
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        gameId: "66fedf7e772c64b73cd38b1b",
        teamId: "66fedf7e772c64b73cd38b1b",
        message: "Lorem ipsum XXX",
        messageType: "guess",
      });

    expect(response.body).toEqual(mockChat);
    expect(response.status).toBe(200);
  });

  it("PUT - Update Chat", async () => {
    const mockChat = {
      _id: "66ff16b73758f8f5b37b2123",
      gameId: "66fedf7e772c64b73cd38b1b",
      teamId: "66fedf7e772c64b73cd38b1b",
      userId: "66fedbcd52619e12028fb7b7",
      message: "Lorem ipsum XYZ",
      messageType: "guess",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
    };

    ChatModel.findById.mockResolvedValue({
      ...mockChat,
      save: jest.fn().mockResolvedValue(mockChat),
    });

    const chatId = "66ff16b73758f8f5b37b2123";
    const response = await supertest(app)
      .put(BASE_PATH + "/" + chatId)
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        gameId: "66fedf7e772c64b73cd38b1b",
        teamId: "66fedf7e772c64b73cd38b1b",
        message: "Lorem ipsum XYZ",
        messageType: "guess",
      });

    expect(response.body).toEqual(mockChat);
    expect(response.status).toBe(200);
  });

  it("DELETE - Delete Chat", async () => {
    const mockChat = {
      _id: "66fedf7e772c64b73cd38b1b",
      gameId: "66fede6b7664cf99c3e16ab8",
      teamId: "66fede6b7664cf99c3e16ab4",
      userId: "66fedbcd52619e12028fb7b7",
      message: "Lorem ipsum",
      messageType: "guess",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
    };

    ChatModel.findByIdAndDelete.mockResolvedValue(mockChat);

    const chatId = "66fedf7e772c64b73cd38b1b";
    const response = await supertest(app)
      .delete(BASE_PATH + "/" + chatId)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(200);
  });
});
