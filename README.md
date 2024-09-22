# ProxiRun Analytics Dashboard

## Overview

This repository contains the code for a Svelte-based analytics web application for ProxiRun, a decentralized marketplace for compute tasks on the Aptos blockchain. The dashboard provides real-time insights into the ProxiRun ecosystem, focusing on work requests, worker performance, and marketplace dynamics.

## Features

- Single-page application built with Svelte
- Real-time data visualization of ProxiRun marketplace activities
- Integration with Nodit as a data provider for Aptos blockchain queries
- Metrics displayed:
  - Requests Received
  - Requests Successful
  - Total Spend
  - Number of Users
  - Number of Providers
  - Total Earned by Providers
  - Requests Unsuccessful
  - Total and average pend per task type (Text / Image / Voice generation)

## Technology Stack

- Frontend: Svelte
- Data Provider: Nodit (GraphQL queries for Aptos blockchain)
- Blockchain: Aptos

## Getting Started

### Prerequisites

- Node.js and npm installed
- Active subscription to Nodit
- Access to additional non-public database (contact project maintainers for more information)

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Run `npm install` to install dependencies

### Running the Development Server

After installation, start the development server with:

```
npm run dev
```

## Data Flow

1. ProxiRun smart contract emits events on the Aptos blockchain
2. Nodit indexes these events and provides GraphQL endpoints
3. The Svelte app queries Nodit for real-time and historical data
4. Some additional data regarding requests is fetched from the orchestrator database
5. Data is processed and displayed in the dashboard

## Project Status

This project is under active development. 

## About ProxiRun

ProxiRun is a decentralized marketplace for requesting compute tasks, primarily focused on ML model execution. Users can post work requests, and workers bid on these requests. The system manages auctions, selects the lowest bids, and handles payments automatically.

For more information, please visit our [GitHub organization profile](https://github.com/ProxiRun).