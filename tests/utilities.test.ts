import * as path from 'path';
import { envVarInterpolation, parseConfigFromFile } from '../lib/utilities';

describe('utilities.ts', () => {
  describe('parseConfigFromFile', () => {
    describe('with a basic config', () => {
      let filePath = '';
      beforeEach(() => {
        filePath = path.join(__dirname, './env-config-basic.json');
      });
      it('should process', () => {
        const actual = parseConfigFromFile({ pathToEnvConfig: filePath });

        expect(actual).toStrictEqual({
          base: {
            var1: 'var1BaseValue',
            var2: 'var2BaseValue'
          },
          envA: {
            var2: 'var2EnvAValue'
          },
          envB: {
            var2: '${process.env.VAR2}'
          }
        });
      });
    });
  });

  describe('envVarInterpolation', () => {
    it('should replace env vars', () => {
      process.env.EC_VAR_A = 'abc';
      process.env.EC_VAR_B = 'def';
      const actual = envVarInterpolation({
        config: {
          base: {
            varA: '/some/path/baseA',
            varB: '/some/path/${process.env.EC_VAR_B}/baseB'
          },
          env1: {
            varA: '/some/path//${process.env.EC_VAR_A}/env1A',
            varC: '/some/path/env1C'
          }
        }
      });

      expect(actual).toStrictEqual({
        base: {
          varA: '/some/path/baseA',
          varB: '/some/path/def/baseB'
        },
        env1: {
          varA: '/some/path//abc/env1A',
          varC: '/some/path/env1C'
        }
      });

      delete process.env.EC_VAR_A;
      delete process.env.EC_VAR_B;
    });
  });
});
