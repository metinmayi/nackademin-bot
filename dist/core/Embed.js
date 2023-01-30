var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Embed_instances, _Embed_queueManager, _Embed_isActiveSession, _Embed_displayActiveEmbed, _Embed_displayInactiveEmbed, _Embed_removeEmbeds;
import { getActiveEmbed } from "../embeds/activeEmbed.js";
import { getInactiveEmbed } from "../embeds/inactiveEmbed.js";
export class Embed {
    constructor(queueManager) {
        _Embed_instances.add(this);
        _Embed_queueManager.set(this, void 0);
        _Embed_isActiveSession.set(this, false);
        __classPrivateFieldSet(this, _Embed_queueManager, queueManager, "f");
        this.channel = queueManager.embedChannel;
    }
    displayEmbed() {
        return __awaiter(this, void 0, void 0, function* () {
            yield __classPrivateFieldGet(this, _Embed_instances, "m", _Embed_removeEmbeds).call(this);
            __classPrivateFieldGet(this, _Embed_isActiveSession, "f")
                ? yield __classPrivateFieldGet(this, _Embed_instances, "m", _Embed_displayActiveEmbed).call(this)
                : yield __classPrivateFieldGet(this, _Embed_instances, "m", _Embed_displayInactiveEmbed).call(this);
        });
    }
    updateActiveEmbed() {
        return __awaiter(this, void 0, void 0, function* () {
            const embed = getActiveEmbed(__classPrivateFieldGet(this, _Embed_queueManager, "f"));
            yield this.message
                .edit({ embeds: [embed] })
                .catch((error) => console.log({ updateActiveEmbed: error }));
        });
    }
    getEmbedMessage() {
        return this.message;
    }
    toggleActiveSession() {
        __classPrivateFieldSet(this, _Embed_isActiveSession, !__classPrivateFieldGet(this, _Embed_isActiveSession, "f"), "f");
    }
}
_Embed_queueManager = new WeakMap(), _Embed_isActiveSession = new WeakMap(), _Embed_instances = new WeakSet(), _Embed_displayActiveEmbed = function _Embed_displayActiveEmbed() {
    return __awaiter(this, void 0, void 0, function* () {
        const embed = getActiveEmbed(__classPrivateFieldGet(this, _Embed_queueManager, "f"));
        yield this.channel
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
    });
}, _Embed_displayInactiveEmbed = function _Embed_displayInactiveEmbed() {
    return __awaiter(this, void 0, void 0, function* () {
        const embed = getInactiveEmbed();
        yield this.channel
            .send({
            embeds: [embed],
        })
            .then((message) => {
            message.react("▶️");
            this.message = message;
        })
            .catch((error) => console.log({ displayInactiveEmbed: error }));
    });
}, _Embed_removeEmbeds = function _Embed_removeEmbeds() {
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
            console.log({ removeEmbeds: error });
        }
    });
};
