import { createServer, IncomingMessage, ServerResponse } from 'http';
import type { Event, User, Booking } from './domain'
import { findById } from './domain.ts'
import path from "node:path"
import fs from "node:fs/promises"

const PORT = 3000
const DATA_PATH = path.join(import.meta.dirname, "../data/events.json")
const START_TIME = Date.now()

async function getEvents(): Promise<Event[]> {
    try {
        const rawData = await fs.readFile(DATA_PATH, "utf-8");
        let data = JSON.parse(rawData) as Event[];
        return data
    }
    catch (err) {
        console.error(err)
        throw err
    }
}

function returnJSON(res: ServerResponse, statusCode: number, payload: unknown): void {
    res.writeHead(statusCode, {"Content-Type": "application/json"})
    res.end(JSON.stringify(payload))
}

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    if (req.url == "/health" && req.method == "GET"){
        let uptime = Math.floor((Date.now() - START_TIME) / 1000)
        return returnJSON(res, 200, {"message": "I am alive", "uptime": `${uptime}`})
    }
    if (req.url === "/events") {
        try {
            const events = await getEvents();
            return returnJSON(res, 200, events);
        } catch {
            return returnJSON(res, 500, { error: "Internal server error: could not load events data." });
        }
    }

    if (req.url && req.url.startsWith("/events/")) {
        const segments = req.url.split("/");
        const id = segments[2];

        if (!id || segments.length > 3) {
            return returnJSON(res, 404, { error: "Not found" });
        }

        try {
            const events = await getEvents();
            const matchedEvent = findById(events, id);

        if (!matchedEvent) {
            return returnJSON(res, 404, { error: "Event not found" });
        }

        return returnJSON(res, 200, matchedEvent);
        }
        catch {
            return returnJSON(res, 500, { error: "Internal server error: could not process event request." });
        }
    }

    return returnJSON(res, 404, { error: "Not found" });
})

server.listen(PORT, () => {
    console.log("welcome")
})

