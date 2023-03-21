import {
  Client,
  Message,
  MessageReaction,
  TextChannel,
  User,
} from "discord.js";
import { Embed } from "./Embed.js";
import { Queue } from "./Queue.js";

export class QueueManager {
  client: Client;
  embedChannel!: TextChannel;
  channelName = "kö";
  #channelId = "1087648531751383073";
  queue: Queue = new Queue();
  embed!: Embed;
  #teacherId = "1067495037866352761";
  isActiveSession = false;

  constructor(client: Client) {
    this.client = client;
  }

  async initiate() {
    try {
      this.setChannel();
      this.embed = new Embed(this);
      await this.embed.displayEmbed();
      await this.#addReactionListeners();
    } catch (error) {
      console.log({ initiate: error });
    }
  }

  setChannel() {
    const channel = this.client.channels.cache.find(
      (channel) => (channel as TextChannel).id === this.#channelId
    );
    this.embedChannel = channel as TextChannel;
  }

  async #addReactionListeners() {
    const message = this.embed.getEmbedMessage();
    const filter = (_reaction: MessageReaction, user: User) => !user.bot;

    const reactionCollector = message.createReactionCollector({
      filter,
    });
    reactionCollector.options.dispose = true;

    reactionCollector.on("collect", async (reaction, user) => {
      reaction.users.remove(user);
      if (reaction.emoji.name === "🎟️") {
        this.drawTicket(user);
      }

      if (reaction.emoji.name === "⏭️" && user.id === this.#teacherId) {
        this.nextStudent();
      }

      if (reaction.emoji.name === "▶️" && user.id === this.#teacherId) {
        this.embed.toggleActiveSession();
        this.queue.reset();
        await this.embed.displayEmbed();
        await this.#addReactionListeners();
        return;
      }
    });
  }

  async drawTicket(user: User) {
    const isUserInQueue = this.queue.isUserInQueue(user);
    if (isUserInQueue) {
      this.nextStudent();
      return;
    }

    this.queue.addUser(user);
    await this.embed.updateActiveEmbed();
  }

  nextStudent() {
    this.queue.next();

    if (this.queue.length > 0) {
      this.notifyNextStudent();
    }

    if (this.queue.length > 1) {
      this.notifyUpcomingStudent();
    }

    this.embed.updateActiveEmbed();
  }

  notifyNextStudent() {
    this.queue.queue[0]
      .send("Det är nu din tur, hoppa i röstkanalen så hjälper jag dig.")
      .catch((error) => console.log({ notifyAndUpdateCurrentStudent: error }));
  }

  notifyUpcomingStudent() {
    this.queue.queue[1]
      .send("Du är näst på tur. Se till att vara redo med nödvändigt material.")
      .catch((error) => console.log({ notifyAndUpdateUpcomingStudent: error }));
  }
}
