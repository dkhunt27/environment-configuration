import * as fs from 'fs';
import { template as _template } from 'lodash';
import { execute as envVarExecute } from './instructions/env-var-instruction';
import { execute as ssmParamExecute } from './instructions/ssm-param-instruction';

/*
processInstructions

Processes any instructions in the env config.  If no instruction, the value remains unchanged

expected config:
{
  varA: 'env1A',
  varB: 'env::VARB',
  varC: 'ssm::/var/C'
 }

expected output for appEnv='env1'
{
  varA: 'env1A',
  varB: (the value of process.env.VARB),
  varC: (the value of ssm param /var/C)
}

inputs
  config: object           -- the config object to process
  logInfo: function        -- the function to use to log out messages
*/
export const processInstructions = async (params: {
  config: Record<string, unknown>;
  logInfo: (msg: string) => void;
}): Promise<Record<string, unknown>> => {
  const { config, logInfo } = params;

  for (const key in config) {
    if (typeof config[key] === 'string') {
      config[key] = await envVarExecute({ instruction: config[key] as string, logInfo });
      config[key] = await ssmParamExecute({ instruction: config[key] as string, logInfo });
    } else {
      config[key] = await processInstructions({ config: config[key] as Record<string, unknown>, logInfo });
    }
  }

  return config;
};

/* 
parseEnvConfigFromFile

Parses env config json from file path specified

inputs
   pathToEnvConfig: string  -- the path to the config file (used just for log messages)
*/
export const parseEnvConfigFromFile = (params: { pathToEnvConfig: string }): Record<string, unknown> => {
  const { pathToEnvConfig } = params;

  let envConfig = {};
  try {
    envConfig = JSON.parse(fs.readFileSync(pathToEnvConfig).toString());
  } catch (err) {
    throw new Error(
      `Could not JSON parse pathToEnvConfig(${pathToEnvConfig}). ${
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any)?.message || err
      }`
    );
  }

  return envConfig;
};

/*
envVarInterpolation

Compiles/replaces any env vars (${process.env.VAR}) with the values in the env.
Mainly used to inject ${process.env.APP_ENV} into the variable value before instruction processing

expected config file format:
{
    base: {
      varA: '/some/path/baseA',
      varB: '/some/path/${process.env.APP_ENV}/baseB',
   },
   env1: {
      varA: '/some/path//${process.env.APP_ENV}/env1A',
      varC: '/some/path/env1C'
   }
 }

expected output for APP_ENV='dev'
{
   base: {
      varA: '/some/path/baseA',
      varB: '/some/path/dev/baseB',
   },
   env1: {
      varA: '/some/path//dev/env1A',
      varC: '/some/path/env1C'
   }
 }

inputs
  config: object           -- the config object to process
*/
export const envVarInterpolation = (params: { config: Record<string, unknown> }): Record<string, unknown> => {
  const { config } = params;

  for (const key in config) {
    const val = config[key];

    if (typeof val === 'string') {
      const template = _template(val);
      const compiled = template({
        process: {
          env: process.env
        }
      });
      config[key] = compiled;
    } else {
      config[key] = envVarInterpolation({ config: val as Record<string, unknown> });
    }
  }

  return config;
};

/*
extractEnvConfig

Extracts the env config to process.  Pulls the base and then merges/overrides with specified env.

expected config:
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
  config: object           -- the config object to process
  appEnv: string           -- the env name to use to override any base values
  pathToEnvConfig: string  -- the path to the config file (used just for log messages)
  logWarn: function        -- the function to use to log out warnings
*/
export const extractEnvConfig = (params: {
  config: Record<string, unknown>;
  appEnv: string;
  pathToEnvConfig: string;
  logWarn: (msg: string) => void;
}): Record<string, unknown> => {
  const logKey = 'EnvConfig::extractEnvConfig';
  const { config, pathToEnvConfig, appEnv, logWarn } = params;

  const base = config.base as Record<string, unknown>;

  if (!base) {
    throw new Error(`${logKey} ${pathToEnvConfig} is missing base or specified APP_ENV:${appEnv}`);
  }

  const specified = config[appEnv] as Record<string, unknown>;
  let ec = {};

  if (specified) {
    ec = { ...base, ...specified };
  } else {
    logWarn(`${logKey} did not find specified APP_ENV:${appEnv}, using base only`);
    ec = { ...base };
  }

  return ec;
};
