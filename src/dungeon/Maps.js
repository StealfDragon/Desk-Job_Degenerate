class Maps {
    static maps = {
        map1 : {
            rooms: {
                r1: {
                    type : Room.START_TYPE,
                    connections : {r2: "UP"}
                },
                r2: {
                    type : Room.COMBAT_TYPE,
                    connections : {}
                },
            }
        }
    }
}