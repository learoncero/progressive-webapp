import type { Conversation } from "../types";
import ApiService from "./ApiService";

export default class ConversationService {
  static async getConversationsByUser(user: string) {
    const conversations = await ApiService.fetch(`/conversations?user=${user}`);
    return conversations as Conversation[];
  }
}
