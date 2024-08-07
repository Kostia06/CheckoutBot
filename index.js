import { BrowserBot } from "./BrowserBot.js";
import { waitUntil } from "./Timer.js"
import {user, name, password} from "./password.js"

// for the formating reasons
const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const eventName = "Friday Tennis";
const firstDateOfInterest = new Date("Aug 9, 2024");
const firstRegistretion = new Date("Aug 7, 2024 8:15:00");
const linkOfInterest1 = "https://anc.apm.activecommunities.com/santamonicarecreation/reservation/landing/quick?groupId=4";
const linkOfInterest = "https://anc.apm.activecommunities.com/santamonicarecreation/reservation/landing/quick?groupId=16";


const main = async() => {
    let bb = new BrowserBot(); 
    let waitingDate = firstRegistretion;
    let lookingFor = firstDateOfInterest;
    while(true){
        await waitUntil(waitingDate, "to login");
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
        // waits for next week
        waitingDate.setDate(waitingDate.getDate() + 7);
        lookingFor.setDate(lookingFor.getDate() + 7);
        // closes the browser
        await bb.closeBrowser();
    }
}

const login = async(bb) => {
   console.log("Logging in");
    await bb.gotoPage("https://anc.apm.activecommunities.com/santamonicarecreation/signin");
    await bb.setInput("input", "aria-label='Login name Required'", user);
    await bb.delay();
    await bb.setInput("input", "aria-label='Password Required'", password);
    await bb.delay();
    await bb.clickButton("button", "type='submit'");
}

const gotoPage = async(bb) => {
    console.log("Going to page");        
    await bb.gotoPage(linkOfInterest);
    await bb.delay();
    await bb.setInput("input", "aria-label='Event name'", eventName);
    await bb.delay();
}

const changeReservation = async(bb) => {
    console.log("Changing reservation");
    await bb.clickButton("div", "class='dropdown dropdown--ng dropdown--m dropdown--filter filter-dropdown is-active customer-company'");
    await bb.delay();
    await bb.clickButton("li", `title='${name}'`);
}

const book = async(bb, lookingFor) => {
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

const bookOnDate = async(bb, date) => {
    let i = 0;
    while(i != -1){
        let j = 0;
        while(true){
            const availablity = await bb.getAttribute("div", `aria-activedescendant='cell-${i}-${j}'`, "aria-label");
            if(!availablity){
                if(j == 0){ i = -2;}
                break;
            }
            console.log("Checking "+date+" at "+ availablity);
            if(availablity.includes("Available")){
                await bb.clickButton("div", `aria-label='${availablity}'`);
                await bb.clickButton("button", "type='submit'");
                return true;
            }
            j++;
        }
        i++;
    }
    return false;
}

    

await main();
