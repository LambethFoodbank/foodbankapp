import { beforeEach, expect, it } from "@jest/globals";
import { familySearch, fullNameSearch, phoneSearch, postcodeSearch } from "./databaseFilters";
import { DbParcelRow } from "@/databaseUtils";
import { DbQuery, ServerSideFilterMethod } from "@/components/Tables/Filters";

const logID = "a2adb0ba-873e-506b-abd1-8cd1782923c8";

jest.mock("@/logger/logger", () => ({
    logErrorReturnLogId: jest.fn(() => Promise.resolve(logID)),
}));

jest.mock("@/supabaseClient", () => {
    return { default: jest.fn() };
});

const mockQueryWithOrAppended = jest.fn();
const mockOr: jest.Mock = jest.fn(() => mockQueryWithOrAppended);

describe("test for full name filter", () => {
    let mockDbQuery: DbQuery<DbParcelRow>;
    let fullNameFilter: ServerSideFilterMethod<DbParcelRow, string>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Arrange
        mockDbQuery = {} as DbQuery<DbParcelRow>;
        mockDbQuery.or = mockOr;

        fullNameFilter = fullNameSearch<DbParcelRow>("client_full_name", "client_is_active");
    });

    it("should leave the query unchanged when name input is empty", () => {
        // Act
        const result = fullNameFilter(mockDbQuery, "");

        // Assert
        expect(result).toBe(mockDbQuery);
        expect(mockOr).toHaveBeenCalledTimes(0);
    });

    it("should leave the query unchanged when name input just whitespace substrings", () => {
        // Act
        const result = fullNameFilter(mockDbQuery, " , ,,   ,");

        // Assert
        expect(result).toBe(mockDbQuery);
        expect(mockOr).toHaveBeenCalledTimes(0);
    });

    it("should generate expected search clause for input with no commas", () => {
        // Act
        const result = fullNameFilter(mockDbQuery, "  input to be trimmed    ");

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith(
            "and(client_is_active.is.true, client_full_name.ilike.%input to be trimmed%)"
        );
    });

    it("should generate expected search clause for input with commas", () => {
        // Act
        const result = fullNameFilter(
            mockDbQuery,
            "substring1,sub string2, sub-string3 , substring4"
        );

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith(
            "and(client_is_active.is.true, client_full_name.ilike.%substring1%)," +
                "and(client_is_active.is.true, client_full_name.ilike.%sub string2%)," +
                "and(client_is_active.is.true, client_full_name.ilike.%sub-string3%)," +
                "and(client_is_active.is.true, client_full_name.ilike.%substring4%)"
        );
    });

    it("should interpret '(Deleted Client)' as possibly a deleted client", () => {
        // Act
        const result = fullNameFilter(mockDbQuery, "(Deleted Client)");

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith(
            "or(client_full_name.ilike.%Deleted Client%, client_is_active.is.false)"
        );
    });

    it("should case-insensitively interpret part of '(Deleted Client)' as possibly matching a deleted client", () => {
        // Act
        const result = fullNameFilter(mockDbQuery, "del");

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith(
            "or(client_full_name.ilike.%del%, client_is_active.is.false)"
        );
    });

    it("should generate expected search clause for input with commas including special substrings", () => {
        // Act
        const result = fullNameFilter(
            mockDbQuery,
            " substring1  ,LETED, sub string2 , ,sub  string3"
        );

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith(
            "and(client_is_active.is.true, client_full_name.ilike.%substring1%)," +
                "or(client_full_name.ilike.%LETED%, client_is_active.is.false)," +
                "and(client_is_active.is.true, client_full_name.ilike.%sub string2%)," +
                "and(client_is_active.is.true, client_full_name.ilike.%sub  string3%)"
        );
    });
});

