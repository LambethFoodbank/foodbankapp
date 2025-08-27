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
    possibleBabyFoods,
    possibleBabyFormula,
    defaultNotes,
    defaultDeliveryInstructions,
    defaultExtraInformation,
    possiblePhoneNumbers,
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
import {
    getFormattedVoucherNumber,
    possibleReferralAgency,
    defaultParcelNotes,
} from "./parcelsSeed";

const main = async (): Promise<never> => {
    const seed = await createSeedClient({
        dryRun: process.env.DRY !== "0",
    });

    await seed.$resetDatabase(); // Clears all existing data in the database, but keep the structure

    await seed.packing_slots(packingSlots);

    await seed.drivers((generate) =>
        generate(25, (ctx) => {
            return {
                name: () => copycat.fullName(ctx.seed),
                circuit_id: () => copycat.uuid(ctx.seed),
            };
        })
    );

    await seed.drivers((generate) =>
        generate(25, (ctx) => {
            return {
                name: () => copycat.fullName(ctx.seed),
                circuit_id: () => null,
            };
        })
    );

    const today = new Date();
    const thisYear = today.getFullYear();

    await seed.clients((generate) =>
        generate(750, (ctx) => {
            const callRequired = copycat.bool(ctx.seed);

            return {
                full_name: () => copycat.fullName(ctx.seed),
                phone_number: () => copycat.phoneNumber(ctx.seed),
                email: () => copycat.email(ctx.seed),
                address_1: () => copycat.streetAddress(ctx.seed),
                address_2: () => copycat.streetAddress(ctx.seed),
                address_town: () => copycat.city(ctx.seed),
                address_county: () => copycat.state(ctx.seed),
                address_postcode: () => copycat.oneOf(ctx.seed, possiblePostCodes),
                delivery_instructions: () => copycat.oneOf(ctx.seed, defaultDeliveryInstructions),
                family_id: () => copycat.uuid(ctx.seed),
                default_list: () => copycat.oneOf(ctx.seed, possibleListTypesWeighted),
                additional_phone_numbers: (ctx) =>
                    copycat.someOf(ctx.seed, [0, 4], possiblePhoneNumbers),
                cooking_facilities: () =>
                    copycat.someOf(
                        ctx.seed,
                        [0, possibleCookingFacilities.length],
                        possibleCookingFacilities
                    ),
                dietary_requirements: () =>
                    copycat.someOf(
                        ctx.seed,
                        [0, possibleDietaryRequirements.length],
                        possibleDietaryRequirements
                    ),
                pet_food: () => copycat.someOf(ctx.seed, [0, possiblePets.length], possiblePets),
                hygiene_pads: () => copycat.oneOf(ctx.seed, [null, copycat.digit(ctx.seed)]),
                hygiene_tampons: () => copycat.oneOf(ctx.seed, [null, copycat.digit(ctx.seed)]),
                hygiene_other_items: () =>
                    copycat.someOf(
                        ctx.seed,
                        [0, possibleHygieneOtherItems.length],
                        possibleHygieneOtherItems
                    ),
                baby_nappies: () => copycat.oneOf(ctx.seed, [null, copycat.digit(ctx.seed)]),
                baby_formula: () => copycat.oneOf(ctx.seed, possibleBabyFormula),
                baby_food: () => copycat.oneOf(ctx.seed, possibleBabyFoods),
                baby_other_items: () =>
                    copycat.someOf(
                        ctx.seed,
                        [0, possibleBabyOtherItems.length],
                        possibleBabyOtherItems
                    ),
                other_items: () =>
                    copycat.someOf(ctx.seed, [0, possibleOtherItems.length], possibleOtherItems),
                extra_information: () => copycat.oneOf(ctx.seed, defaultExtraInformation),
                flagged_for_attention: () => copycat.bool(ctx.seed),
                signposting_call_required: () => callRequired,
                signposting_call_reasons: () =>
                    callRequired
                        ? copycat.someOf(
                              ctx.seed,
                              [1, Math.min(3, possibleSignpostingCallReasons.length)],
                              possibleSignpostingCallReasons
                          )
                        : [],
                is_active: () => copycat.oneOf(ctx.seed, booleansWeightedToTrue),
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
                notes: () => copycat.oneOf(ctx.seed, defaultNotes),
            };
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
            generate(7500, (ctx) => {
                const agency = copycat.bool(ctx.seed)
                    ? copycat.oneOf(ctx.seed, possibleReferralAgency)
                    : "";

                return {
                    voucher_number: () => getFormattedVoucherNumber(ctx.seed),
                    packing_date: () =>
                        getPseudoRandomDateBetween(
                            earliestParcelOrEventDate,
                            farFutureDate,
                            ctx.seed
                        ),
                    collection_datetime: () =>
                        getPseudoRandomDateBetween(
                            earliestParcelOrEventDate,
                            farFutureDate,
                            ctx.seed
                        ),
                    list_type: () => copycat.oneOf(ctx.seed, possibleListTypesWeighted),
                    flagged_for_attention: (ctx) => copycat.bool(ctx.seed),
                    signposting_call_required: (ctx) => copycat.bool(ctx.seed),
                    signposting_call_reasons: (ctx) =>
                        copycat.someOf(
                            ctx.seed,
                            [0, possibleSignpostingCallReasons.length],
                            possibleSignpostingCallReasons
                        ),
                    extra_information: () => copycat.oneOf(ctx.seed, defaultExtraInformation),
                    referral_agency: () => agency,
                    referrer_name: () => (agency ? copycat.fullName(ctx.seed) : ""),
                    referrer_email: () => (agency ? copycat.email(ctx.seed) : ""),
                    referrer_phone: () => (agency ? copycat.phoneNumber(ctx.seed) : ""),
                    notes: () => copycat.oneOf(ctx.seed, defaultParcelNotes),
                    created_at: parcelCreationDateTime,
                };
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
