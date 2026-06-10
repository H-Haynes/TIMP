import mitt from "mitt"
import type { AppEvents } from "@/types/events"

const eventBus = mitt<AppEvents>()

export default eventBus
