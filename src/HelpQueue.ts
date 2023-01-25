import {
  Client,
  Message,
  MessageReaction,
  TextChannel,
  User,
} from "discord.js";
import { getMainEmbed } from "./mainEmbed.js";

export class HelpQueue {
  client: Client;
  channel!: TextChannel;
  channelName = "kö";
  message!: Message;
  allowedReactions = ["🎟️", "⏭️"];
  queue: User[] = [];
  queueLength = 0;
  currentStudentName = " ";
  nextStudentName = " ";
  teacherName = "Maestro";

  constructor(client: Client) {
    this.client = client;
  }

  async initiate() {
    try {
      this.setChannel();
      await this.clearChannel();
      await this.displayEmbedAndSetMessage();
      this.addReactionListeners();
    } catch (error) {
      console.log({ initiate: error });
    }
  }

  setChannel() {
    const channel = this.client.channels.cache.find(
      (channel) => (channel as TextChannel).name === this.channelName
    );
    this.channel = channel as TextChannel;
  }

  async clearChannel() {
    try {
      const messages = await this.channel.messages.fetch();
      for (const [key, message] of messages) {
        if (message.deletable) {
          await message.delete();
        }
      }
    } catch (error) {
      console.log({ clearChannel: error });
    }
  }

  async displayEmbedAndSetMessage() {
    const mainEmbed = getMainEmbed(this);
    const embedMessage = await this.channel.send({
      embeds: [mainEmbed],
    });
    embedMessage.react("🎟️");
    embedMessage.react("⏭️");

    this.message = embedMessage;
  }

  addReactionListeners() {
    const filter = (_reaction: MessageReaction, user: User) => !user.bot;

    const reactionCollector = this.message.createReactionCollector({ filter });
    reactionCollector.options.dispose = true;

    reactionCollector.on("collect", (reaction, user) => {
      reaction.users.remove(user);
      if (reaction.emoji.name === "🎟️") {
        this.drawTicket(user);
        return;
      }

      if (reaction.emoji.name === "⏭️") {
        this.nextStudent(user);
      }
    });
  }

  drawTicket(user: User) {
    if (this.queue.some((queuedUser) => queuedUser.id === user.id)) {
      this.removeUserFromQueue(user);
    } else {
      this.addUserToQueue(user);
    }

    this.updateEmbed();
  }

  removeUserFromQueue(user: User) {
    const indexOfUser = this.queue.findIndex(
      (queuedUser) => queuedUser.id === user.id
    );
    const clonedQueue = [...this.queue];
    clonedQueue.splice(indexOfUser, 1);

    this.queue = clonedQueue;
    this.queueLength = this.queue.length;
  }

  addUserToQueue(user: User) {
    this.queue.push(user);
    this.queueLength = this.queue.length;

    user
      .send(
        `Du har nu ställt dig i kö. Din plats i kön är: ${this.queueLength}. \nDu kommer att få ett meddelande när du är näst på tur.`
      )
      .catch((error) => console.log({ drawTicketSendError: error }));
  }

  nextStudent(user: User) {
    if (user.username !== this.teacherName) {
      return;
    }

    this.queue.shift();

    if (!this.queue.length) {
      this.resetEmbed();
    }

    if (this.queue.length > 0) {
      this.notifyNextStudent();
    }

    if (this.queue.length > 1) {
      this.notifyUpcomingStudent();
    }

    this.updateEmbed();
  }

  notifyNextStudent() {
    this.queue[0]
      .send("Det är nu din tur, hoppa i röstkanalen så hjälper jag dig.")
      .catch((error) => console.log({ notifyAndUpdateCurrentStudent: error }));
  }

  notifyUpcomingStudent() {
    this.queue[1]
      .send("Du är näst på tur. Se till att vara redo med nödvändigt material.")
      .catch((error) => console.log({ notifyAndUpdateUpcomingStudent: error }));
  }

  resetEmbed() {
    this.queueLength = 0;
  }

  updateEmbed() {
    this.message
      .edit({ embeds: [getMainEmbed(this)] })
      .catch((error) => console.log({ updateEmbed: error }));
  }
}
