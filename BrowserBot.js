import puppeteer from 'puppeteer';

class BrowserBot{
    constructor(randomizeTime = false, min = 1000, max = 2000){
        this.randomizeTime = randomizeTime
        this.min = min;
        this.max = max;
        this.page = null;
    }

    async initBrowser(){
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            ignoreDefaultArgs: ['--disable-extensions'],

        });
        this.page = await browser.newPage();
    }

    delay() {
        let time = this.min
        if(this.randomizeTime){
            time = this.randomInRange(this.min, this.max);
        }
        return new Promise(
            (resolve) => setTimeout(resolve, time)
        );
    }

    randomInRange(min, max) {  
        return Math.floor(Math.random() * (max - min) + min); 
    }

    async setInput(element, identifier, text){
        const el = element + "[" + identifier + "]";
        await this.page.waitForSelector(el);
        if(!this.randomizeTime){
            await this.page.type(el, text);
        }
        else{
            // split input into random parts
            let i = 0;
            while(i < text.length){
                let randomLength = this.randomInRange(1, Math.min(5, text.length - i));
                let part = text.substring(i, i + randomLength);
                await this.page.type(el, part);
                await this.delay(this.randomInRange(this.min/10,this.max/10));
                i += randomLength;
            }
        }
        await this.delay();
    }

    async gotoPage(url){
        if(this.page == null) return;
        await this.page.goto(url, {waitUntil: 'load', timeout: 0});
    }

    async clickButton(element, identifier){
        const el = element + "[" + identifier + "]";
        await this.page.waitForSelector(el);
        await this.page.click(el);
        await this.delay();
    }

    async getAttribute(element, identifier, attribute, timer = 500){
        const el = element + "[" + identifier + "]";
        // Create a promise that resolves to null after 2 seconds
        const timeout = new Promise((resolve) => {
            setTimeout(() => {
                resolve(null);
            }, timer);
        });

        // The main task promise
        const task = (async () => {
            await this.page.waitForSelector(el);
            return this.page.$eval(el, (el, attribute) => el.getAttribute(attribute), attribute);
        })();

        // Race the task against the timeout
        return Promise.race([task, timeout]);
    }

    async getInnerText(element, identifier, timer = 500){
        const el = element + "[" + identifier + "]";
        // Create a promise that resolves to null after 2 seconds
        const timeout = new Promise((resolve) => {
            setTimeout(() => {
                resolve(null);
            }, timer);
        });

        // The main task promise
        const task = (async () => {
            let tag = await this.page.waitForSelector(el);
            return await tag.evaluate(el => el.innerText);
        })();

        // Race the task against the timeout
        return Promise.race([task, timeout]);
    }

    async closeBrowser(page){
        await this.page.close();
        await this.page.browser().close();
    }

}


export {BrowserBot};
