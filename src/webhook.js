const WEBHOOK_URL = 'https://discord.com/api/webhooks/1181771178495455242/b8DWldpaxM0bl_UZQ7Ocwft4kO0H5U8TSpOr67rFOfZUI5vuGAc0Ka33Vg5KYbtUGFKB'

/**
 * Send a discord webhook
 * @param {string} message
 * @returns {void}
 * @async
 */
export const sendDiscordWebhook = async(message) => {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: message
                // You can add more fields as per Discord's webhook format
            }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        console.log('Message sent successfully');
    } catch (error) {
        console.error('Failed to send message:', error);
    }
}