describe("test for postcode filter", () => {
    let mockDbQuery: DbQuery<DbParcelRow>;
    let postcodeFilter: ServerSideFilterMethod<DbParcelRow, string>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Arrange
        mockDbQuery = {} as DbQuery<DbParcelRow>;
        mockDbQuery.or = mockOr;

        postcodeFilter = postcodeSearch<DbParcelRow>("client_address_postcode", "client_is_active");
    });

    it("should leave the query unchanged when postcode input is empty", () => {
        // Act
        const result = postcodeFilter(mockDbQuery, "");

        // Assert
        expect(result).toBe(mockDbQuery);
        expect(mockOr).toHaveBeenCalledTimes(0);
    });

    it("should leave the query unchanged when postcode input just whitespace substrings", () => {
        // Act
        const result = postcodeFilter(mockDbQuery, " , ,,   ,");

        // Assert
        expect(result).toBe(mockDbQuery);
        expect(mockOr).toHaveBeenCalledTimes(0);
    });

    it("should generate expected search clause for input with no commas", () => {
        // Act
        const result = postcodeFilter(mockDbQuery, "  input to be trimmed    ");

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith(
            "and(client_is_active.is.true, client_address_postcode.ilike.%input to be trimmed%)"
        );
    });

    it("should generate expected search clause for input with commas", () => {
        // Act
        const result = postcodeFilter(
            mockDbQuery,
            "substring1,sub string2, sub-string3 , substring4"
        );

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith(
            "and(client_is_active.is.true, client_address_postcode.ilike.%substring1%)," +
                "and(client_is_active.is.true, client_address_postcode.ilike.%sub string2%)," +
                "and(client_is_active.is.true, client_address_postcode.ilike.%sub-string3%)," +
                "and(client_is_active.is.true, client_address_postcode.ilike.%substring4%)"
        );
    });

    it("should interpret '-' as Deleted Client", () => {
        // Act
        const result = postcodeFilter(mockDbQuery, "-");

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith("client_is_active.is.false");
    });

    it("should interpret 'nfa' as possibly not having a postcode", () => {
        // Act
        const result = postcodeFilter(mockDbQuery, "nfa");

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith(
            "and(client_is_active.is.true, or(client_address_postcode.ilike.%nfa%, client_address_postcode.is.null))"
        );
    });

    it("should interpret 'NFA' as possibly not having a postcode", () => {
        // Act
        const result = postcodeFilter(mockDbQuery, "NFA");

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith(
            "and(client_is_active.is.true, or(client_address_postcode.ilike.%NFA%, client_address_postcode.is.null))"
        );
    });

    it("should generate expected search clause for input with commas including special substrings", () => {
        // Act
        const result = postcodeFilter(
            mockDbQuery,
            " substring1  ,-, sub string2 , nfa,sub  string3"
        );

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith(
            "and(client_is_active.is.true, client_address_postcode.ilike.%substring1%)," +
                "client_is_active.is.false," +
                "and(client_is_active.is.true, client_address_postcode.ilike.%sub string2%)," +
                "and(client_is_active.is.true, or(client_address_postcode.ilike.%nfa%, client_address_postcode.is.null))," +
                "and(client_is_active.is.true, client_address_postcode.ilike.%sub  string3%)"
        );
    });
});

describe("test for phone number filter", () => {
    let mockDbQuery: DbQuery<DbParcelRow>;
    let phoneFilter: ServerSideFilterMethod<DbParcelRow, string>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Arrange
        mockDbQuery = {} as DbQuery<DbParcelRow>;
        mockDbQuery.or = mockOr;

        phoneFilter = phoneSearch<DbParcelRow>(
            "client_phone_number",
            "client_additional_phone_numbers_text",
            "client_is_active"
        );
    });

    it("should leave the query unchanged when phone input is empty", () => {
        // Act
        const result = phoneFilter(mockDbQuery, "");

        // Assert
        expect(result).toBe(mockDbQuery);
        expect(mockOr).toHaveBeenCalledTimes(0);
    });

    it("should leave the query unchanged when phone input just whitespace substrings", () => {
        // Act
        const result = phoneFilter(mockDbQuery, " , ,,   ,");

        // Assert
        expect(result).toBe(mockDbQuery);
        expect(mockOr).toHaveBeenCalledTimes(0);
    });

    it("should generate expected search clause for input with no commas", () => {
        // Act
        const result = phoneFilter(mockDbQuery, "  input to be trimmed    ");

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith(
            "and(client_is_active.is.true, client_phone_number.ilike.%input to be trimmed%)"
        );
    });

    it("should generate expected search clause for input with commas", () => {
        // Act
        const result = phoneFilter(mockDbQuery, "substring1,sub string2, sub-string3 , substring4");

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith(
            "and(client_is_active.is.true, client_phone_number.ilike.%substring1%)," +
                "and(client_is_active.is.true, client_phone_number.ilike.%sub string2%)," +
                "and(client_is_active.is.true, client_phone_number.ilike.%sub-string3%)," +
                "and(client_is_active.is.true, client_phone_number.ilike.%substring4%)"
        );
    });

    it("should interpret '-' as potentially a deleted client, but also hyphen in the number", () => {
        // Act
        const result = phoneFilter(mockDbQuery, "-");

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith(
            "or(client_is_active.is.false, client_phone_number.ilike.%-%)"
        );
    });

    it("should generate expected search clause for input with commas including special substrings", () => {
        // Act
        const result = phoneFilter(mockDbQuery, " substring1  ,-, sub string2 , ,sub  string3");

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith(
            "and(client_is_active.is.true, client_phone_number.ilike.%substring1%)," +
                "or(client_is_active.is.false, client_phone_number.ilike.%-%)," +
                "and(client_is_active.is.true, client_phone_number.ilike.%sub string2%)," +
                "and(client_is_active.is.true, client_phone_number.ilike.%sub  string3%)"
        );
    });
});

