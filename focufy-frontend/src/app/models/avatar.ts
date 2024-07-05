export interface Chronotype {
    "id": number,
    "chronotypeType": string,
    "maxEnergyType": string,
    "description": string
}

export interface Temper {
    "id": number,
    "temperType": string,
    "strengthType": string,
    "riskType": string,
    "description": string
}

export interface Avatar{
    "id": number,
    "chronotype": Chronotype,
    "temper": Temper,
    "image": string,
    "description": string
}