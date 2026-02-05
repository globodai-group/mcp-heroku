# ☁️ MCP Heroku Server

[![npm version](https://badge.fury.io/js/@artik0din%2Fmcp-heroku.svg)](https://badge.fury.io/js/@artik0din%2Fmcp-heroku)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP](https://img.shields.io/badge/MCP-Compatible-blue.svg)](https://modelcontextprotocol.io/)

A complete Heroku management server for the Model Context Protocol (MCP). Provides comprehensive Heroku app management through the Heroku Platform API for AI assistants like Claude.

## ✨ Features

- 📋 **App Management** - List, view, and manage your Heroku applications
- 🚀 **Deployment History** - View releases and deployment timeline
- 📊 **Dyno Operations** - Scale, restart, and monitor dynos
- 📝 **Log Access** - Stream and filter application logs
- 🔧 **Configuration** - Manage environment variables (config vars)
- 📦 **Add-on Management** - List and monitor add-ons (databases, caches, etc.)
- 🔒 **Secure** - Uses your Heroku API key with proper authentication

## 📋 Prerequisites

- **Heroku CLI** (optional, for generating API keys)
- **Node.js** 16+ for running the MCP server
- **Heroku API Key** - Get from [Dashboard Account Settings](https://dashboard.heroku.com/account)

## 🚀 Quick Start

### Using with npx (recommended)
```bash
HEROKU_API_KEY=your-api-key npx @artik0din/mcp-heroku
```

### Install globally
```bash
npm install -g @artik0din/mcp-heroku
export HEROKU_API_KEY=your-api-key
mcp-heroku
```

## 🔧 Environment Variables

Set your Heroku API key:

### Option 1: Environment Variable
```bash
export HEROKU_API_KEY=your-heroku-api-key
```

### Option 2: .env file
```bash
cp .env.example .env
# Edit .env and add your HEROKU_API_KEY
```

### Getting Your API Key
1. Visit [Heroku Dashboard Account Settings](https://dashboard.heroku.com/account)
2. Scroll to "API Key" section
3. Click "Reveal" to show your key
4. Or use CLI: `heroku auth:token`

## 🔧 MCP Client Setup

Add this server to your MCP client configuration:

### Claude Desktop Configuration
```json
{
  "mcpServers": {
    "heroku": {
      "command": "npx",
      "args": ["@artik0din/mcp-heroku"],
      "env": {
        "HEROKU_API_KEY": "your-heroku-api-key-here"
      }
    }
  }
}
```

### Other MCP Clients
```json
{
  "name": "heroku",
  "command": "npx",
  "args": ["@artik0din/mcp-heroku"],
  "env": {
    "HEROKU_API_KEY": "your-heroku-api-key-here"
  }
}
```

## 📚 Available Tools

### App Management
- **heroku_list_apps** - List all your Heroku apps
  - `team` (string, optional) - Filter apps by team name

- **heroku_get_app** - Get detailed app information
  - `appName` (string, required) - Name of the Heroku app

### Deployment & Releases
- **heroku_list_releases** - View deployment history
  - `appName` (string, required) - Name of the Heroku app
  - `limit` (number) - Max releases to return (default: 10)

### Dyno Management
- **heroku_restart** - Restart app dynos
  - `appName` (string, required) - Name of the Heroku app
  - `dyno` (string, optional) - Specific dyno (e.g., "web.1"), or omit for all

- **heroku_scale** - Scale dynos up or down
  - `appName` (string, required) - Name of the Heroku app
  - `dyno` (string, required) - Dyno type (e.g., "web", "worker")
  - `quantity` (number, required) - Number of dynos to run
  - `size` (string, optional) - Dyno size (eco, basic, standard-1x, etc.)

### Logs & Monitoring
- **heroku_get_logs** - Retrieve application logs
  - `appName` (string, required) - Name of the Heroku app
  - `lines` (number) - Number of log lines (default: 100)
  - `dyno` (string, optional) - Filter by dyno (e.g., "web.1")
  - `source` (string, optional) - Filter by source ("app" or "heroku")

### Add-ons
- **heroku_list_addons** - List attached add-ons
  - `appName` (string, required) - Name of the Heroku app

### Configuration
- **heroku_config_vars** - Manage environment variables
  - `appName` (string, required) - Name of the Heroku app
  - `set` (boolean) - Set to true to modify (default: false, just lists)
  - `key` (string) - Config var key name
  - `value` (string) - Config var value (use with set=true)

## 💡 Usage Examples

### List all apps
```javascript
// Use the heroku_list_apps tool
// Returns array of apps with basic info
```

### Scale web dynos
```javascript
// Use heroku_scale tool with:
// appName: "my-app"
// dyno: "web"
// quantity: 2
// size: "standard-1x"
```

### Get recent logs
```javascript
// Use heroku_get_logs tool with:
// appName: "my-app" 
// lines: 50
// source: "app"
```

### Set environment variable
```javascript
// Use heroku_config_vars tool with:
// appName: "my-app"
// set: true
// key: "DATABASE_URL"
// value: "postgres://..."
```

## 🔒 Security

This server uses the Heroku Platform API securely:

- API key is read from environment variables only
- No credential storage or caching
- All requests use HTTPS
- Sensitive config vars are masked in responses
- Uses official Heroku API endpoints

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/artik0din/mcp-heroku.git
cd mcp-heroku

# Install dependencies
npm install

# Set environment variable
export HEROKU_API_KEY=your-key

# Build and run
npm run build
npm start

# Development mode
npm run dev
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 🔗 Related

- [Heroku Platform API Documentation](https://devcenter.heroku.com/articles/platform-api-reference)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)