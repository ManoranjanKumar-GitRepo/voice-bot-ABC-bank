
const { LuisRecognizer } = require('botbuilder-ai');

class UserRequestRecognizer {
    constructor(config) {
        const luisIsConfigured = config && config.applicationId && config.endpointKey && config.endpoint;
        if (luisIsConfigured) {
            this.recognizer = new LuisRecognizer(config, {}, true);
        }
    }

    get isConfigured() {
        return (this.recognizer !== undefined);
    }

    /**
     * Returns an object with preformatted LUIS results for the bot's dialogs to consume.
     * @param {TurnContext} context
     */
    async executeLuisQuery(context) {
        return await this.recognizer.recognize(context);
    }

    getServiceEntities(result) {
        let fromValue;
        if (result.entities.$instance.serviceType) {
            fromValue = result.entities.$instance.serviceType[0].text;
        }

        return { serviceType: fromValue };
    }
}

module.exports.UserRequestRecognizer = UserRequestRecognizer;
