# sui-move-cli

A command-line tool for managing Sui Move projects and tokens.

## Prerequisites

- [Sui](https://docs.sui.io/guides/developer/getting-started/sui-install) must be installed on your system
- Node.js 16 or higher

## Installation

You can run this tool directly using npx:

```bash
npx sui-move-cli
```

Or install it globally:

```bash
npm install -g sui-move-cli
```

## Commands

### Create a New Package

Create a new Move package:

```bash
npx sui-move-cli new-package -n my-package
```

### Build Package

Build a Move package:

```bash
npx sui-move-cli build -p my-package
```

### Publish Package

Publish a Move package to the Sui network:

```bash
npx sui-move-cli publish -p my-package [-b]
```

Options:

- `-b, --build`: Build the package before publishing

### Upgrade Package

Upgrade an existing Move package:

```bash
npx sui-move-cli upgrade -p my-package [-b]
```

Options:

- `-b, --build`: Build the package before upgrading

### Create a New Token

Create a new token with specified parameters:

```bash
npx sui-move-cli new-token \
  -n "My Token" \
  --token-symbol "MTK" \
  -d 9 \
  -i 1000000000
```

Required parameters:

- `-n, --name`: Token name
- `--token-symbol`: Token symbol
- `-d, --decimals`: Number of decimals
- `-i, --initialSupply`: Initial token supply

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm run test-all
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

