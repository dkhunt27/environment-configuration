import { envVarInterpolation, extractEnvConfig, parseConfigFromFile, processInstructions } from './utilities';

/*
processEnvConfigFile

this takes a config file that has base/default and env specific variables and merges them into a final config
using the base as the starting values and then overrides any matching values with those from the env specific

expected config file format:
{
   base: {
      varA: 'baseA',
      varB: 'baseB',
   },
   env1: {
      varA: 'env1A',
      varC: 'env1C'
   }
 }

expected output for appEnv='env1'
{
  varA: 'env1A',
  varB: 'baseB',
  varC: 'env1C'
}

inputs
  appEnv: string           -- the env name to use to override any base values
  pathToEnvConfig: string  -- the path to the config file
  logInfo: function        -- the function to use to log out messages
  logWarn: function        -- the function to use to log out warnings
*/
export const processEnvConfigFile = async <T extends Record<string, unknown>>(params: {
  appEnv: string;
  pathToEnvConfig: string;
  logInfo: (msg: string) => void;
  logWarn: (msg: string) => void;
}): Promise<T> => {
  const { appEnv, pathToEnvConfig, logInfo, logWarn } = params;

  // parse json from env config file
  const config = parseConfigFromFile({
    pathToEnvConfig
  });

  return processInMemoryEnvConfig<T>({ appEnv, config, logInfo, logWarn });
};

export const processEnvConfigFileWithConsole = async <T extends Record<string, unknown>>(params: {
  appEnv: string;
  pathToEnvConfig: string;
}): Promise<T> => {
  const { appEnv, pathToEnvConfig } = params;

  return processEnvConfigFile<T>({
    appEnv,
    pathToEnvConfig,
    logInfo: console.log,
    logWarn: console.warn
  });
};

/*
processInMemoryEnvConfig

this takes a config variable that has base/default and env specific variables and merges them into a final config
using the base as the starting values and then overrides any matching values with those from the env specific

expected config var format:
{
   base: {
      varA: 'baseA',
      varB: 'baseB',
   },
   env1: {
      varA: 'env1A',
      varC: 'env1C'
   }
 }

expected output for appEnv='env1'
{
  varA: 'env1A',
  varB: 'baseB',
  varC: 'env1C'
}

inputs
  appEnv: string           -- the env name to use to override any base values
  config: string           -- the config data to process
  logInfo: function        -- the function to use to log out messages
  logWarn: function        -- the function to use to log out warnings
*/
export const processInMemoryEnvConfig = async <T extends Record<string, unknown>>(params: {
  appEnv: string;
  config: Record<string, unknown>;
  logInfo: (msg: string) => void;
  logWarn: (msg: string) => void;
}): Promise<T> => {
  const { appEnv, config, logInfo, logWarn } = params;

  // replace any ${process.env.VARS} (mainly replacing ${process.env.APP_ENV})
  const configCompiled = envVarInterpolation({ config });

  // extract base and merge with appEnv
  let envConfig = extractEnvConfig({
    config: configCompiled,
    appEnv,
    logWarn
  });

  envConfig = await processInstructions({ config: envConfig, logInfo });

  return envConfig as T;
};

export const processInMemoryEnvConfigWithConsole = async <T extends Record<string, unknown>>(params: {
  appEnv: string;
  config: Record<string, unknown>;
}): Promise<T> => {
  const { appEnv, config } = params;

  return processInMemoryEnvConfig<T>({
    appEnv,
    config,
    logInfo: console.log,
    logWarn: console.warn
  });
};
