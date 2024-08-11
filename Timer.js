

const delay = () =>{
    return new Promise(
        (resolve) => setTimeout(resolve, 1000)
    );
}

const waitUntil = async(date, message, minuteOffset = 0) =>{ 
    let currentTime = new Date();
    let waitTime = new Date(date);
    waitTime.setMinutes(waitTime.getMinutes() - minuteOffset);
    console.log("Waiting for " + message + " at " + waitTime);
    while(currentTime < waitTime){
        await delay();
        currentTime = new Date();
    }
}
export { waitUntil };
