const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const puppeteer = require('puppeteer')

module.exports = {

    data: {
        name: "chatgpt-user",
        description: "The question to ask Lyte",
        options: [
          {
            type: 3, // String type
            name: "question",
            description: "The question to ask Lyte",
            required: true,
          },
          {
            name: "hidden",
            description: "Hide this message? (It will be hidden in guilds)",
            required: false,
            type: 5, // Boolean type
          },
        ],
    // data: new SlashCommandBuilder()
    // .setName('chatgpt-user')
    // .setDescription('Ask Lyte a question')
    // .addStringOption(option => option.setName('question')
    // .setDescription('The question to ask Lyte')
    // .setRequired(true))
    // .addBooleanOption(option => option.setName("hidden")
    // .setDescription("Hide this message? (It will be hidden in guilds)")
    // .setRequired(false)),
    async execute(interaction) {
        
        const { options } = interaction
        const message = options.getString('message')
        var hidden = options.getBoolean('hidden') 

        if (hidden == null) hidden = true

        await interaction.deferReply({ ephemeral: hidden })

        async function sendMessage (message, output) {
            const embed = new EmbedBuilder()
            .setColor('Blue')    
            .setDescription(`**Lyte Response to \`${message}\`:** \n\n`);

            // Truncate output if exceeding character limit (adjust limit as needed)
            const maxOutputLength = 1500;
            if (output.length > maxOutputLength) {
              output = output.substring(0, maxOutputLength) + "... (response truncated)";
            }
          
            embed.addField('\nResponse:', output, false);  // Add response as a field
          
            const totalLength = message.length + embed.data.content.length;
            if (totalLength > 2000) {
              console.error("Message exceeds character limit. Truncating response.");
            }
          
        }

        async function chatGPT (message) {
            const browser = await puppeteer.launch({ headless: true })
            const page = await browser.newPage()

            await page.goto('https://chat-app-f2d296.zapier.app/')

            const textBoxSelector = 'textarea[data-testid="user-prompt"]';
            await page.waitForSelector(textBoxSelector)

            await page.type(textBoxSelector, message)
            await page.keyboard.press("Enter")

            await page.waitForSelector('[data-testid="final-bot-response"] p').catch(err => {
                return;
            })

            value = await page.$$eval('[data-testid="final-bot-response"]', async (elements) => {
                return elements.map((element) => element.textContent)
            })

            await browser.close()

            value.shift()

            return value.join(`\n\n\n\n`)
        }

        var output = await chatGPT(message)

        await sendMessage(`**Lyte Response to \`${message}\`:** \n\n\`\`\`${output}\`\`\``)
    }
}
}