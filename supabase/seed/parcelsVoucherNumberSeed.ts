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
