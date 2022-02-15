import "ts-jest";
import supertest from "supertest";
import { connectDb, disconnectDB, server } from "./server";
import app from "./express";
import User, { UserModel } from "./models/user.model";
import { Types } from "mongoose";
import ObjectId = Types.ObjectId;
import { StatusCodes } from "http-status-codes";
import {
  DialogueMessage,
  GroupMessage,
  MessageModel,
} from "./models/message.model";
import { Chat, ChatModel } from "./models/chat.model";
import Group, { GroupModel } from "./models/group.model";

const request = supertest(app);

describe("API Super Test", () => {
  beforeAll((done) => {
    connectDb().then(() => {
      done();
    });
  });
  const store: {
    user1?: UserModel | null;
    user2?: UserModel | null;
    chat?: ChatModel | null;
    message?: MessageModel | null;
    group?: GroupModel | null;
  } = {};

  const updateUsers = async () => {
    store.user1 = await User.findById(store.user1?._id);
    store.user2 = await User.findById(store.user2?._id);
  };

  const updateChat = async () => {
    store.chat = await Chat.findById(store.chat?._id);
  };

  const updateGroup = async () => {
    store.group = await Group.findById(store.group?._id);
  };
  const message = {
    contentType: "text",
    text: "Hey Marco, Wanna join Barca anytime soon ?",
  };
  const groupMessage = {
    contentType: "text",
    text: "Hello everybody, ask me anything ?",
  };

  describe("Users", () => {
    test("🔥 Creating a user", async () => {
      const user1 = {
        firstName: "Oumar Mohamed",
        lastName: "Kane",
        email: "goku@dragonball.com",
        password: "rockabye",
      };
      const user2 = {
        firstName: "Marco",
        lastName: "Reus",
        email: "reus@dortmund.de",
        password: "wc2014oh",
      };

      const response1 = await request.post("/api/users").send(user1);
      const response2 = await request.post("/api/users").send(user2);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });

    test("✅ Confirming users creation", async () => {
      store.user1 = await User.findOne({
        firstName: "Oumar Mohamed",
        lastName: "Kane",
      });
      store.user2 = await User.findOne({
        firstName: "Marco",
        lastName: "Reus",
      });

      expect(store.user1?._id instanceof ObjectId).toBe(true);
      expect(store.user2?._id instanceof ObjectId).toBe(true);

      console.log("User's creation confirmed");

      expect(store.user1).toBeTruthy();
    });
  });

  describe("Messages", () => {
    test("🔥 Sending a message from user1 to user2", async () => {
      const response = await request.post("/api/chats/").send({
        ...message,
        userId: store.user1?.id,
        receiverId: store.user2?.id,
      });

      expect(response.status).toBe(StatusCodes.OK);
    });

    test("✅ Confirming chat and message creation and their references", async () => {
      const justSentMessage = (store.message = await DialogueMessage.findOne({
        sender: store.user1?.id,
        receiver: store.user2?.id,
        contentType: message.contentType,
        text: message.text,
      }));

      store.chat = await Chat.findOne({
        _id: justSentMessage?.context,
      });

      expect(justSentMessage).toBeTruthy();
      expect(justSentMessage?.context.equals(store.chat?._id)).toBe(true);
      expect(store.chat).toBeTruthy();

      await updateUsers();

      expect(
        store.user1?.chats[0]._id.equals(store.chat?._id as ObjectId)
      ).toBe(true);

      expect(
        store.user2?.chats[0]._id.equals(store.chat?._id as ObjectId)
      ).toBe(true);
    });

    test("🔥 Send a message through an existing Chat", async () => {
      const response = await request
        .post(`/api/chats/${store.chat?.id}/messages`)
        .send({
          ...message,
          userId: store.user2?.id,
        });

      expect(response.status).toBe(StatusCodes.OK);
    });

    test("✅ Confirming message reception and accuracy", async () => {
      store.message = await DialogueMessage.findById(store.message?._id);
      store.chat = await Chat.findById(store.chat?._id);

      expect(store.message !== null && store.chat !== null).toBe(true);

      const isMessageReferred =
        store.chat?.messages.find((msg) =>
          msg._id.equals(store.message?.id)
        ) !== undefined;

      expect(isMessageReferred).toBe(true);
    });

    test("🔥 Deleting message", async () => {
      const chatId = store.message?.context.toString();
      const response = await request
        .delete(`/api/chats/${chatId}/messages/${store.message?.id}`)
        .send({
          userId: store.user1?.id,
        });
      console.log(response.body.error);

      expect(response.status).toBe(StatusCodes.OK);
    });

    test("✅ Confirming message deletion", async () => {
      const messageId = store.message?._id;
      store.message = await DialogueMessage.findById(store.message?._id);

      expect(store.message).toBeNull();

      await updateChat();

      const isReferenceDeleted =
        store.chat?.messages.find((msg) => msg._id.equals(messageId)) ===
        undefined;

      expect(isReferenceDeleted).toBe(true);
    });
  });
  describe("Chats", () => {
    test("🔥 Deleting chat", async () => {
      const response = await request
        .delete(`/api/chats/${store.chat?.id}`)
        .send({
          userId: store.user1?.id,
        });

      expect(response.status).toBe(200);
    });

    test("✅ Confirming chat and chat reference deletion", async () => {
      const chat = await Chat.findById(store.chat?._id);
      expect(chat).toBeNull();
      await updateUsers();

      const user1HasChatRef =
        store.user1?.chats.find((_chat) =>
          _chat._id.equals(store.chat?._id)
        ) !== undefined;

      const user2HasChatRef =
        store.user2?.chats.find((_chat) =>
          _chat._id.equals(store.chat?._id)
        ) !== undefined;

      expect(user1HasChatRef).toBe(false);
      expect(user2HasChatRef).toBe(false);
    });
  });
  describe("Groups", () => {
    test("🔥 Creating a group", async () => {
      const response = await request.post("/api/groups").send({
        name: "LPGI 3",
        userId: store.user1?.id,
      });

      expect(response.status).toBe(StatusCodes.OK);
    });
    test("✅ Confirming group creation", async () => {
      store.group = await Group.findOne({
        name: "LPGI 3",
        createdBy: store.user1?._id,
      });

      expect(store.group !== null).toBe(true);
    });

    test("🔥 Sending a message to a group", async () => {
      const response = await request
        .post(`/api/groups/${store.group?.id}/messages`)
        .send({
          ...groupMessage,
          userId: store.user1?.id,
        });

      expect(response.status).toBe(200);
    });

    test("✅ Confirming group message reception", async () => {
      store.message = await GroupMessage.findOne({
        text: groupMessage.text,
      });

      store.group = await Group.findById(store.group?._id);

      expect(message !== null).toBe(true);
      const isMessageReferred =
        store.group?.messages.find((msg) => msg.equals(store.message?._id)) !==
        undefined;

      expect(isMessageReferred).toBe(true);
    });

    test("🔥 Deleting group message", async () => {
      const response = await request
        .delete(`/api/groups/${store.group?.id}/messages/${store.message?.id}`)
        .send({
          userId: store.user1?.id,
        });
      console.log(response.body);

      expect(response.status).toBe(200);
    });

    test("✅ Confirming group message deletion", async () => {
      const messageId = store.message?._id;
      store.message = await GroupMessage.findById(messageId);

      expect(store.message).toBeNull();

      await updateGroup();

      const isReferenceDeleted =
        store.group?.messages.find((msg) => msg._id.equals(messageId)) ===
        undefined;

      expect(isReferenceDeleted).toBe(true);
    });

    test("🔥 Adding a group member", async () => {
      const response = await request
        .post(`/api/groups/${store.group?.id}/members`)
        .send({
          targetUsers: [store.user2?.id],
          userId: store.user1?.id,
        });
      console.log(response.body);
      expect(response.status).toBe(200);
    });

    test("✅ Confirming member addition", async () => {
      await updateGroup();

      const isMemberAdded =
        store.group?.members.find((memberId) =>
          memberId.equals(store.user2?._id)
        ) !== undefined;

      expect(isMemberAdded).toBe(true);
    });

    test("🔥 Removing a member", async () => {
      const response = await request
        .delete(`/api/groups/${store.group?.id}/members`)
        .send({
          userId: store.user1?.id,
          targetUsers: [store.user2?.id],
        });
      console.log(response.body);

      expect(response.status).toBe(StatusCodes.OK);
    });

    test("✅ Confirming member deletion", async () => {
      await updateGroup();

      const isMemberDeleted =
        store.group?.members.find((memberId) =>
          memberId.equals(store.user2?._id)
        ) === undefined;

      expect(isMemberDeleted).toBe(true);
    });

    test("🔥 Adding administrator", async () => {
      const response = await request
        .post(`/api/groups/${store.group?._id}/admins`)
        .send({
          userId: store.user1?.id,
          targetUserId: store.user2?.id,
        });
      console.log(response.body);

      expect(response.status).toBe(200);
    });

    test("✅ Confirming administrator addition", async () => {
      await updateGroup();

      const isAdminAdded =
        store.group?.administrators.find((admin) =>
          admin._id.equals(store.user2?._id)
        ) !== undefined;

      expect(isAdminAdded).toBe(true);
    });

    test("🔥 Removing administrator", async () => {
      const response = await request
        .delete(`/api/groups/${store.group?._id}/admins`)
        .send({
          userId: store.user1?.id,
          targetUserId: store.user2?.id,
        });
      console.log(response.body);

      expect(response.status).toBe(200);
    });

    test("✅ Confirming administrator removal", async () => {
      await updateGroup();

      const isAdminRemoved =
        store.group?.administrators.find((admin) =>
          admin._id.equals(store.user2?._id)
        ) === undefined;

      expect(isAdminRemoved).toBe(true);
    });
  });

  afterAll(() => {
    disconnectDB();
    server.close();
  });
});
