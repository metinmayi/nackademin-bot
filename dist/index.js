import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";
import { QueueManager } from "./core/QueueManager.js";
dotenv.config();
const token = process.env.BOT_TOKEN || "";
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions],
    partials: [Partials.User, Partials.GuildMember, Partials.Reaction],
});
client.login(token);
client.once(Events.ClientReady, (c) => {
    new QueueManager(client).initiate();
});
