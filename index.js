import { BrowserBot } from "./BrowserBot.js";
import { Timer } from "./Timer.js";
import {user, password} from "./password.js"
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

class Main{
        constructor(){
        this.date = new Date();
        this.dates = []
        for(let i = 0; i < 3; i++){
            let str = months[this.date.getMonth()] + " " + this.date.getDate() + ", " + this.date.getFullYear();
            this.dates.push(str);
            this.date.setDate(this.date.getDate() + 1);
        }
        this.timer = new Timer();
        this.bb = new BrowserBot();
        this.dateToExecute = new Date();
    }

    async setTimer(month, day, hour, minute){
        this.timer.setTimer(month, day, hour, minute);  
    }

    async run(){
        while(true){
            this.dateToExecute.setHours(9);
            this.dateToExecute.setMinutes(15);
            this.dateToExecute.setSeconds(0);
            console.log("Waiting for "+ this.dateToExecute);
            await this.timer.wait(this.dateToExecute, 2);
            await this.bb.initBrowser(); 
            await this.login();
            await this.gotoPage();
            await this.timer.wait(this.dateToExecute);
            await this.bookOnDate();
            await this.bb.closeBrowser();
            this.dateToExecute.setDate(this.dateToExecute.getDate() + 1);
        }
    }

    async login(){
        await this.bb.gotoPage("https://anc.apm.activecommunities.com/santamonicarecreation/signin?onlineSiteId=0&from_original_cui=true&override_partial_error=False&custom_amount=False&params=aHR0cHM6Ly9hcG0uYWN0aXZlY29tbXVuaXRpZXMuY29tL3NhbnRhbW9uaWNhcmVjcmVhdGlvbi9BY3RpdmVOZXRfSG9tZT9GaWxlTmFtZT1hY2NvdW50b3B0aW9ucy5zZGkmZnJvbUxvZ2luUGFnZT10cnVl");
        await this.bb.setInput("input", "aria-label='Login name Required'", user);
        await this.bb.delay();
        await this.bb.setInput("input", "aria-label='Password Required'", password);
        await this.bb.delay();
        await this.bb.clickButton("button", "type='submit'");
    }

    async gotoPage(){
        await this.bb.gotoPage("https://anc.apm.activecommunities.com/santamonicarecreation/reservation/landing/quick?groupId=4");
        await this.bb.delay();
        await this.bb.setInput("input", "aria-label='Event name'", "Casual Tennis");
        await this.bb.delay();
    }

    async bookOnDate(){
        for(let date of this.dates){
            // selects date
            await this.bb.clickButton("div", "class='an-input-addon'");
            await this.bb.delay();
            let calendar = await this.bb.getInnerText("span", "class='an-calendar-header-title an-calendar-header-title--disabled'");
            await this.bb.delay(); 
            // checks if the date is in the current month
            if(!calendar.includes(date.split(" ")[0])){
                await this.bb.clickButton("i", "aria-label='Switch calendar to next month right arrow'");
            }
            // selects date
            await this.bb.clickButton("div", `aria-label='${date}'`);
            let found = await this.book(date);
            if(found) break;
        }
    }

    async book(date){
        // checks for any open slots
        let i = 0;
        while(i != -1){
            let j = 0;
            while(true){
                const available = await this.bb.getAttribute("div", `aria-activedescendant='cell-${i}-${j}'`, "aria-label");
                if(!available){
                    if(j == 0){ i = -2;}
                    break;
                }
                if(available.includes("Avaiable")){
                    console.log("Found an open slot on "+date+" at "+ available);
                    await this.bb.clickButton("button", "type='submit'");
                    return true;
                }
                j++;
            }
            i++;
        }
        return false;
    }

    
}

const main = new Main();
await main.run();
rl.close();
