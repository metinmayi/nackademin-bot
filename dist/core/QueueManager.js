var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getMainEmbed } from "../embeds/mainEmbed.js";
import { Queue } from "./Queue.js";
export class QueueManager {
    constructor(client) {
        this.channelName = "kö";
        this.allowedReactions = ["🎟️", "⏭️"];
        this.queue = new Queue();
        this.teacherName = "Maestro";
        this.client = client;
    }
    initiate() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.setChannel();
                yield this.clearChannel();
                yield this.displayEmbedAndSetMessage();
                this.addReactionListeners();
            }
            catch (error) {
                console.log({ initiate: error });
            }
        });
    }
    setChannel() {
        const channel = this.client.channels.cache.find((channel) => channel.name === this.channelName);
        this.channel = channel;
    }
    clearChannel() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const messages = yield this.channel.messages.fetch();
                for (const [key, message] of messages) {
                    if (message.deletable) {
                        yield message.delete();
                    }
                }
            }
            catch (error) {
                console.log({ clearChannel: error });
            }
        });
    }
    displayEmbedAndSetMessage() {
        return __awaiter(this, void 0, void 0, function* () {
            const mainEmbed = getMainEmbed(this);
            const embedMessage = yield this.channel.send({
                embeds: [mainEmbed],
            });
            embedMessage.react("🎟️");
            embedMessage.react("⏭️");
            this.message = embedMessage;
        });
    }
    addReactionListeners() {
        const filter = (_reaction, user) => !user.bot;
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
    drawTicket(user) {
        if (this.queue.queue.some((queuedUser) => queuedUser.id === user.id)) {
            this.queue.removeUser(user);
        }
        else {
            this.queue.addUser(user);
        }
        this.updateEmbed();
    }
    nextStudent(user) {
        if (user.username !== this.teacherName) {
            return;
        }
        this.queue.next();
        if (this.queue.length > 0) {
            this.notifyNextStudent();
        }
        if (this.queue.length > 1) {
            this.notifyUpcomingStudent();
        }
        this.updateEmbed();
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
    updateEmbed() {
        this.message
            .edit({ embeds: [getMainEmbed(this)] })
            .catch((error) => console.log({ updateEmbed: error }));
    }
}
