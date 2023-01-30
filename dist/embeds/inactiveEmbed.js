import { EmbedBuilder } from "@discordjs/builders";
export function getInactiveEmbed() {
    return new EmbedBuilder()
        .setColor(0x0099ff)
        .setAuthor({ name: "Kö för handledning" })
        .setThumbnail("https://api.yhguiden.se/files/school/logo/219/nackademin_2022.jpg")
        .setDescription(`Ingen handledning pågår just nu`);
}
