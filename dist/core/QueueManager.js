var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _QueueManager_instances, _QueueManager_channelId, _QueueManager_teacherId, _QueueManager_addReactionListeners;
import { Embed } from "./Embed.js";
import { Queue } from "./Queue.js";
export class QueueManager {
    constructor(client) {
        _QueueManager_instances.add(this);
        this.channelName = "kö";
        _QueueManager_channelId.set(this, "1067500079394586734");
        this.queue = new Queue();
        _QueueManager_teacherId.set(this, "222013341294526467");
        this.isActiveSession = false;
        this.client = client;
    }
    initiate() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.setChannel();
                this.embed = new Embed(this);
                yield this.embed.displayEmbed();
                yield __classPrivateFieldGet(this, _QueueManager_instances, "m", _QueueManager_addReactionListeners).call(this);
            }
            catch (error) {
                console.log({ initiate: error });
            }
        });
    }
    setChannel() {
        const channel = this.client.channels.cache.find((channel) => channel.id === __classPrivateFieldGet(this, _QueueManager_channelId, "f"));
        this.embedChannel = channel;
    }
    drawTicket(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const isUserInQueue = this.queue.isUserInQueue(user);
            if (isUserInQueue) {
                this.nextStudent();
                return;
            }
            this.queue.addUser(user);
            yield this.embed.updateActiveEmbed();
        });
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
_QueueManager_channelId = new WeakMap(), _QueueManager_teacherId = new WeakMap(), _QueueManager_instances = new WeakSet(), _QueueManager_addReactionListeners = function _QueueManager_addReactionListeners() {
    return __awaiter(this, void 0, void 0, function* () {
        const message = this.embed.getEmbedMessage();
        const filter = (_reaction, user) => !user.bot;
        const reactionCollector = message.createReactionCollector({
            filter,
        });
        reactionCollector.options.dispose = true;
        reactionCollector.on("collect", (reaction, user) => __awaiter(this, void 0, void 0, function* () {
            reaction.users.remove(user);
            if (reaction.emoji.name === "🎟️") {
                this.drawTicket(user);
            }
            if (reaction.emoji.name === "⏭️" && user.id === __classPrivateFieldGet(this, _QueueManager_teacherId, "f")) {
                this.nextStudent();
            }
            if (reaction.emoji.name === "▶️" && user.id === __classPrivateFieldGet(this, _QueueManager_teacherId, "f")) {
                this.embed.toggleActiveSession();
                this.queue.reset();
                yield this.embed.displayEmbed();
                yield __classPrivateFieldGet(this, _QueueManager_instances, "m", _QueueManager_addReactionListeners).call(this);
                return;
            }
        }));
    });
};
