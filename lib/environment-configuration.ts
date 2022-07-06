import { envVarInterpolation, extractEnvConfig, parseEnvConfigFromFile, processInstructions } from './utilities';

/*
processEnvConfig -- main entry point

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

export const processEnvConfig = async <T extends Record<string, unknown>>(params: {
  appEnv: string;
  pathToEnvConfig: string;
  logInfo: (msg: string) => void;
  logWarn: (msg: string) => void;
}): Promise<T> => {
  const { appEnv, pathToEnvConfig, logInfo, logWarn } = params;

  // parse json from env config file
  const envConfig = parseEnvConfigFromFile({
    pathToEnvConfig
  });

  // replace any ${process.env.VARS} (mainly replacing ${process.env.APP_ENV})
  const envConfigCompiled = envVarInterpolation(envConfig);

  // extract base and merge with appEnv
  let ec = extractEnvConfig({
    config: envConfigCompiled,
    appEnv,
    pathToEnvConfig,
    logWarn
  });

  ec = await processInstructions({ config: ec, logInfo });

  return ec as T;
};
