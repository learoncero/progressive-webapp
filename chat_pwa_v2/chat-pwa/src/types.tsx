export type Conversation = {
  id: number;
  participants: string[];
};

export type Message = {
  from: string;
  message: string;
};

export type User = {
  username: string;
  fullname: string;
  image: string;
};
