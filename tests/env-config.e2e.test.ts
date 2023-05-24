import { processInMemoryEnvConfigWithConsole } from '../lib/environment-configuration';

describe('env-config.ts E2E', () => {
  describe('processInMemoryEnvConfigWithConsole', () => {
    describe('with a env and ssm instruction', () => {
      let config = {};
      beforeEach(() => {
        config = {
          base: {
            var1: 'var1BaseValue',
            var2: 'var2BaseValue'
          },
          envA: {
            var2: 'ssm::/environment-configuration/test/var2'
          },
          envB: {
            var2: 'env::ENVIRONMENT_CONFIGURATION_VAR2'
          }
        };
      });
      it('should process ssm param', async () => {
        await expect(processInMemoryEnvConfigWithConsole({ appEnv: 'envA', config })).resolves.toStrictEqual({
          var1: 'var1BaseValue',
          var2: 'var2EnvAValue'
        });
      });
      it('should process env param', async () => {
        process.env.ENVIRONMENT_CONFIGURATION_VAR2 = 'var2EnvBValue2';
        await expect(processInMemoryEnvConfigWithConsole({ appEnv: 'envB', config })).resolves.toStrictEqual({
          var1: 'var1BaseValue',
          var2: 'var2EnvBValue'
        });
        delete process.env.ENVIRONMENT_CONFIGURATION_VAR2;
      });
    });
  });
});
