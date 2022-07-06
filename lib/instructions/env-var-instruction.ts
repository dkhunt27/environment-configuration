const logKey = 'EnvConfig::EnvVarInstruction';

/*
execute

Checks if env config value is an env instruction (starts with "env::").  If so,
replaces the value with the specific env var 

expected input / output
  env::VAR1 / (value of process.env.VAR1)
  VAR1 / VAR1

*/
export const execute = async (params: { instruction: string; logInfo: (msg: string) => void }): Promise<string> => {
  const { instruction, logInfo } = params;

  return new Promise((resolve, reject) => {
    if (instruction.indexOf('env::') === 0) {
      const envKey = instruction.slice('env::'.length);
      logInfo(`${logKey} replacing key with env var: ${envKey}`);
      const envVar = process.env[envKey];
      if (!envVar) {
        return reject(new Error(`${logKey} env var does not exist: ${envKey}`));
      }
      return resolve(envVar);
    } else {
      return resolve(instruction);
    }
  });
};
