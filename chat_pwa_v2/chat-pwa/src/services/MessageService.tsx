import type { Message } from "../types";
import ApiService from "./ApiService";

const MESSAGE_BASE_URL = "/conversations";

export default class MessageService {
  static async getMessagesByConversationId(conversationId: number) {
    const messageUrl = `${MESSAGE_BASE_URL}/${conversationId}/messages`;
    const messages = await ApiService.fetch(messageUrl);

    return messages as Message[];
  }

  static async sendMessage(
    conversationId: string,
    from: string,
    message: string
  ) {
    await ApiService.post(`${MESSAGE_BASE_URL}/${conversationId}/messages`, {
      from,
      message,
    });
  }
}
