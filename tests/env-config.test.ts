import * as path from 'path';
import { processEnvConfig } from '../lib/environment-configuration';

describe('env-config.ts', () => {
  let logWarn: jest.Mock;
  let logInfo: jest.Mock;
  beforeEach(() => {
    logWarn = jest.fn();
    logInfo = jest.fn();
  });
  describe('processEnvConfig', () => {
    describe('with a basic config', () => {
      let filePath = '';
      beforeEach(() => {
        filePath = path.join(__dirname, './env-config-basic.json');
      });
      it('valid env, should process', async () => {
        await expect(
          processEnvConfig({ appEnv: 'envA', pathToEnvConfig: filePath, logWarn, logInfo })
        ).resolves.toStrictEqual({
          var1: 'var1BaseValue',
          var2: 'var2EnvAValue'
        });
      });
      it('bad env, should use base and warn', async () => {
        await expect(
          processEnvConfig({ appEnv: 'envC', pathToEnvConfig: filePath, logWarn, logInfo })
        ).resolves.toStrictEqual({
          var1: 'var1BaseValue',
          var2: 'var2BaseValue'
        });
        expect(logWarn).toHaveBeenCalledTimes(1);
      });
      it('valid env with valid interpolation, should process', async () => {
        process.env.VAR2 = 'var2EnvBValue';
        await expect(
          processEnvConfig({ appEnv: 'envB', pathToEnvConfig: filePath, logWarn, logInfo })
        ).resolves.toStrictEqual({
          var1: 'var1BaseValue',
          var2: 'var2EnvBValue'
        });
        delete process.env.VAR2;
      });

      it('valid env with invalid interpolation, should process but with empty interpolation', async () => {
        delete process.env.VAR2;
        await expect(
          processEnvConfig({ appEnv: 'envB', pathToEnvConfig: filePath, logWarn, logInfo })
        ).resolves.toStrictEqual({
          var1: 'var1BaseValue',
          var2: ''
        });
      });
    });

    describe('with env instruction config', () => {
      let filePath = '';
      beforeEach(() => {
        filePath = path.join(__dirname, './env-config-env-instruction.json');
      });
      it('env instruction config with valid env var, valid env, should process', async () => {
        process.env.VAR2 = 'var2EnvBValue';
        await expect(
          processEnvConfig({ appEnv: 'envB', pathToEnvConfig: filePath, logWarn, logInfo })
        ).resolves.toStrictEqual({
          var1: 'var1BaseValue',
          var2: 'var2EnvBValue'
        });
        delete process.env.VAR2;
      });

      it('env instruction config with invalid env var, valid env, should error', async () => {
        delete process.env.VAR2;
        await expect(processEnvConfig({ appEnv: 'envB', pathToEnvConfig: filePath, logWarn, logInfo })).rejects.toThrow(
          'EnvConfig::EnvVarInstruction env var does not exist: VAR2'
        );
      });
    });
  });
});
