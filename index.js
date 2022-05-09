const { Client, Intents, MessageEmbed } = require('discord.js');
const { Modal , TextInputComponent , showModal} = require('discord-modals')
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});
const discordModals = require('discord-modals')
discordModals(client)
const { REST } = require('@discordjs/rest');
const db = require('quick.db')
const { Routes } = require('discord-api-types/v9');
require("dotenv").config()
client.on("ready" , () => {
const commands = [{
name:  "offer",
description : "Send offer for members"
},{
name:"order",
description: "order the offer",
options: [{name : "id",description: "the offer id",type: 3,required: true }]
}]
      const rest = new REST({ version: '9' }).setToken(process.env.token);
      
      (async () => {
          try {
              await rest.put(
                  Routes.applicationCommands(client.user.id),
                  { body: commands },
              );
              console.log("Done Run ApplicationCommands");
              console.log(client.user.tag)
            } catch (error) {
              console.error(error);
          }
      })();
})
let cat = ''//ايدي الكاتجري
const modal = new Modal()
.setCustomId('1')
.setTitle(`System Offers`)
.addComponents([
new TextInputComponent()
.setCustomId('2')
.setLabel(`البيعة`)
.setStyle('SHORT')
.setMinLength(1)
.setMaxLength(200)
.setPlaceholder(`هنا اكتب اش السلعة/الي راح تبيعة`)
.setRequired(true)
],[
new TextInputComponent()
.setCustomId('3')
.setLabel(`السعر`)
.setStyle('SHORT')
.setMinLength(1)
.setMaxLength(25)
.setPlaceholder(`هنا اكتب سعرك`)
.setRequired(true)
],[
new TextInputComponent()
.setCustomId('4')
.setLabel(`ايدي`)
.setStyle('SHORT')
.setMinLength(1)
.setMaxLength(18)
.setPlaceholder(`هنا تحط الايدي حقك`)
.setRequired(true)
],[
new TextInputComponent()
.setCustomId('5')
.setLabel(`صوره`)
.setStyle('SHORT')
.setMinLength(1)
.setMaxLength(500)
.setPlaceholder(`هنا تحط رابط صوره لللشي الي راح تبيعة`)
.setRequired(true)
])
client.on('interactionCreate', async(interaction) => {
	if(interaction.commandName === 'offer'){
    if (!interaction.member.roles.cache.find(role => role.id === '')) return;//ايدي رتبة الي راح تقدر تنشر سلع
	  showModal(modal, {
		client: client,
		interaction: interaction
	  })
	} else
    if(interaction.commandName === 'order'){
      if (!interaction.isCommand()) return;
      await interaction.deferReply({ephemeral:true})
      const args = interaction.options.getString("id");
      if(!args) return;
      let offerdata = await db.get(args)
      if(offerdata == null || !offerdata)return await interaction.editReply('This offer is not found');
    if(offerdata !== null){
    let everyone = interaction.guild.roles.cache.find(role => role.name === '@everyone');//لا تلعب فيها
    let staff = interaction.guild.roles.cache.find(role => role.id === '');//هنا حط ايدي رتبة البائعين
    interaction.guild.channels.create(`${interaction.user.username}-ticket`,{type: 'GUILD_TEXT',parent:cat}).then(nah =>{
      let embed = new MessageEmbed()
      .addField(`السلعة:`,`${offerdata.offer}`,true)
      .addField(`السعر:`,`${offerdata.price}`,false)
      .addField(`البائع:`,`<@${offerdata.you}>`,false)
      .setImage(offerdata.image)
      .setThumbnail(interaction.guild.iconURL({dynamic:true})).setFooter({text: interaction.guild.name, iconURL: interaction.guild.iconURL({dynamic:true})})
      .setTimestamp().setColor('BLUE').setAuthor({name: interaction.user.tag, iconURL: interaction.user.avatarURL({dynamic:true})})
      nah.send({embeds:[embed],content:`${interaction.user} لقد طلبت طلب\nمعلومات الطلب في الاسفل`})
      nah.permissionOverwrites.create(interaction.user.id, { VIEW_CHANNEL: true , SEND_MESSAGES: true})
      nah.permissionOverwrites.edit(everyone, { VIEW_CHANNEL: false , SEND_MESSAGES: false }).then(to =>
      to.permissionOverwrites.create(staff, { VIEW_CHANNEL:true , SEND_MESSAGES:true }).then(reply => { interaction.followUp({content: 'Done open the ticket'})})
      )})}}})
client.on('modalSubmit', async (modal) => {
	if(modal.customId === '1'){
		const offer = modal.getTextInputValue('2')
    const price = modal.getTextInputValue('3')
    const you = modal.getTextInputValue('4')
    const image = modal.getTextInputValue('5')
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
    let soffer;
      for(let i = 0; i < 6; i++){
        const random = Math.floor(Math.random() * letters.length)
        soffer += letters[random]
      }
      soffer = soffer.replace('undefined', '')
    const offerinfo = {
    "offer": offer,
    "price": price,
    "you": you,
    "image": image,
    }
   await db.set(`${soffer}`, offerinfo)
		const channel = client.channels.cache.get('')//الروم الي راح يروح فيها السلع
    const role = ''//الرتبة الي راح تتمنشن عند تنزيل اي سلعة
    await modal.deferReply({ ephemeral: true })
		modal.followUp({content: "> ☑️ - Done send you'r offer in <#>"})
    let offerembed = new MessageEmbed()
    .addField(`السلعة:`,`${offer}`,true)
    .addField(`السعر:`,`${price}`,false)
    .addField(`البائع:`,`<@${you}>`,false)
    .setImage(`${image}`)
    .setThumbnail(modal.guild.iconURL({dynamic:true})).setFooter({text: modal.guild.name, iconURL: modal.guild.iconURL({dynamic:true})})
    .setTimestamp().setColor('BLUE').setAuthor({name: modal.user.tag, iconURL: modal.user.avatarURL({dynamic:true})})
		channel.send({embeds: [offerembed],content:`**To order use: \`/order id:${soffer}\`**\n||<@&${role}>||`})
	}  
});

client.login(process.env.token)
