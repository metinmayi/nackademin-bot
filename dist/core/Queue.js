export class Queue {
    constructor() {
        this.queue = [];
        this.length = 0;
    }
    isUserInQueue(user) {
        return this.queue.some(({ id }) => id === user.id);
    }
    addUser(user) {
        this.queue.push(user);
        this.length = this.queue.length;
        user
            .send(`Du har lagts till i kön på plats: ${this.length}.\nDu kommer få ett meddelande när du är näst på tur.`)
            .catch((error) => console.log({ timestamp: new Date().toLocaleString(), addUser: error }));
    }
    next() {
        this.queue.shift();
        this.length = this.queue.length;
    }
    reset() {
        this.queue = [];
        this.length = 0;
    }
}
