var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getMainEmbed } from "./mainEmbed.js";
export class HelpQueue {
    constructor(client) {
        this.channelName = "kö";
        this.allowedReactions = ["🎟️", "⏭️"];
        this.queue = [];
        this.queueLength = 0;
        this.currentStudentName = " ";
        this.nextStudentName = " ";
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
        if (this.queue.some((queuedUser) => queuedUser.id === user.id)) {
            this.removeUserFromQueue(user);
        }
        else {
            this.addUserToQueue(user);
        }
        this.updateEmbed();
    }
    removeUserFromQueue(user) {
        const indexOfUser = this.queue.findIndex((queuedUser) => queuedUser.id === user.id);
        const clonedQueue = [...this.queue];
        clonedQueue.splice(indexOfUser, 1);
        this.queue = clonedQueue;
        this.queueLength = this.queue.length;
    }
    addUserToQueue(user) {
        this.queue.push(user);
        this.queueLength = this.queue.length;
        user
            .send(`Du har nu ställt dig i kö. Din plats i kön är: ${this.queueLength}. \nDu kommer att få ett meddelande när du är näst på tur.`)
            .catch((error) => console.log({ drawTicketSendError: error }));
    }
    nextStudent(user) {
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
