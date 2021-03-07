import { launch, Page } from 'puppeteer';
import { EventEmitter } from 'events';
/*
* Here we define our class
* */
export class WhatsappClient extends EventEmitter {
    page: Promise<Page>;

    constructor() {
        super();

        /*
        * We have no needed properties as of yet so we construct on blank args
        * */
        this.page = launch({ headless: false })
            .then(browser => {
                return browser.newPage()
                    .then(async (page) => {
                        await page.goto('https://web.whatsapp.com/',{
                            waitUntil: "networkidle2",
                        });
                        /*
                        * We do not need any data from the response as far as I can tell so let us proceed form
                        * here
                        * */
                        return page;
                    });
            });
    }

    /*
    * So now we have the constructor done so we can move forward on the application so that we develop more functionality
    *
    * So first we need to build in a functionality that will allow us to view the platform or user account from a data
    * perspective, that is, we need to achieve a few functionalities that will at least give us some perspective to the
    * declarations account in question.
    *
    * so here is the list of functionalities that will help us achieve this.
    * 1. get list of active users and chats.
    * 2. get a list of contacts.
    * 3. get list of statuses.
    * 4. get profile picture as well as profile in general
    * 5. Also we should be able to get the authentication QR code from the initial UI provided by the WhatsApp platform.
    * */

    /*
    * Let us start with the function that will allow us to get the QR Code from the initial WhatsApp login UI.
    * */
    public initialize(): WhatsappClient {
        this.page
            .then(async (page) => {
                const mutationCallback = (_: string) => {};
                const qrcodeScanned = () => {};

                await page.exposeFunction('mutationCallback', (canvas: string) => {
                    this.emit(WhatsappClientEvents.QR_CODE_SCAN_REQUEST, canvas);
                });
                await page.exposeFunction('qrcodeScanned', () => {
                    this.emit(WhatsappClientEvents.QR_CODE_SCANNED);
                });

                return page.waitForSelector('div[data-ref]')
                    .then(() => {
                        return page.evaluate(() => {
                            const content = document.querySelector('div[data-ref]') as HTMLDivElement;
                            const canvas = content.querySelector('canvas') as HTMLCanvasElement;
                            const app = document.querySelector('#app') as HTMLDivElement;
                            /*
                            * We should ensure that the QR Code is always valid should the app go to sleep
                            * */
                            const code = new MutationObserver(_ => {
                                const button: HTMLDivElement = content.children[0].children[0] as HTMLDivElement;

                                button.click();
                            });
                            const remove = new MutationObserver(mutations => {
                                mutations.forEach(mutation => {
                                    const nodes = Array.from(mutation.removedNodes);

                                    if (nodes.indexOf(content) > -1 || nodes.some(parent => parent.contains(content))) {
                                        qrcodeScanned();

                                        data.disconnect();
                                        code.disconnect();
                                        remove.disconnect();
                                    }
                                });
                            })
                            const data = new MutationObserver(mutations => {
                                mutations.forEach(() => mutationCallback(canvas.toDataURL()));
                            });

                            data.observe(content, {
                                attributeFilter: [ 'data-ref' ]
                            });
                            code.observe(content.children[0], {
                                childList: true
                            });
                            remove.observe(app, { childList: true, subtree: true });

                            mutationCallback(canvas.toDataURL());
                        })
                    });
            });

        return this;
    }

    /*
    * Now we develop a function that will allow to get the users active chats
    * */
    public chats(): void {
        /*
        * To get a list of the active chats we would need to select the recycling list and observe it for data changes
        * and collect the changes...
        * */
        this.page
            .then((page) => {
                const chatsCallback = (_?: MutationRecord) => {};

                return page.exposeFunction('chatsCallback', (mutation?: MutationRecord) => {
                    console.log('got chat list...');
                })
                    .then(() => page.waitForSelector('#pane-side > div > div > div'))
                    .then(() => {
                        return page.evaluate(() => {
                            const list = document.querySelector('#pane-side > div > div > div');

                            const chats = Array.from((list as HTMLDivElement).children)
                                .map((c) => {
                                    const title = c.querySelector('div > div > div:last-child > div:first-child') as HTMLDivElement;
                                    const message = c.querySelector('div > div > div:last-child > div:last-child > div:last-child span[title]');
                                    const indications = Array.from(title.children)[Array.from(title.children).length - 1];
                                    const unread = (indications.querySelector('div:last-child > div:last-child > span') as HTMLSpanElement);

                                    return {
                                        name: (title.querySelector('span[title]') as HTMLSpanElement).innerHTML,
                                        message: (message as HTMLSpanElement).innerHTML,
                                        time: (indications.querySelector('div > div:last-child') as HTMLDivElement).innerHTML,
                                        unread: unread.hasChildNodes() ? Number(unread.children[0].children[0].innerHTML) : 0
                                    };
                                })
                                .filter(n => n != null);
                            console.log(chats);

                            chatsCallback();
                        });
                    })
            })
    }
}


export enum WhatsappClientEvents {
    QR_CODE_SCAN_REQUEST = 'qr_code_scan_request',
    QR_CODE_SCANNED = 'qr_code_scanned',
}
