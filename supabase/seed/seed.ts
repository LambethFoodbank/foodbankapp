/*
This file is not type checked / linted in the pipeline as createSeedClient requires the database definition to be in node_modules/.snaplet
which only gets generated after running npx snaplet generate with local database running.
 */

import { createSeedClient } from "@snaplet/seed";
import { copycat } from "@snaplet/copycat";
import { packingSlots } from "./packingSlotsSeed";
import {
    booleansWeightedToTrue,
    possibleBabyOtherItems,
    possibleCookingFacilities,
    possibleListTypesWeighted,
    possibleDietaryRequirements,
    possibleHygieneOtherItems,
    possibleOtherItems,
    possiblePostCodes,
    possiblePets,
    possibleSignpostingCallReasons,
} from "./clientsSeed";
import { genders } from "./families";
import { collectionCentresWithStringSlots } from "./collectionCentresSeed";
import { listsSeedRequired } from "./listsSeed";
import {
    earliestParcelOrEventDate,
    farFutureDate,
    getPseudoRandomDateBetween,
    latestEventDate,
    parcelCreationDateTime,
} from "./dateData";
import {
    eventNamesWithDriverData,
    eventNamesWithNoData,
    eventNamesWithNumberData,
} from "./eventsSeed";

const main = async (): Promise<never> => {
    const seed = await createSeedClient({
        dryRun: process.env.DRY !== "0",
    });

    await seed.$resetDatabase(); // Clears all existing data in the database, but keep the structure

    await seed.packing_slots(packingSlots);

    const today = new Date();
    const thisYear = today.getFullYear();

    await seed.clients((generate) =>
        generate(750, {
            full_name: (ctx) => copycat.fullName(ctx.seed),
            phone_number: (ctx) => copycat.phoneNumber(ctx.seed),
            address_1: (ctx) => copycat.streetAddress(ctx.seed),
            address_2: (ctx) => copycat.streetAddress(ctx.seed),
            address_town: (ctx) => copycat.city(ctx.seed),
            address_county: (ctx) => copycat.state(ctx.seed),
            address_postcode: (ctx) => copycat.oneOf(ctx.seed, possiblePostCodes),
            delivery_instructions: (ctx) => copycat.sentence(ctx.seed, { maxWords: 20 }),
            family_id: (ctx) => copycat.uuid(ctx.seed),
            default_list: (ctx) => copycat.oneOf(ctx.seed, possibleListTypesWeighted),
            cooking_facilities: (ctx) =>
                copycat.someOf(
                    ctx.seed,
                    [0, possibleCookingFacilities.length],
                    possibleCookingFacilities
                ),
            dietary_requirements: (ctx) =>
                copycat.someOf(
                    ctx.seed,
                    [0, possibleDietaryRequirements.length],
                    possibleDietaryRequirements
                ),
            pet_food: (ctx) => copycat.someOf(ctx.seed, [0, possiblePets.length], possiblePets),
            hygiene_pads: (ctx) => copycat.oneOf(ctx.seed, [null, copycat.digit(ctx.seed)]),
            hygiene_tampons: (ctx) => copycat.oneOf(ctx.seed, [null, copycat.digit(ctx.seed)]),
            hygiene_other_items: (ctx) =>
                copycat.someOf(
                    ctx.seed,
                    [0, possibleHygieneOtherItems.length],
                    possibleHygieneOtherItems
                ),
            baby_nappies: (ctx) => copycat.oneOf(ctx.seed, [null, copycat.digit(ctx.seed)]),
            baby_formula: (ctx) =>
                copycat.oneOf(ctx.seed, [null, copycat.sentence(ctx.seed, { maxWords: 3 })]),
            baby_food: (ctx) =>
                copycat.oneOf(ctx.seed, [null, copycat.sentence(ctx.seed, { maxWords: 5 })]),
            baby_other_items: (ctx) =>
                copycat.someOf(
                    ctx.seed,
                    [0, possibleBabyOtherItems.length],
                    possibleBabyOtherItems
                ),
            other_items: (ctx) =>
                copycat.someOf(ctx.seed, [0, possibleOtherItems.length], possibleOtherItems),
            extra_information: (ctx) => copycat.sentence(ctx.seed, { maxWords: 20 }),
            flagged_for_attention: (ctx) => copycat.bool(ctx.seed),
            signposting_call_required: (ctx) => copycat.bool(ctx.seed),
            signposting_call_reasons: (ctx) =>
                copycat.someOf(
                    ctx.seed,
                    [0, possibleSignpostingCallReasons.length],
                    possibleSignpostingCallReasons
                ),
            is_active: (ctx) => copycat.oneOf(ctx.seed, booleansWeightedToTrue),
            families: (generateFamily) =>
                generateFamily(
                    { min: 1, max: 8 },
                    {
                        birth_year: (ctx) =>
                            copycat.int(ctx.seed, { min: thisYear - 120, max: thisYear }),
                        birth_month: (ctx) =>
                            copycat.oneOf(ctx.seed, [
                                null,
                                copycat.int(ctx.seed, { min: 1, max: 12 }),
                            ]),
                        gender: (ctx) => copycat.oneOf(ctx.seed, genders),
                    }
                ),
            notes: (ctx) => copycat.sentence(ctx.seed, { maxWords: 25 }),
        })
    );

    await seed.families(
        (generate) =>
            generate(100, {
                birth_year: thisYear,
                birth_month: (ctx) =>
                    copycat.oneOf(ctx.seed, [null, copycat.int(ctx.seed, { min: 1, max: 12 })]),
                gender: (ctx) => copycat.oneOf(ctx.seed, genders),
            }),
        { connect: true }
    );

    await seed.collection_centres(collectionCentresWithStringSlots);

    await seed.lists(listsSeedRequired);

    await seed.parcels(
        (generate) =>
            generate(7500, {
                voucher_number: (ctx) =>
                    copycat.word(ctx.seed, { capitalize: true, minSyllables: 3 }),
                packing_date: (ctx) =>
                    getPseudoRandomDateBetween(earliestParcelOrEventDate, farFutureDate, ctx.seed),
                collection_datetime: (ctx) =>
                    getPseudoRandomDateBetween(earliestParcelOrEventDate, farFutureDate, ctx.seed),
                list_type: (ctx) => copycat.oneOf(ctx.seed, possibleListTypesWeighted),
                created_at: parcelCreationDateTime,
                flagged_for_attention: (ctx) => copycat.bool(ctx.seed),
            }),
        { connect: true }
    );

    for (const status of eventNamesWithNumberData) {
        await seed.events(
            (generate) =>
                generate(1000, {
                    new_parcel_status: status,
                    event_data: (ctx) => copycat.int(ctx.seed, { min: 1, max: 10 }).toString(),
                    timestamp: (ctx) =>
                        getPseudoRandomDateBetween(
                            earliestParcelOrEventDate,
                            latestEventDate,
                            ctx.seed
                        ),
                }),
            { connect: true }
        );
    }

    for (const status of eventNamesWithNoData) {
        await seed.events(
            (generate) =>
                generate(1500, {
                    new_parcel_status: status,
                    event_data: () => "",
                    timestamp: (ctx) =>
                        getPseudoRandomDateBetween(
                            earliestParcelOrEventDate,
                            latestEventDate,
                            ctx.seed
                        ),
                }),
            { connect: true }
        );
    }

    for (const status of eventNamesWithDriverData) {
        await seed.events(
            (generate) =>
                generate(1000, {
                    new_parcel_status: status,
                    event_data: (ctx) => `with ${copycat.firstName(ctx.seed)}`,
                    timestamp: (ctx) =>
                        getPseudoRandomDateBetween(
                            earliestParcelOrEventDate,
                            latestEventDate,
                            ctx.seed
                        ),
                }),
            { connect: true }
        );
    }

    process.exit();
};

main();
