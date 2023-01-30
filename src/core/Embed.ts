import { Message, TextChannel } from "discord.js";
import { getActiveEmbed } from "../embeds/activeEmbed.js";
import { getInactiveEmbed } from "../embeds/inactiveEmbed.js";
import { QueueManager } from "./QueueManager.js";

export class Embed {
  #queueManager: QueueManager;
  message!: Message;
  channel: TextChannel;
  #isActiveSession = false;

  constructor(queueManager: QueueManager) {
    this.#queueManager = queueManager;
    this.channel = queueManager.embedChannel;
  }

  async displayEmbed() {
    await this.#removeEmbeds();

    this.#isActiveSession
      ? await this.#displayActiveEmbed()
      : await this.#displayInactiveEmbed();
  }

  async #displayActiveEmbed() {
    const embed = getActiveEmbed(this.#queueManager);
    await this.channel
      .send({
        embeds: [embed],
      })
      .then((message) => {
        message.react("🎟️");
        message.react("⏭️");
        message.react("▶️");
        this.message = message;
      })
      .catch((error) => console.log({ displayActiveEmbed: error }));
  }

  async #displayInactiveEmbed() {
    const embed = getInactiveEmbed();
    await this.channel
      .send({
        embeds: [embed],
      })
      .then((message) => {
        message.react("▶️");
        this.message = message;
      })
      .catch((error) => console.log({ displayInactiveEmbed: error }));
  }

  async updateActiveEmbed() {
    const embed = getActiveEmbed(this.#queueManager);
    await this.message
      .edit({ embeds: [embed] })
      .catch((error) => console.log({ updateActiveEmbed: error }));
  }

  async #removeEmbeds() {
    try {
      const messages = await this.channel.messages.fetch();
      for (const [key, message] of messages) {
        if (message.deletable) {
          await message.delete();
        }
      }
    } catch (error) {
      console.log({ removeEmbeds: error });
    }
  }

  getEmbedMessage() {
    return this.message;
  }

  toggleActiveSession() {
    this.#isActiveSession = !this.#isActiveSession;
  }
}
