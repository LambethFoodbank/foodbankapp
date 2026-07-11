import seedrandom from "seedrandom";

export const earliestParcelOrEventDate = new Date(2026, 5, 1); // 2026-06-01
export const latestEventDate = new Date(2026, 11, 1); // 2026-12-01
export const farFutureDate = new Date(2027, 5, 1); // 2027-06-01
export const parcelCreationDateTime = new Date("2025-12-31T12:00:00");

export function getPseudoRandomDateBetween(start: Date, end: Date, seed: string): Date {
    const randomNumberGenerator = seedrandom(seed);

    return new Date(start.getTime() + randomNumberGenerator() * (end.getTime() - start.getTime()));
}
