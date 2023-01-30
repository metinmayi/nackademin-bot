import { Client, Events, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";
import { HelpQueue } from "./HelpQueue.js";
dotenv.config();
const token = process.env.BOT_TOKEN || "";
import express from "express";
const server = express();

server.listen(3079, () => {
  console.log("listening");
});

server.get("/", (req, res) => {
  res.sendStatus(200);
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions],
  partials: [Partials.User, Partials.GuildMember, Partials.Reaction],
});

client.login(token);

client.once(Events.ClientReady, (c) => {
  new HelpQueue(client).initiate();
});
