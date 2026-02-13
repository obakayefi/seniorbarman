import { EventEmitter } from "events";

// Singleton EventEmitter instance
class GlobalEventEmitter extends EventEmitter { }

const globalEventEmitter = (global as any).eventEmitter || new GlobalEventEmitter();

if (process.env.NODE_ENV !== "production") {
    (global as any).eventEmitter = globalEventEmitter;
}

export default globalEventEmitter;
