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
        this.dates = []
        let today = new Date();
        for(let i = 0; i < 3; i++){
            this.dates.push(months[today.getMonth()] + " " + today.getDate() + ", " + today.getFullYear());
        }
        this.timer = new Timer();
        this.bb = new BrowserBot();
    }

    async setTimer(month, day, hour, minute){
        this.timer.setTimer(month, day, hour, minute);  
    }

    async run(){
        await this.timer.wait();
        if(this.bb == null){
            console.log("BrowserBot not initialized");
            return;
        }
        await this.bb.initBrowser(); 
        await this.login();
        await this.gotoPage();
        await this.timer.wait();
        await this.bookOnDate();
        await this.bb.closeBrowser();
    }

    async login(){
        await bb.gotoPage("https://anc.apm.activecommunities.com/santamonicarecreation/signin?onlineSiteId=0&from_original_cui=true&override_partial_error=False&custom_amount=False&params=aHR0cHM6Ly9hcG0uYWN0aXZlY29tbXVuaXRpZXMuY29tL3NhbnRhbW9uaWNhcmVjcmVhdGlvbi9BY3RpdmVOZXRfSG9tZT9GaWxlTmFtZT1hY2NvdW50b3B0aW9ucy5zZGkmZnJvbUxvZ2luUGFnZT10cnVl");
        await bb.setInput("input", "aria-label='Login name Required'", user);
        await bb.setInput("input", "aria-label='Password Required'", password);
        await bb.clickButton("button", "type='submit'");
    }

    async gotoPage(){
        await bb.gotoPage("https://anc.apm.activecommunities.com/santamonicarecreation/reservation/landing/quick?groupId=4");
        await bb.delay();
        await bb.setInput("input", "aria-label='Event name'", "Casual Tennis");
    }

    async bookOnDate(){
        for(let date of dates){
            console.log("Checking for open slots on "+date);
            // selects date
            await bb.clickButton("div", "class='an-input-addon'");
            let calendar = await bb.getInnerText("span", "class='an-calendar-header-title an-calendar-header-title--disabled'");
            console.log("Current month: "+calendar);
            
            // checks if the date is in the current month
            if(!calendar.includes(date.split(" ")[0])){
                await bb.clickButton("i", "aria-label='Switch calendar to next month right arrow'");
            }

            // selects date
            await bb.clickButton("div", `aria-label='${date}'`);
            await this.book();
        }
    }

    async book(){
        // checks for any open slots
        let i = 0;
        while(i != -1){
            let j = 0;
            while(true){
                console.log("\tChecking slot "+i+"-"+j);
                const available = await bb.getAttribute("div", `aria-activedescendant='cell-${i}-${j}'`, "aria-label");
                if(!available){
                    if(j == 0){ i = -2;}
                    break;
                }
                if(available.includes("Avaiable")){
                    console.log("Found an open slot on "+date+" at "+ available);
                    await bb.clickButton("button", "type='submit'");
                    break;
                }
                j++;
            }
            i++;
        }
    }

    
}

const main = new Main();
main.run();
