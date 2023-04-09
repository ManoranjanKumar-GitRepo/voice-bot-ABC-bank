import speech_recognition as sr
import pyttsx3
import pywhatkit
import datetime


listener = sr.Recognizer()
engine = pyttsx3.init()
voices = engine.getProperty('voices')
engine.setProperty('voice', voices[1].id)


def talk(text):
    engine.say(text)
    engine.runAndWait()


def take_command():
    try:
        with sr.Microphone() as source:
            print('listening...')
            voice = listener.listen(source)
            command = listener.recognize_google(voice)
            command = command.lower()
            if 'ABC Bank Bot Name' in command:
                command = command.replace('ABC Bank Bot Name', '')
                print(command)
    except:
        pass
    return command


def run_voicebot():
    command = take_command()
    print(command)
    if 'fund transfer' in command:
        transactionalService = command.replace('tund transfer', 'transactionalService')
        talk('Processing Fund Transfer' + transactionalService)
        pywhatkit.performtransfer(transactionalService.transfer())
    elif 'block card now' in command:
        time = datetime.datetime.now().strftime('%I:%M %p')
        talk('Blocking card service effective from ' + time)
        pywhatkit.blockcard(transactionalService.cardService())
    elif 'find nearest atm' in command:
        atmService = command.replace('find nearest atm', 'informationalService')
        talk('Finding Nearest ATM' + informationalService.atmService(userLocation))
        pywhatkit.findatm(transactionalService.atmService(userLocation))
    elif 'update address' in command:
        talk('updating address details')
    elif 'connect to call centre' in command:
        talk('Transfering the call to call centre executive')
    elif 'unauthorised transfer' in command:
        talk('Transfering the call to call centre executive')
    else:
        talk('Please say the command again.')


while True:
    run_voicebot()
