import { GetParameterCommand, SSMClient, SSMClientConfig } from '@aws-sdk/client-ssm';
import { fromSSO } from '@aws-sdk/credential-providers';

const logKey = 'EnvConfig::SsmParamInstruction';

let ssm : SSMClient;

export const execute = async (params: { instruction: string; logInfo: (msg: string) => void }): Promise<string> => {
  const { instruction, logInfo } = params;

  if (!ssm) {
    ssm = await createSsmClient();
  }

  if (instruction.indexOf('ssm::') === 0) {
    const ssmKey = instruction.slice('ssm::'.length);
    logInfo(`${logKey} replacing key with ssm param: ${ssmKey}`);
    const command = new GetParameterCommand({ Name: ssmKey, WithDecryption: true });

    let ssmVal;
    try {
      ssmVal = await ssm.send(command);
    } catch (err) {
      throw new Error(`${logKey} Could not retrieve SSM Param Key (${ssmKey}) error: ${err.message || err}`);
    }

    if (!ssmVal || !ssmVal.Parameter || !ssmVal.Parameter.Value) {
      throw new Error(`${logKey} Could not retrieve SSM Param Key (${ssmKey}) or empty`);
    }

    return ssmVal.Parameter.Value;
  } else {
    return instruction;
  }
};

async function createSsmClient() {
  const config: SSMClientConfig = await getSsmClientConfig();
  return new SSMClient(config);
}

export async function getSsmClientConfig() {
  const region = process.env.AWS_REGION || 'us-east-2';
  const config: SSMClientConfig = {
    region
  };
  if (process.env.AWS_PROFILE) {
    config.credentials = await fromSSO({
      profile: process.env.AWS_PROFILE
    });
  }
  return config;
}

