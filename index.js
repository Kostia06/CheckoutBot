#!/usr/bin/env node

import { BrowserBot } from "./BrowserBot.js";
import { waitUntil } from "./Timer.js"
import {user, name, password} from "./password.js"
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = async(query) => {
    return new Promise(resolve => rl.question(query, resolve));
}

// for the formating reasons
const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const daysOfWeek = [
    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
];

const eventName = "Friday Tennis";
const day1 = new Date();
const day2 = new Date();
const linkOfInterest1 = "https://anc.apm.activecommunities.com/santamonicarecreation/reservation/landing/quick?groupId=4";
const linkOfInterest = "https://anc.apm.activecommunities.com/santamonicarecreation/reservation/landing/quick?groupId=16";

async function setUp(){
    console.log("Enter the date of the registration");
    const month1 = await ask("\tEnter the month (EX: Aug): ");
    const date1 = await ask("\tEnter the day (EX: 31): ");
    const hour1 = await ask("\tEnter the hour (EX: 13): ");
    const minute1 = await ask("\tEnter the minute (EX: 30): ");
    day1.setMonth(months.indexOf(month1));
    day1.setDate(date1);
    day1.setHours(hour1);
    day1.setMinutes(minute1);
    day1.setSeconds(0)
    console.log("Enter the date that you want to book on");
    const month2 = await ask("\tEnter the month (EX: Aug): ");
    const date2 = await ask("\tEnter the day (EX: 31): ");
    day2.setMonth(months.indexOf(month2));
    day2.setDate(date2);
}

async function main(){
    await setUp();
    let bb = new BrowserBot(); 
    let waitingDate = day1;
    let lookingFor = day2;

    await waitUntil(waitingDate, "to login", 2);
    // creates a new browser instance
    await bb.initBrowser();
    // logs in
    await login(bb);
    // goes to the page
    await gotoPage(bb);
    // changes the reservation
    await changeReservation(bb);
    await waitUntil(waitingDate, "to book");
    // books the event
    await book(bb, lookingFor);
    // closes the browser
    await bb.closeBrowser();
}

async function login(bb){
   console.log("Logging in");
    await bb.gotoPage("https://anc.apm.activecommunities.com/santamonicarecreation/signin");
    await bb.setInput("input", "aria-label='Login name Required'", user);
    await bb.delay();
    await bb.setInput("input", "aria-label='Password Required'", password);
    await bb.delay();
    await bb.clickButton("button", "type='submit'");
}

async function gotoPage(bb){
    console.log("Going to page");        
    await bb.gotoPage(linkOfInterest);
    await bb.delay();
    await bb.setInput("input", "aria-label='Event name'", eventName);
    await bb.delay();
}

async function changeReservation(bb){
    console.log("Changing reservation");
    await bb.clickButton("div", "class='dropdown dropdown--ng dropdown--m dropdown--filter filter-dropdown is-active customer-company'");
    await bb.delay();
    await bb.clickButton("li", `title='${name}'`);
}

async function book(bb, lookingFor){
    const dateFormat = months[lookingFor.getMonth()] + " " + lookingFor.getDate() + ", " + lookingFor.getFullYear()
    console.log("Booking for "+ dateFormat);
    await bb.clickButton("div", "class='an-input-addon'"); 
    await bb.delay();
    let calendar = await bb.getInnerText("span", "class='an-calendar-header-title an-calendar-header-title--disabled'");
    if(!calendar.includes(months[lookingFor.getMonth()])){
        await bb.clickButton("i", "aria-label='Switch calendar to next month right arrow'");
    }
    await bb.clickButton("div", `aria-label='${dateFormat}'`);
    let found = await bookOnDate(bb, dateFormat);
    if(!found){
        console.log("No open slots found for "+ dateFormat);
    }

}

async function bookOnDate(bb, date){
    let i = 0;
    while(i != -1){
        let j = 0;
        while(true){
            const availability = await bb.getAttribute("div", `aria-activedescendant='cell-${i}-${j}'`, "aria-label");
            if(!availability){
                if(j == 0){ i = -2;}
                break;
            }
            console.log("Checking "+date+" at "+ availability);
            if(availability.includes("Available")){
                console.log("Found availability at " + availability);
                await bb.clickButton("div", `aria-label='${availability}'`);
                await bb.clickButton("button", "type='submit'");
                return true;
            }
            j++;
        }
        i++;
    }
    return false;
}

main().catch(console.error);
