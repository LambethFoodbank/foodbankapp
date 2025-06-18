export const possibleCookingFacilities = [
    "None",
    "Microwave",
    "Kettle",
    "Hob",
    "Oven",
    "Air Fryer",
    "Toaster",
    "Other",
];

export const possibleDietaryRequirements = [
    "Fresh Fruit",
    "Fresh Veg",
    "Garlic",
    "Ginger",
    "Chillies",
    "Spices",
    "Eggs",
    "Bread",
    "Tea",
    "Coffee",
    "Pasta",
    "Rice",
    "Meat (No Pork)",
    "Meat & Pork",
    "Fish",
    "Gluten Free",
    "Dairy Free",
    "Vegetarian",
    "Vegan",
    "Pescatarian",
    "Halal",
    "Diabetic",
    "Nut Allergy",
    "Seafood Allergy",
];

export const possibleHygieneOtherItems = ["Female Incontinence Pads", "Male Incontinence Pads"];

export const possibleBabyOtherItems = ["Baby Wipes", "Baby Toiletries"];

export const possiblePets = ["Cat", "Dog"];

export const possibleOtherItems = ["Hot Water Bottle", "Blanket"];

export const possibleSignpostingCallReasons = [
    "Benefits",
    "Debt",
    "Housing",
    "Cost of Living",
    "Mental Health",
    "Other",
];

export const possibleDefaultListTypesWeighted = Array(5)
    .fill("regular")
    .concat(Array(1).fill("hotel"));

export const possibleParcelPostCodes = [
    "E1 6AA",
    "E1 6AD",
    "E1 6AG",
    "N13 5UJ",
    "NW6 4RL",
    "SE11 5RD",
    "SE24 0HG",
    "SW14 8DL",
    "SW1P 4JL",
    "SW8 1SY",
    null,
];

export const booleansWeightedToTrue = Array(9).fill(true).concat(Array(1).fill(false));
