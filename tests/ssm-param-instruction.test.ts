import { fromSSO } from '@aws-sdk/credential-providers';
import { getSsmClientConfig } from '../lib/instructions/ssm-param-instruction';

jest.mock('@aws-sdk/credential-providers', () => ({
  fromSSO: jest.fn()
}));

describe('getSsmClientConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return config with default region when AWS_REGION is not set', async () => {
    delete process.env.AWS_REGION;
    delete process.env.AWS_PROFILE;

    const config = await getSsmClientConfig();

    expect(config).toStrictEqual({
      region: 'us-east-2'
    });
    expect(config).not.toHaveProperty('credentials');
    expect(fromSSO).not.toHaveBeenCalled();
  });

  it('should use AWS_REGION when set', async () => {
    process.env.AWS_REGION = 'us-west-2';
    delete process.env.AWS_PROFILE;

    const config = await getSsmClientConfig();

    expect(config).toStrictEqual({
      region: 'us-west-2'
    });
  });

  it('should include SSO credentials when AWS_PROFILE is set', async () => {
    process.env.AWS_REGION = 'eu-west-1';
    process.env.AWS_PROFILE = 'test-profile';

    const mockCredentials = { accessKeyId: 'test', secretAccessKey: 'test' };
    (fromSSO as jest.Mock).mockResolvedValue(mockCredentials);

    const config = await getSsmClientConfig();

    expect(config).toStrictEqual({
      region: 'eu-west-1',
      credentials: mockCredentials
    });
    expect(fromSSO).toHaveBeenCalledWith({ profile: 'test-profile' });
    expect(config).toHaveProperty('credentials');
  });
});
