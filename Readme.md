# Echo - Slack Bot

> An AI Slack bot that answers questions, searches the web, summarizes conversations, and helps teams understand their projects.


<div align="center">

![Slack](https://img.shields.io/badge/Slack-Bot-4A154B?style=for-the-badge&logo=slack)
![Node.js](https://img.shields.io/badge/Node.js-v14+-339933?style=for-the-badge&logo=nodedotjs)



<p align="center">
   <img src="public/readme/logo.png" alt="Echo logo" width="270" />
   <br />
   <img src="public/readme/ask.jpg" alt="Slack response - ask" style="max-width:100%;margin:8px;" />
   <img src="public/readme/search.jpg" alt="Slack response - search" style="max-width:100%;margin:8px;" />
</p>

**[Features](#-features) • [Installation](#-installation) • [Commands](#-commands) • [Configuration](#-configuration) • [Contributing](#-contributing)**

</div>

## Tutorial Video

Watch the walkthrough on YouTube: [Echo Tutorial Video](https://youtu.be/Wu7u665-Njo)

---

## Features

-  **AI Responses** - Intelligent answers to any question using advanced language models 
-  **Web Search** - Web search with summarized results and citations for latest information
-  **Conversation Summaries** - Summarize channel history by timeframe (today, yesterday, last N messages)
-  **Project Analysis** - Generate detailed project status reports from channel discussions

---

## Quick Start

### Prerequisites

- **Node.js** v14 or higher
- A Slack workspace with admin access
- **Slack Bot Tokens** (Bot Token, Signing Secret, App Token)
- **API Key** for web search & AI services (HackClub AI)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lilithCode/Echo.git
   cd echo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   nano .env
   ```
   
   Fill in your `.env` file:
   ```env
   SLACK_BOT_TOKEN=xoxb-your-bot-token
   SLACK_SIGNING_SECRET=your-signing-secret
   SLACK_APP_TOKEN=xapp-your-app-token
   HACKCLUB_AI_KEY=your-hackclub-api-key
   ```

4. **Start the bot**
   ```bash
   npm start
   ```

---

## Commands

### Knowledge & Search

#### `/echo-ask <question>`
Ask Echo anything and get instant AI-powered answers.

```
/echo-ask what is machine learning?
/echo-ask how do I deploy a Node.js app?
/echo-ask explain OAuth flow
```

**What it does:**
- Processes your question through an advanced language model
- Provides detailed, contextual answers
- Returns human-readable responses within seconds

---

#### `/echo-search <query>`
Search the web and get summarized results with sources.

```
/echo-search latest Node.js security updates
/echo-search how to optimize React performance
/echo-search machine learning frameworks 2024
```

**What it does:**
- Searches the web using the Exa API
- Fetches top 3 most relevant results
- Extracts and summarizes content
- Provides clickable source links

---

### Conversation Management

#### `/echo-summary <today|yesterday|last N|unread>`
Summarize channel conversations with context and attribution.

**Options:**
- `today` - Summarize all messages from today
- `yesterday` - Summarize all messages from yesterday
- `last N` - Summarize the last N messages (e.g., `last 50`)
- `unread` - Summarize unread/recent discussions

**Examples:**
```
/echo-summary today
/echo-summary yesterday
/echo-summary last 30
/echo-summary unread
```

**What it does:**
- Fetches conversation history
- Resolves user mentions to real names
- Groups messages by topics/themes
- Highlights action items and decisions
- Identifies key questions and disagreements
- Preserves who said what

---

### Project Management

#### `/echo-project <project-name>`
Generate a comprehensive project status report.

```
/echo-project amadeus
/echo-project stardance
/echo-project my-new-website
```

**What it does:**
- Finds the project channel (exact match, topic/purpose match, or mentions)
- Gathers pinned messages (specs and briefs)
- Analyzes conversation history
- Generates a professional status report including:
  - Project Overview
  - Current Status
  - Team & Roles
  - Related Projects & Dependencies

---

#### `/echo-docs <query>`
Search through technical documentation and official docs.

```
/echo-docs Node.js fs module
/echo-docs React hooks
/echo-docs MongoDB aggregation
```

**What it does:**
- Searches official documentation sources
- Returns relevant documentation sections
- Provides quick reference links

---

#### `/echo-help`
Display all available commands and their usage.

```
/echo-help
```

---

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Slack Tokens (Get from Slack App Dashboard)
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SLACK_APP_TOKEN=xapp-your-app-token-here

# AI & Search API
HACKCLUB_AI_KEY=your-hackclub-api-key-here
```

### Getting Slack Tokens

1. Go to [Slack App Dashboard](https://api.slack.com/apps)
2. Create a New App
3. Under "OAuth & Permissions", find the tokens:
   - **Bot User OAuth Token** → `SLACK_BOT_TOKEN`
   - **Signing Secret** → `SLACK_SIGNING_SECRET`
   - **App Token** (Socket Mode) → `SLACK_APP_TOKEN`

### Inviting Echo to Channels

```
/invite @Echo
```

Or drag Echo into the channel manually.

---
##  Contributing

Contributions are welcome :)

<div align="center">

**Made by Lilith**

[⬆ back to top](#-echo---slack-bot)

</div>