import { redirect } from "next/navigation";
import { logErrorReturnLogId } from "@/logger/logger";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies, UnsafeUnwrappedCookies } from "next/headers";

export async function GET(request: Request): Promise<Response> {
    const { searchParams } = new URL(request.url);
    const authCode = searchParams.get("code");

    if (!authCode) {
        return logErrorAndGetErrorResponse({
            logMessage: "Reset password route was visited without authorisation code.",
            responseMessage: (logId) =>
                "Failed to authenticate. You may have used the same password reset link more than once. " +
                `If this is not the case, please contact the admins with the following log ID. Log ID: ${logId}`,
        });
    }

    try {
        const supabase = createRouteHandlerClient({ cookies: async () => await cookies() as unknown as UnsafeUnwrappedCookies });

        const { error } = await supabase.auth.exchangeCodeForSession(authCode);

        if (error) {
            return logErrorAndGetErrorResponse({
                logMessage:
                    "Failed to exchange authorisation code for a session when resetting password.",
                responseMessage: (logId) =>
                    `Failed to authenticate. Please contact the admins with the following log ID. Log ID: ${logId}`,
                error,
            });
        }
    } catch (error) {
        return logErrorAndGetErrorResponse({
            logMessage:
                "Failed to exchange authorisation code when resetting password, " +
                "likely because the password reset link is visited in a different session than the one that requested the password reset link.",
            responseMessage: (logId) =>
                "Failed to authenticate. " +
                "You may have visited the password reset link in a different device or browser than the one where you requested the password reset link. " +
                `If this is not the case, please contact the admins with the following log ID. Log ID: ${logId}`,
            error,
        });
    }

    return redirect("/update-password");
}

async function logErrorAndGetErrorResponse({
    logMessage,
    responseMessage,
    error,
}: {
    logMessage: string;
    responseMessage: (logId: string) => string;
    error?: unknown;
}): Promise<Response> {
    const logId = await logErrorReturnLogId(logMessage, { error });
    return Response.json(responseMessage(logId));
}
