# environment-configuration

Loads environment configuration from json file or processes an in memory environment configuration object.

This merges the variables specified in the base (default) with an environment specified set. It will interpolate any env variables. Finally it will process any instructions contained in the variable value. Currently env variable replacing and AWS SSM variable replacing is supported.

![Coverage Badge](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/dkhunt27/d7e6b443a01eba615fd2a7c1215aec91/raw/fb36777bf53a50ea3fa4de73043f9bf7c988edd3/coverage-apps-auto-letters-api.json) ![Coverage Badge](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/dkhunt27/d7e6b443a01eba615fd2a7c1215aec91/raw/fb36777bf53a50ea3fa4de73043f9bf7c988edd3/coverage-apps-client-dashboard.json)

## Instructions

### Environment Variable Instruction

If the instruction starts with `env::` the variable will be replaced with the matching env variable.

```bash
# instruction and env var VAR_A=abc
env::VAR_A

# output
abc
```

### SSM Variable Instruction

If the instruction starts with `ssm::` the variable will be replaced with the matching ssm param variable.

```bash
# instruction and ssm param /ssm/param/varA=def
ssm::/ssm/param/varA

# output
def
```

## Example

```bash

# config file and env var VAR_D=abc and ssm param /ssm/param/varE=def
{
   base: {
      varA: 'baseA',
      varB: 'baseB',
      varD: 'env::VAR_D',
   },
   dev: {
      varA: 'env1A',
      varC: 'env1C'
      varE: 'ssm::/ssm/param/varE'
   },
   prod: {
      varA: 'env1A',
      varC: 'env1C'
   }
 }

# output with appEnv = dev and env var VAR_D=abc and ssm param /ssm/param/varE=def
{
  varA: 'env1A',
  varB: 'baseB',
  varC: 'env1C',
  varD: 'abc',  # result of env::VAR_D
  varE: 'def',  # result of ssm::/ssm/param/varE
}
```

## Publishing

- Make changes
- Create git commit using feat: for new features or fix: for updates
- Run yarn release:major, release:minor, release:patch for appropriate update (this will bump version number appropriately)
- Make PR back to main
- Upon merge to main, it will kick off action that will publish to npm