describe("test for family filter", () => {
    let mockDbQuery: DbQuery<DbParcelRow>;
    let familyFilter: ServerSideFilterMethod<DbParcelRow, string>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Arrange
        mockDbQuery = {} as DbQuery<DbParcelRow>;
        mockDbQuery.or = mockOr;

        familyFilter = familySearch<DbParcelRow>("family_count", "client_is_active");
    });

    it("should leave the query unchanged when phone input is empty", () => {
        // Act
        const result = familyFilter(mockDbQuery, "");

        // Assert
        expect(result).toBe(mockDbQuery);
        expect(mockOr).toHaveBeenCalledTimes(0);
    });

    it("should leave the query unchanged when phone input just whitespace substrings", () => {
        // Act
        const result = familyFilter(mockDbQuery, " , ,,   ,");

        // Assert
        expect(result).toBe(mockDbQuery);
        expect(mockOr).toHaveBeenCalledTimes(0);
    });

    it("should generate expected search clause for numerical input with no commas", () => {
        // Act
        const result = familyFilter(mockDbQuery, "  6    ");

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith("and(client_is_active.is.true, family_count.eq.6)");
    });

    it("should generate expected search clause for input with commas", () => {
        // Act
        const result = familyFilter(mockDbQuery, "1,3 , 5");

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith(
            "and(client_is_active.is.true, family_count.eq.1)," +
                "and(client_is_active.is.true, family_count.eq.3)," +
                "and(client_is_active.is.true, family_count.eq.5)"
        );
    });

    it("should interpret '-' as a deleted client", () => {
        // Act
        const result = familyFilter(mockDbQuery, "-");

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith("client_is_active.is.false");
    });

    it("should match part of the string 'single' with a family size of 1 or less", () => {
        // Act
        const result = familyFilter(mockDbQuery, "singl");

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith("and(client_is_active.is.true, family_count.lte.1)");
    });

    it("should match part of the string 'family of' with a family size of 2 or more", () => {
        // Act
        const result = familyFilter(mockDbQuery, "fam");

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith("and(client_is_active.is.true, family_count.gte.2)");
    });

    it("should match numbers greater than 10 with a family size of 10 or more", () => {
        // Act
        const result = familyFilter(mockDbQuery, "12");

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith("and(client_is_active.is.true, family_count.gte.10)");
    });

    it("should interpret a non-numeric string as a query that returns no rows", () => {
        // Act
        const result = familyFilter(mockDbQuery, "non-numeric");

        // Assert- family size of -1 should return no rows
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith("and(client_is_active.is.true, family_count.eq.-1)");
    });

    it("should generate expected search clause for input with commas including special substrings", () => {
        // Act
        const result = familyFilter(mockDbQuery, " 2  ,7, - , ,carrot, 11,single");

        // Assert
        expect(result).toBe(mockQueryWithOrAppended);
        expect(mockOr).toHaveBeenCalledWith(
            "and(client_is_active.is.true, family_count.eq.2)," +
                "and(client_is_active.is.true, family_count.eq.7)," +
                "client_is_active.is.false," +
                "and(client_is_active.is.true, family_count.eq.-1)," +
                "and(client_is_active.is.true, family_count.gte.10)," +
                "and(client_is_active.is.true, family_count.lte.1)"
        );
    });
});
