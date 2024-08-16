import puppeteer from 'puppeteer';


class BrowserBot{
    constructor(){
        this.page = null;
        this.recorder = null;
    }

    delay(ms = 1000){
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    randomInRange(min, max){
        return Math.floor(Math.random() * (max - min) + min);
    }

    async initBrowser(headless = false, args = ['--no-sandbox', '--disable-setuid-sandbox']){
        const browser = await puppeteer.launch({headless,args});
        this.page = await browser.newPage();
    }

    async closeBrowser(){
        await this.page.close();
        await this.page.browser().close();
    }

    async waitForLoad(){
        await this.page.waitForNavigation({ waitUntil: 'load' });
    }

    async gotoPage(url){
        await this.page.goto(url, {waitUntil: 'load', timeout: 0});
    }

    locate(cssSelector){
        return this.page.locator(cssSelector).setTimeout(2000);
    }

    async getAttribute(cssSelector, attribute){
        try{
            await this.page.waitForSelector(cssSelector, {timeout: 50});
            return await this.page.$$eval(cssSelector, elements => 
                elements.map(element => {
                    const attrs = {};
                    for(const attr of element.attributes)
                        attrs[attr.name] = attr.value;
                    return attrs;
                })
            );
        }
        catch(e){
            return null;
        }
    }

    async getInnerText(cssSelector){
        try{
            await this.page.waitForSelector(cssSelector, {timeout: 50});
            return await this.page.$eval(cssSelector, el => el.innerText);
        }
        catch(e){
            return null;
        }
    }
}


/*


class BrowserBot{
    constructor(){
        this.page = null;
    }

    async initBrowser(){
        const browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            ignoreDefaultArgs: ['--disable-extensions'],

        });
        this.page = await browser.newPage();
    }

    delay(ms = 1000) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    randomInRange(min, max) {  
        return Math.floor(Math.random() * (max - min) + min); 
    }

    async setInput(element, identifier, text, randomizeTime = false, min = 200, max = 500){
        const el = element + "[" + identifier + "]";
        await this.page.waitForSelector(el);
        if(!randomizeTime){
            await this.page.type(el, text);
            return;
        }
        // split input into random parts
        let i = 0;
        while(i < text.length){
            let randomLength = this.randomInRange(1, Math.min(5, text.length - i));
            let part = text.substring(i, i + randomLength);
            await this.page.type(el, part);
            await this.delay(this.randomInRange(min/10,max/10));
            i += randomLength;
        }
    }

    async gotoPage(url){
        if(this.page == null) return;
        await this.page.goto(url, {waitUntil: 'load', timeout: 0});
    }

    async clickButton(element, identifier, index = 0){
        const el = element + "[" + identifier + "]";
        await this.page.waitForSelector(el);
        const buttons = await this.page.$$(el);
        if(buttons.length <= index){
            console.log("Button not found");
            return;
        }
        await buttons[index].click();
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

    async waitForSelector(element, identifier){
        const el = element + "[" + identifier + "]";
        await this.page.waitForSelector(el);
    }

    async closeBrowser(page){
        await this.page.close();
        await this.page.browser().close();
    }

}

*/


export {BrowserBot};
