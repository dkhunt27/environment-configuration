# environment-configuration

Loads environment configuration from json file or processes an in memory environment configuration object.

This merges the variables specified in the base (default) with an environment specified set. It will interpolate any env variables. Finally it will process any instructions contained in the variable value. Currently env variable replacing and AWS SSM variable replacing is supported.

![Coverage Badge](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/dkhunt27/e35a3788f0a2b9faec15f7869073a515/raw/addd887c647eaf07b7f6034581f00f8393f90877/environment-configuration__heads_main.json)

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
