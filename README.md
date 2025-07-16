# PricePeak - Commodities Analysis & Forecasting Dashboard

**PricePeak** is a professional-grade financial analysis dashboard designed for analyzing commodity portfolios. It combines advanced data visualization, quantitative analysis, and generative AI to provide a comprehensive tool for traders, analysts, and portfolio managers.

The dashboard allows users to construct multi-asset commodity portfolios, analyze historical performance with advanced technical indicators, run backtests on trading strategies, visualize risk-return trade-offs with an Efficient Frontier, and generate AI-powered narrative summaries of the current market conditions.

![PricePeak Screenshot](https://i.imgur.com/your-screenshot-url.png) 
*(Note: You should replace this with a real screenshot of the running application)*

---

## Features

### Portfolio Management
- **Dynamic Portfolio Construction:** Interactively build and adjust portfolios with weighted allocations across a range of commodities.
- **Save/Load Portfolios:** Persist portfolio configurations in the browser's local storage to resume analysis later.
- **Asset Drill-Down:** Click on any asset in the portfolio to open a detailed modal with its specific chart, stats, and news.

### Advanced Technical Analysis
- **Interactive Candlestick Charting:** Visualize portfolio price action with OHLC (Open, High, Low, Close) data.
- **Technical Indicator Overlays:** Toggle popular indicators like **Bollinger Bands** to analyze volatility and price levels.
- **RSI (Relative Strength Index):** Gauge momentum and identify overbought/oversold conditions on a dedicated sub-chart.

### Quantitative Analysis & Risk Management
- **Interactive Backtesting Engine:** Test historical performance of different trading strategies (e.g., Momentum, Mean Reversion) with adjustable parameters.
- **Portfolio Optimization (Efficient Frontier):** Visualize the risk-return trade-off for thousands of simulated portfolio weightings, highlighting the Minimum Volatility and Maximum Sharpe Ratio portfolios.
- **Monte Carlo Simulation:** Forecast a distribution of potential 30-day price outcomes to better understand risk and probability.
- **Advanced Risk Metrics:** Calculate and display **Value at Risk (VaR)** and **Conditional Value at Risk (CVaR)** for sophisticated risk assessment.
- **Correlation Matrix:** Analyze how assets within the portfolio move in relation to each other to assess diversification.

### AI & Market Context
- **Generative AI Summary:** On-demand, AI-powered narrative summaries that synthesize all key data points into a concise, human-readable market commentary.
- **Economic Calendar:** Stay informed of major upcoming economic events that can impact market volatility.
- **Live Clock & Market Status:** A real-time clock and simulated market status indicator provide a dynamic feel.

---

## Technical Stack

- **Frontend:** React.js
- **Charting:** Recharts
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Generative AI:** Gemini API (via Google AI)

---

## Setup and Installation

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/pricepeak.git](https://github.com/your-username/pricepeak.git)
    cd pricepeak
    ```

2.  **Install dependencies:**
    This project uses `npm`. Make sure you have Node.js installed.
    ```bash
    npm install
    ```

3.  **Set up Tailwind CSS (if not already configured):**
    Follow the official guide to integrate Tailwind CSS with your Create React App project: [Install Tailwind CSS with Create React App](https://tailwindcss.com/docs/guides/create-react-app)

4.  **Run the application:**
    ```bash
    npm start
    ```
    The application will be available at `http://localhost:3000`.

---

## Usage Guide

1.  **Construct Your Portfolio:** Use the "Portfolio Construction" panel on the left to add, remove, and adjust the weights of different commodities.
2.  **Save Your Work:** Click the "Save" button to store your current portfolio in your browser. Use "Load" to retrieve it later.
3.  **Analyze Technicals:** On the "Technicals" tab, view the candlestick chart and toggle the Bollinger Bands overlay. Analyze the RSI chart below to gauge momentum.
4.  **Run a Backtest:** Navigate to the "Backtesting" tab, choose a strategy (Momentum or Mean Reversion), set a lookback period, and click "Run Backtest" to see the historical performance.
5.  **Optimize Your Portfolio:** Go to the "Optimization" tab to see the Efficient Frontier for your selected assets. Hover over points to see different risk/return profiles.
6.  **Generate AI Insights:** On the "AI Summary" tab, click "Generate AI Summary" to get a narrative analysis of your portfolio's current state.

---

## Future Improvements

-   Integrate a live data feed from a real financial API (e.g., Alpha Vantage, Polygon.io).
-   Add more advanced technical indicators (e.g., MACD, Ichimoku Cloud).
-   Implement more complex backtesting strategies and performance metrics.
-   Allow users to create and save multiple portfolios.
