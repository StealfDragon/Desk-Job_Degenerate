class Room {
    static COMBAT_TYPE = "COMBAT"
    static START_TYPE = "START"
    static REST_TYPE = "REST"
    static BOSS_TYPE = "BOSS"

    static DIR_UP = "UP"

    constructor() {
        this.type = Room.START_TYPE
        this.connections = []
    }
}