/*
 * The records in the time_slots array aren't handled properly by Snaplet, so the list of
 * records is written in string form compatible with Postgres
 */

export const collectionCentresWithStringSlots = [
    {
        name: "Brixton Hill - Methodist Church",
        acronym: "BH-MC",
        is_delivery: false,
        time_slots: [
            // eslint-disable-next-line quotes
            '"(10:00:00,f)","(10:15:00,f)","(10:30:00,t)","(10:45:00,t)","(11:00:00,f)","(11:15:00,f)","(11:30:00,t)","(11:45:00,t)","(12:00:00,t)","(13:00:00,t)","(13:30:00,t)"',
        ],
        available_days: [
            // eslint-disable-next-line quotes
            '"(Monday,t)","(Tuesday,t)","(Wednesday,t)","(Thursday,t)","(Friday,t)","(Saturday,f)","(Sunday,f)"',
        ],
    },
    {
        name: "Clapham - St Stephens Church",
        acronym: "CLP-SC",
        is_delivery: false,
        time_slots: [
            // eslint-disable-next-line quotes
            '"(12:00:00,t)","(12:15:00,t)","(12:30:00,t)","(12:45:00,t)","(13:00:00,f)","(13:15:00,f)","(13:30:00,f)","(13:45:00,f)","(14:00:00,t)","(14:30:00,t)","(15:00:00,t)"',
        ],
        available_days: [
            // eslint-disable-next-line quotes
            '"(Monday,t)","(Tuesday,t)","(Wednesday,t)","(Thursday,t)","(Friday,t)","(Saturday,f)","(Sunday,f)"',
        ],
    },
    {
        name: "Delivery",
        acronym: "DLVR",
        is_delivery: true,
        time_slots: [],
        available_days: [],
    },
];
