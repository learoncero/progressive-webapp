import type { User } from "../types";
import ApiService from "./ApiService";

export default class UserService {
  static async getUsers() {
    const users = await ApiService.fetch("/users");

    return users as User[];
  }
}
