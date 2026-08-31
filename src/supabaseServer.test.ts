import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { getSupabaseServerComponentClient } from "./supabaseServer";

let cookieStore: any = {};
const mockCookies = jest.fn(() => Promise.resolve(cookieStore)) as any;
const mockCreateServerComponentClient = jest.fn((config: any) => ({
    __client: true,
    config,
})) as any;

jest.mock("next/headers", () => ({
    cookies: mockCookies,
}));

jest.mock("@supabase/auth-helpers-nextjs", () => ({
    createServerComponentClient: mockCreateServerComponentClient,
}));

describe("getSupabaseServerComponentClient", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        cookieStore = { get: jest.fn() };
    });

    it("awaits the cookies store once before creating the Supabase client", async () => {
        const client = await getSupabaseServerComponentClient();

        expect(mockCookies).toHaveBeenCalledTimes(1);
        expect(mockCreateServerComponentClient).toHaveBeenCalledTimes(1);
        expect(client).toEqual({ __client: true, config: expect.any(Object) });
        const config = (mockCreateServerComponentClient.mock.calls[0] as any)[0] as {
            cookies: () => any;
        };
        expect(config.cookies()).toBe(cookieStore);
    });
});
