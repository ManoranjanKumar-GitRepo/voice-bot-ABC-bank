
const { MessageFactory, InputHints } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');

const MAIN_AGILE_DIALOG = 'mainAgileDialog';

class MainDialog extends ComponentDialog {
    constructor(luisRecognizer,orderDialog) {
        super('MainDialog');

        if (!luisRecognizer) throw new Error('[MainDialog]: Missing parameter \'luisRecognizer\' is required');
        this.luisRecognizer = luisRecognizer;

        if (!orderDialog) throw new Error('[MainDialog]: Missing parameter \'orderDialog\' is required');

        // Define the main dialog and its related components.
        // This is a sample "order a pizza" dialog.
        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(serviceDialog)
            .addDialog(new WaterfallDialog(MAIN_AGILE_DIALOG, [
                this.introStep.bind(this),
                this.actStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = MAIN_AGILE_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    /**
     * First step in the agile dialog. Prompts the user for a command.
     * Currently, this expects an order request like, "transactional service or informational service or transfer to call centre".
     * The LUIS app returns the requested service typre based on the entity found.
     */
    async introStep(stepContext) {
        if (!this.luisRecognizer.isConfigured) {
            const messageText = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
            await stepContext.context.sendActivity(messageText, null, InputHints.IgnoringInput);
            return await stepContext.next();
        }

        const messageText = stepContext.options.restartMsg ? stepContext.options.restartMsg : 'Hi! I\'m the Azure voice bot. What can I help you with?\nYou can say things like, "I want to transfer fund", "block card", "What\s the my account balance?"';
        const promptMessage = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt('TextPrompt', { prompt: promptMessage });
    }

    /**
     * Second step.  This will use LUIS to attempt to extract the service type.
     * Then, it hands off to the orderDialog child dialog to confirm the service request.
     */
    async actStep(stepContext) {
        const requestDetails = {};

        if (!this.luisRecognizer.isConfigured) {
            // LUIS is not configured, we just run the orderDialog path.
            return await stepContext.beginDialog('requestDialog', requestDetails);
        }

        // Call LUIS and gather any potential customer details. (Note the TurnContext has the response to the prompt)
        const luisResult = await this.luisRecognizer.executeLuisQuery(stepContext.context);
        switch (LuisRecognizer.topIntent(luisResult)) {
            
        case 'transactionalService': {
            const gettransactionalServiceDetails = 'Here following transactional service is supported .....';
            await stepContext.context.sendActivity(gettransactionalServiceDetails, gettransactionalServiceDetails, InputHints.IgnoringInput);
            break;
        }
            
        case 'transferFund': {
            const fundEntities = this.luisRecognizer.getFundEntities(luisResult);

            serviceDetails.type = fundEntities;
            console.log('LUIS extracted these user request details:', JSON.stringify(serviceDetails));

            return await stepContext.beginDialog('serviceDialog', serviceDetails);
        }

        case 'findATM': {
            const atmEntities = this.luisRecognizer.getAtmEntities(luisResult);

            serviceDetails.type = atmEntities;
            console.log('LUIS extracted these user request details:', JSON.stringify(serviceDetails));

            return await stepContext.beginDialog('serviceDialog', serviceDetails);
        }
		
		case 'callCentre': {
            const callCentreEntities = this.luisRecognizer.callCentreEntities(luisResult);

            serviceDetails.type = atmEntities;
            console.log('LUIS extracted these user request details:', JSON.stringify(serviceDetails));

            return await stepContext.beginDialog('serviceDialog', serviceDetails);
        }
        
        case 'greetings': {
            const getGreetingsText = 'Hi there!';
            await stepContext.context.sendActivity(getGreetingsText, getGreetingsText, InputHints.IgnoringInput);
            break;
        }

        default: {
            // Catch all for unhandled intents
            const didntUnderstandMessageText = `Sorry, I didn't get that. Please try asking in a different way (intent was ${ LuisRecognizer.topIntent(luisResult) })`;
            await stepContext.context.sendActivity(didntUnderstandMessageText, didntUnderstandMessageText, InputHints.IgnoringInput);
        }
        }

        return await stepContext.next();
    }

    /**
     * This is the final step in the main dialog.
     * It wraps up the sample "customer request" interaction with a simple confirmation.
     */
    async finalStep(stepContext) {
        // If the service dialog ("serviceDialog") was cancelled or the user failed to confirm, the Result here will be null.
        if (stepContext.result) {
            const result = stepContext.result;
            const msg = `I have your request for a ${ result.type }!`;
            await stepContext.context.sendActivity(msg, msg, InputHints.IgnoringInput);
        }

        // Restart the main dialog with a different message the second time around
        return await stepContext.replaceDialog(this.initialDialogId, { restartMsg: 'What else can I do for you?' });
    }
}

module.exports.MainDialog = MainDialog;
