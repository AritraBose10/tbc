export type Room = string;
export type Floor = {
    id: string;
    name: string;
    rooms: Room[];
};
export type Building = {
    id: string;
    name: string;
    floors: Floor[];
};

export const PREDESTINED_LOCATIONS: Building[] = [
    {
        id: "b1",
        name: "Main Block",
        floors: [
            { id: "f1", name: "Ground Floor", rooms: ["G01", "G02", "G03", "G04"] },
            { id: "f2", name: "First Floor", rooms: ["101", "102", "103", "104"] },
            { id: "f3", name: "Second Floor", rooms: ["201", "202", "203", "204"] },
        ]
    },
    {
        id: "b2",
        name: "North Wing",
        floors: [
            { id: "n1", name: "Floor 1", rooms: ["N101", "N102", "N103", "N104"] },
            { id: "n2", name: "Floor 2", rooms: ["N201", "N202", "N203", "N204"] },
        ]
    },
    {
        id: "b3",
        name: "South Wing",
        floors: [
            { id: "s1", name: "Ground Floor", rooms: ["S01", "S02", "S03", "S04"] },
            { id: "s2", name: "First Floor", rooms: ["S101", "S102", "S103", "S104", "S105"] },
        ]
    }
];
