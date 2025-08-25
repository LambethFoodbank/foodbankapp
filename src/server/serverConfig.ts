interface ServerConfig {
    environment: string;
    cloudWatch: CloudWatchConfig | null;
}

interface CloudWatchConfig {
    logGroupName: string;
    logStreamName: string;
    accessKey: string;
    secretAccessKey: string;
    logLevel: string;
}

const PROD_LIKE_ENVIRONMENTS = ["production", "staging", "dev", "intern-dev"];

const getRequiredEnvironmentVariable = (variableName: string): string => {
    const value = process.env[variableName];
    if (value === undefined) {
        throw new Error(`Environment variable ${variableName} is not found in environment`);
    }
    return value;
};

function getServerConfig(): ServerConfig {
    const environment = getRequiredEnvironmentVariable("NEXT_PUBLIC_ENVIRONMENT");
    return { environment, cloudWatch: getCloudWatchConfig(environment) };
}

function getCloudWatchConfig(environment: string): CloudWatchConfig | null {
    if (!PROD_LIKE_ENVIRONMENTS.includes(environment)) {
        return null;
    }
    const logGroupName = getRequiredEnvironmentVariable("CLOUDWATCH_LOG_GROUP");
    const logStreamName = getRequiredEnvironmentVariable("CLOUDWATCH_LOG_STREAM");
    const accessKey = getRequiredEnvironmentVariable("CLOUDWATCH_ACCESS_KEY");
    const secretAccessKey = getRequiredEnvironmentVariable("CLOUDWATCH_SECRET_ACCESS_KEY");
    const logLevel = environment === "production" ? "warn" : "info";

    return {
        logGroupName,
        logStreamName,
        accessKey,
        secretAccessKey,
        logLevel,
    };
}

const serverConfig = getServerConfig();

export default serverConfig;
