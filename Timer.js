
class Timer{
    constructor(){
    }


    delay(){
        return new Promise(
            (resolve) => setTimeout(resolve, 1000)
        );
    }

    async wait(date, minutes = 0){ 
        let currentTime = new Date();
        date.setMinutes(date.getMinutes() - minutes);
        while(currentTime < date){
            await this.delay();
            currentTime = new Date();
        }
    }
}

export { Timer };
