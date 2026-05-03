import seedrandom from "seedrandom";

export function getFormattedVoucherNumber(seed: string): string {
    const randomNumberGenerator = seedrandom(seed);

    const useSixDigits = randomNumberGenerator() < 0.5;
    const firstPartLength = useSixDigits ? 6 : 5;

    const firstPart = Math.floor(randomNumberGenerator() * Math.pow(10, firstPartLength))
        .toString()
        .padStart(firstPartLength, "0");

    const secondPart = Math.floor(randomNumberGenerator() * 1_000_000)
        .toString()
        .padStart(6, "0");

    return `E-${firstPart}-${secondPart}`;
}

export const possibleReferralAgency = [
    "Hope Community Services",
    "St. Vincent Outreach",
    "United Family Aid",
    "Helping Hands Network",
    "Goodwill Support Centre",
    "Bridge to Care",
    "Sunrise Social Services",
    "Compassion Connect",
    "Neighborhood Relief Agency",
    "FaithWorks Resource Center",
];

export const defaultParcelNotes = ["E.g., Contains frozen items — deliver promptly.", null];
