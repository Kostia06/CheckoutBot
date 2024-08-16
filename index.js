#!/usr/bin/env node

import { BrowserBot } from "./BrowserBot.js";
import { waitUntil } from "./Timer.js"
import {user, name, password} from "./password.js"
import readline from 'readline';

const debugMode = true;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// for the formating reasons
const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const daysOfWeek = [
    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
];

const info = {
    eventName: "Friday Tennis",
    link: "https://anc.apm.activecommunities.com/santamonicarecreation/reservation/landing/quick?groupId=3",
    runDays: ["Tue", "Thu"],
    name,
    user,
    password,
    startTime: new Date(0, 0, 0, 8, 15, 0),
    timeRange: [9, 12],
}

const ask = async(query) => {
    return new Promise(resolve => rl.question(query, resolve));
}

const getNextWeekday = (target) => {
    const today = new Date();
    let daysToAdd = today.getDay() - daysOfWeek.indexOf(target);
    if(daysToAdd < 0)
        daysToAdd += 7; 
    if(daysToAdd != 0)
        daysToAdd += 1
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + daysToAdd);
    return nextDay;
}


async function main(){
    let bb = new BrowserBot(); 
    let dayIndex = 0;
    while(true){
        if(debugMode)
            console.log("Debug mode on");
        if(dayIndex >= info.runDays.length)
            dayIndex = 0;
        
        const startDay = getNextWeekday(info.runDays[dayIndex++]);
        startDay.setHours(info.startTime.getHours());
        startDay.setMinutes(info.startTime.getMinutes());

        const lookingFor = new Date(startDay);
        lookingFor.setDate(startDay.getDate() + 3);

        await waitUntil(startDay, "to login");
        // creates a new browser instance
        await bb.initBrowser();
        // logs in
        await login(bb, info.user, info.password);
        // goes to the page
        await gotoPage(bb, info.link);
        // creates the event
        await createEvent(bb, info.eventName);
        // changes the reservation
        await changeReservation(bb, info.name);
        await waitUntil(startDay, "to book");
        // changes date for the event
        await changeDate(bb, lookingFor);
        // find the available slot
        const a = await book(bb, info.timeRange);
        // checks out
        if(a)
            await checkout(bb, a);
        // closes the browser
        if(!debugMode)
            await bb.closeBrowser();
        else
            break;
    }
}

async function login(bb, user, password){
    console.log("Logging in");
    await bb.gotoPage("https://anc.apm.activecommunities.com/santamonicarecreation/signin");
    await bb.locate("input[aria-label='Login name Required']").fill(user);
    await bb.locate("input[aria-label='Password Required']").fill(password);
    await bb.locate("button[type='submit']").click();
}

async function gotoPage(bb, link){
    await bb.waitForLoad();
    console.log("Going to page");       
    await bb.gotoPage(link);
    await bb.delay();
}


async function createEvent(bb, eventName){
    console.log("Creating event " + eventName);
    await bb.locate("input[aria-label='Event name']").fill(eventName);
}

async function changeReservation(bb, name){
    console.log("Changing reservation");
    await bb.locate(".customer-company").click();
    await bb.locate(`li[title='${name}']`).click();
}

async function changeDate(bb, lookingFor){
    const month = months[lookingFor.getMonth()];
    const dateFormat = month + " " + lookingFor.getDate() + ", " + lookingFor.getFullYear()
    console.log("Changing date to "+ dateFormat);
    await bb.delay();
    await bb.locate('input[aria-label="Date picker, current date"]').click()
    const calendar = await bb.getInnerText(".an-calendar-header-title");  
    while(!calendar.includes(month))
        await bb.locate("i[aria-label='Switch calendar to next month right arrow']").click();
    await bb.locate(`div[aria-label='${dateFormat}']`).click();
}

async function book(bb, timeRange){
    const task = async (i) => {
        for(let j = 0; ;j++){
            const data = await bb.getAttribute(`div[aria-activedescendant='cell-${i}-${j}']`);
            if(!data){ return null; }
            const a = data[0]["aria-label"];

            const array = a.split(" ");
            let time = 0;
            let open = "";
            for(let i = 0; i < array.length; i++){
                if(array[i].includes(":")){
                    time = parseInt(array[i].split(":")[0])
                    if(array[i+1] == "PM" && time != 12)
                        time += 12;
                    open = array[i+5];
                    break;
                }
            }

            console.log("Slot at " + time + " is " + open);
            if(open == "Available" && timeRange[0] <= time && time <= timeRange[1]){
                console.log("Found availability at " + a);
                await bb.delay();
                await bb.locate(`div[aria-activedescendant='cell-${i}-${j}']`).click();
                await bb.locate("button[class='btn btn-strong booking-detail__btn--continue']").click();
                return a;
            }
        } 
    }

    for(let i = 5; i >= 0; i--){
        const a = await task(i);
        if(a) return a;
    }
    console.log("No open slots found");
    return null;
}

async function checkout(bb, a){
    console.log("Checking out at "+ a);
    await bb.delay(1000);
    for(let i = 0; i < 40; i++){
        try{
            await bb.locate(`label[for='checkbox_attr_for_${i}']`).setTimeout(30).click();
            break;
        }
        catch(e){
            continue;
        }
    }
    await bb.locate(".quick-need-to-answer--action > button[class='btn btn-strong']").click();  
    await bb.delay();
    if(!debugMode)
        await bb.locate('button[aria-label="Total $0.00 Reserve"]').click();

}

main().catch(console.error);
