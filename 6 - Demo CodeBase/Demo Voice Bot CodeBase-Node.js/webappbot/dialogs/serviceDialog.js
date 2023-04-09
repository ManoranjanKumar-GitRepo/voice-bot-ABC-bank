const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, AgileDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');

const CONFIRM_PROMPT = 'confirmPrompt';
const TEXT_PROMPT = 'textPrompt';
const AGILE_DIALOG = 'AgileDialog';

class ServiceDialog extends CancelAndHelpDialog {
    constructor(id) {
        super(id || 'serviceDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new AgileDialog(AGILE_DIALOG, [
                this.serviceStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = AGILE_DIALOG;
    }

    /**
     * If a user request type has not been provided, prompt for one.
     */
    async serviceStep(stepContext) {
        const serviceDetails = stepContext.options;

        if (!serviceDetails.type.serviceType) {
            const messageText = 'What assistance would you like?';
            const msg = MessageFactory.text(messageText, 'What assistance would you like?', InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(serviceDetails.type.serviceType);
    }

    /**
     * Confirm the information the user has provided.
     */
    async confirmStep(stepContext) {
        const serviceDetails = stepContext.options;

        // Capture the results of the previous step
        serviceDetails.type = stepContext.result;
        const messageText = `Please confirm your request for a ${ serviceDetails.type }. Is this correct?`;
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);

        // Offer a YES/NO prompt.
        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
    }

    /**
     * Complete the interaction and end the dialog.
     */
    async finalStep(stepContext) {
        if (stepContext.result === true) {
            const serviceDetails = stepContext.options;
            return await stepContext.endDialog(serviceDetails);
        }
        return await stepContext.endDialog();
    }

}

module.exports.ServiceDialog = ServiceDialog;
