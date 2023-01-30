import { User } from "discord.js";

export class Queue {
  queue: User[] = [];
  length = 0;

  constructor() {}

  addUser(user: User) {
    this.queue.push(user);
    this.length = this.queue.length;
    user
      .send(
        `Du har lagts till i kön på plats: ${this.length}.\nDu kommer få ett meddelande när du är näst på tur.`
      )
      .catch((error) => console.log({ addUser: error }));
  }

  removeUser(user: User) {
    const indexOfUser = this.queue.findIndex(({ id }) => id === user.id);
    this.queue.splice(indexOfUser, 1);
    this.length = this.queue.length;
  }

  next() {
    this.queue.shift();
  }
}
