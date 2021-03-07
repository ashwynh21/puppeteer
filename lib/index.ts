import { WhatsappClient, WhatsappClientEvents } from './declarations';
/*
* Here we are going to create a declarations implementation of a robot...
*
* We will be making an API that will allow users to connect to the API using an express server as well as a socket
* server. So first we will need to explore the implementation of the puppeteer system to allow us to develop into
* the platform technology that we would like to get at
*
* */

/*
* So first let us get a puppeteer instance going so that we can see how to navigate the declarations system...
* */

const whatsapp = new WhatsappClient();

whatsapp.initialize()
    .on(WhatsappClientEvents.QR_CODE_SCAN_REQUEST, (qrcode: string) => {
        console.log('please scan qr code: ', qrcode.substring(0, 32));
    })
    .once(WhatsappClientEvents.QR_CODE_SCANNED, () => {
        console.log('qr code scanned: code');
        whatsapp.chats()
    });
