
class Timer{
    constructor(){
        this.time = new Date();
    }

    setTimer(month, day, hour, minute){
        this.time = new Date();
        this.time.setMonth(month);
        this.time.setDate(day);
        this.time.setHours(hour);
        this.time.setMinutes(minute);
        this.time.setSeconds(0);
    }

    delay(){
        return new Promise(
            (resolve) => setTimeout(resolve, 1000)
        );
    }

    async wait(){
        let currentTime = new Date();
        while(currentTime < this.time){
            await this.delay();
            currentTime = new Date();
            console.log("Current time: " + currentTime);
            console.log("Execution time: " + this.time);
        }
    }
}

export { Timer };
