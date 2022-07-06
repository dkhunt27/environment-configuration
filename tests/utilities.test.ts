import * as path from 'path';
import { parseEnvConfigFromFile } from '../lib/utilities';

describe('utilities.ts', () => {
  describe('parseEnvConfigFromFile', () => {
    describe('with a basic config', () => {
      let filePath = '';
      beforeEach(() => {
        filePath = path.join(__dirname, './env-config-basic.json');
      });
      it('should process', () => {
        const actual = parseEnvConfigFromFile({ pathToEnvConfig: filePath });

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
});
