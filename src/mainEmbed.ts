import { EmbedBuilder } from "@discordjs/builders";
import { HelpQueue } from "./HelpQueue.js";

export function getMainEmbed(helpQueue: HelpQueue) {
  const students = helpQueue.queue;
  const studentFields = students.map((student) => {
    return {
      name: " ",
      value: student.username,
    };
  });

  return new EmbedBuilder()
    .setColor(0x0099ff)
    .setAuthor({ name: "Kö för handledning" })
    .setThumbnail(
      "https://api.yhguiden.se/files/school/logo/219/nackademin_2022.jpg"
    )
    .setDescription(
      `Reagera med :tickets: för att ta en kölapp.\nReagera en gång till för att gå ur kön.`
    )
    .addFields([
      {
        name: "Kö:",
        value: " ",
      },
      ...studentFields,
    ]);
}
