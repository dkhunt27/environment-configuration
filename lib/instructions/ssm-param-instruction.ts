import { GetParameterCommand, SSMClient, SSMClientConfig } from '@aws-sdk/client-ssm';

const logKey = 'EnvConfig::SsmParamInstruction';

const region = process.env.AWS_REGION || 'us-east-2';

const config: SSMClientConfig = {
  region
};

const ssm = new SSMClient(config);

export const execute = async (params: { instruction: string; logInfo: (msg: string) => void }): Promise<string> => {
  const { instruction, logInfo } = params;

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
