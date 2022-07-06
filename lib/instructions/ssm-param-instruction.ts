import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import * as https from 'https';

const logKey = 'EnvConfig::SsmParamInstruction';

// Local docker run failing even with -e AWS_CA_BUNDLE
// so just adding that to the config manually
if (process.env.AWS_CA_BUNDLE) {
  const certs = [fs.readFileSync(process.env.AWS_CA_BUNDLE)];

  AWS.config.update({
    httpOptions: {
      agent: new https.Agent({
        rejectUnauthorized: true,
        ca: certs
      })
    }
  });
}

const region = process.env.AWS_REGION || 'us-east-2';

const ssm = new AWS.SSM({ region });

export const execute = async (params: { instruction: string; logInfo: (msg: string) => void }): Promise<string> => {
  const { instruction, logInfo } = params;

  if (instruction.indexOf('ssm::') === 0) {
    const ssmKey = instruction.slice('ssm::'.length);
    logInfo(`${logKey} replacing key with ssm param: ${ssmKey}`);
    const options = { Name: ssmKey, WithDecryption: true };

    let ssmVal;
    try {
      ssmVal = await ssm.getParameter(options).promise();
    } catch (err) {
      throw new Error(`${logKey} Could not retrieve SSM Param Key (${ssmKey}) error: ${err.message || err}`);
    }

    if (ssmVal && ssmVal.$response && ssmVal.$response.error) {
      throw new Error(`${logKey} Could not retrieve SSM Param Key (${ssmKey}) err: ${ssmVal.$response.error}`);
    }

    if (!ssmVal || !ssmVal.Parameter || !ssmVal.Parameter.Value) {
      throw new Error(`${logKey} Could not retrieve SSM Param Key (${ssmKey}) or empty`);
    }

    return ssmVal.Parameter.Value;
  } else {
    return instruction;
  }
};
