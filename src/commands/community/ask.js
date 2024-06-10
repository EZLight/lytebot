const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const puppeteer = require('puppeteer')

module.exports = {

    data: {

        name: "chatgpt-user",
        description: "The question to ask Lyte",
        "options":[{"type":3,"name":"question","description":"The question to ask Lyte","required":true},{"name":"hidden","description":"Hide this message? (It will be hidden in guilds)","required":false,"type":5}],
        "integration_types": [1],
        "contexts": [0, 1, 2]

    },

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
        const hidden = options.getBoolean('hidden') || true

        await interaction.deferReply({ ephemeral: hidden })

        async function sendMessage (message) {
            const embed = new EmbedBuilder()
            .setColor('Blue')
            .setDescription(message)

            await interaction.editReply({ embeds: [embed] })
        }

        async function chatGPT (message) {
            const browser = await puppeteer.launch({ headless: false })
            const page = await browser.newPage()

            await page.goto('https://chat-app-f2d296.zapier.app/')

            const textBoxSelector = 'textarea["aria-label="chatbot-user-prompt"]'
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