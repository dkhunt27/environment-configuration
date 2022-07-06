import { execute } from '../lib/instructions/env-var-instruction';

describe('env-var-instruction.ts', () => {
  describe('execute', () => {
    it('not env var instruction, should just pass thru', async () => {
      await expect(execute({ instruction: 'abc', logInfo: jest.fn() })).resolves.toStrictEqual('abc');
    });
    it('with matching env var, should replace', async () => {
      process.env.VAR = 'foo';
      await expect(execute({ instruction: 'env::VAR', logInfo: jest.fn() })).resolves.toStrictEqual('foo');
      delete process.env.VAR;
    });
    it('with missing env var, should replace', async () => {
      delete process.env.VAR;
      await expect(execute({ instruction: 'env::VAR', logInfo: jest.fn() })).rejects.toThrowError(
        'EnvConfig::EnvVarInstruction env var does not exist: VAR'
      );
    });
  });
});
