

const delay = () =>{
    return new Promise(
        (resolve) => setTimeout(resolve, 1000)
    );
}

const waitUntil = async(date, message) =>{ 
    let currentTime = new Date();
    console.log("Waiting for " + message + " at " + date);
    while(currentTime < date){
        await delay();
        currentTime = new Date();
    }
}
export { waitUntil };
