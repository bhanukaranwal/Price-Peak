import React, { useState, useEffect, useCallback } from 'react';
import { Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, Cell, BarChart, ScatterChart, Scatter, ZAxis } from 'recharts';
import { DollarSign, Activity, Target, Zap, Briefcase, Info, Layers, RefreshCw, Shield, Settings, Clock, Newspaper, BrainCircuit, CalendarDays, SlidersHorizontal, Save, FolderOpen, Sparkles } from 'lucide-react';

// --- MOCK DATA & EXPERT-LEVEL SIMULATION UTILS ---

const ALL_COMMODITIES = ['Crude Oil', 'Gold', 'Copper', 'Silver', 'Natural Gas', 'Corn', 'Wheat', 'Soybeans'];

const generateAdvancedMockData = (commodity, numDays) => {
    const data = [];
    let price, trend, volatility, baseVol;
    let regime = 'Neutral', regimeCounter = 0;

    switch (commodity) {
        case 'Gold': price = 1950; trend = 0.03; baseVol = 0.8; break;
        case 'Copper': price = 4.2; trend = 0.05; baseVol = 2.5; break;
        case 'Silver': price = 24; trend = 0.04; baseVol = 1.5; break;
        case 'Natural Gas': price = 2.8; trend = -0.1; baseVol = 4; break;
        case 'Corn': price = 480; trend = 0.02; baseVol = 1.8; break;
        case 'Wheat': price = 600; trend = 0.01; baseVol = 2.2; break;
        case 'Soybeans': price = 1300; trend = 0.03; baseVol = 2.0; break;
        default: price = 85; trend = 0.1; baseVol = 2; break; // Crude Oil
    }
    volatility = baseVol;
    let lastClose = price;

    const today = new Date();
    for (let i = numDays; i > 0; i--) {
        regimeCounter--;
        if (regimeCounter <= 0) { const rand = Math.random(); if (rand < 0.2) { regime = 'Bull'; regimeCounter = Math.random() * 40 + 20; } else if (rand < 0.4) { regime = 'Bear'; regimeCounter = Math.random() * 40 + 20; } else { regime = 'Neutral'; regimeCounter = Math.random() * 30 + 15; } }
        const shock = (Math.random() - 0.5);
        volatility = Math.sqrt(0.1 * baseVol**2 + 0.8 * volatility**2 + 0.1 * (shock*10)**2);
        let dailyReturn = (trend / numDays) + shock * (volatility / 100);
        if (regime === 'Bull') dailyReturn += 0.001; if (regime === 'Bear') dailyReturn -= 0.001;
        
        const open = lastClose;
        const high = open * (1 + (Math.random() * volatility / 100));
        const low = open * (1 - (Math.random() * volatility / 100));
        const close = open * (1 + dailyReturn);
        lastClose = close;

        const date = new Date(new Date().setDate(today.getDate() - i));
        data.push({ date: date.toISOString().split('T')[0], price: parseFloat(close.toFixed(2)), ohlc: [parseFloat(open.toFixed(2)), parseFloat(high.toFixed(2)), parseFloat(low.toFixed(2)), parseFloat(close.toFixed(2))], volatility: parseFloat(volatility.toFixed(2)), regime: regime });
    }
    
    // Calculate Indicators
    for (let i = 0; i < data.length; i++) {
        if (i >= 20) {
            const periodData20 = data.slice(i - 20, i + 1);
            const sma20 = periodData20.reduce((acc, curr) => acc + curr.price, 0) / 21;
            const stdDev = Math.sqrt(periodData20.reduce((acc, curr) => acc + Math.pow(curr.price - sma20, 2), 0) / 21);
            data[i].bollingerUpper = parseFloat((sma20 + 2 * stdDev).toFixed(2));
            data[i].bollingerLower = parseFloat((sma20 - 2 * stdDev).toFixed(2));
        }
        if (i >= 14) {
            const periodData14 = data.slice(i - 14, i + 1);
            let gains = 0, losses = 0;
            for (let j = 1; j < periodData14.length; j++) {
                const diff = periodData14[j].price - periodData14[j-1].price;
                if (diff > 0) gains += diff; else losses -= diff;
            }
            const avgGain = gains / 14; const avgLoss = losses / 14;
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            data[i].rsi = parseFloat((100 - (100 / (1 + rs))).toFixed(2));
        }
    }
    return data;
};

const runMonteCarlo = (lastPrice, lastVol, days = 30, simulations = 500) => {
    const endPrices = [];
    for (let i = 0; i < simulations; i++) {
        let price = lastPrice;
        for (let j = 0; j < days; j++) {
            price *= (1 + (Math.random() - 0.5) * (lastVol / 100) * (1 / Math.sqrt(252/days)) );
        }
        endPrices.push(price);
    }
    endPrices.sort((a, b) => a - b);
    
    const p5_price = endPrices[Math.floor(simulations * 0.05)];
    const var_95 = lastPrice - p5_price;
    
    const lossesBeyondVar = endPrices.slice(0, Math.floor(simulations * 0.05));
    const cvar_95 = lossesBeyondVar.length > 0 ? lastPrice - (lossesBeyondVar.reduce((a, b) => a + b, 0) / lossesBeyondVar.length) : 0;

    const mean = endPrices.reduce((a, b) => a + b, 0) / simulations;
    const min = Math.min(...endPrices), max = Math.max(...endPrices);
    const bucketSize = (max-min)/10;
    const histogram = Array(10).fill(0).map((_, i) => ({
        name: `$${(min + i * bucketSize).toFixed(2)}`,
        count: endPrices.filter(p => p >= (min + i * bucketSize) && p < (min + (i+1) * bucketSize)).length
    }));
    return { p5: p5_price, mean, histogram, var_95, cvar_95 };
};

// Other simulation functions remain the same...
const simulateNews = (commodities) => { const headlines = { 'Crude Oil': ["OPEC+ maintains production quotas.", "Geopolitical tensions cause price spike."], 'Gold': ["Fed interest rate decision looms.", "Central bank purchases hit record highs."], 'Copper': ["China's manufacturing data shows weakness.", "Green energy projects bolster copper outlook."], 'General': ["Global inflation data hotter than expected.", "Strong US dollar pressures commodities."] }; const news = []; commodities.forEach(c => { if(headlines[c]) news.push(...headlines[c]); }); news.push(...headlines['General']); return news.map(headline => { const rand = Math.random(); let sentiment = 'Neutral', color = 'gray'; if (rand < 0.3) { sentiment = 'Bearish'; color = 'red'; } else if (rand > 0.7) { sentiment = 'Bullish'; color = 'green'; } return { headline, sentiment, color }; }); };
const simulateEconomicCalendar = () => { const today = new Date(); const events = [ { daysFromNow: 2, time: '8:30 AM', event: 'US CPI Data Release (MoM)', importance: 'High' }, { daysFromNow: 8, time: '2:00 PM', event: 'FOMC Meeting Statement', importance: 'High' }, { daysFromNow: 15, time: '10:00 AM', event: 'Crude Oil Inventories', importance: 'Medium' }, { daysFromNow: 22, time: '4:00 AM', event: 'China Manufacturing PMI', importance: 'Medium' } ]; return events.map(e => { const eventDate = new Date(today); eventDate.setDate(today.getDate() + e.daysFromNow); return { ...e, date: eventDate.toLocaleDateString() }; }); };
const runBacktest = (data, strategy, param) => { const equityCurve = []; let cash = 10000, position = 0; for (let i = param; i < data.length; i++) { const currentPrice = data[i].price; let signal = 0; if (strategy === 'Momentum') { const momentum = currentPrice / data[i - param].price - 1; if (momentum > 0.02) signal = 1; else if (momentum < -0.02) signal = -1; } else if (strategy === 'MeanReversion') { const sma = data.slice(i - param, i).reduce((sum, d) => sum + d.price, 0) / param; if (currentPrice < sma * 0.98) signal = 1; else if (currentPrice > sma * 1.02) signal = -1; } if (signal === 1 && cash > 0) { position = cash / currentPrice; cash = 0; } else if (signal === -1 && position > 0) { cash = position * currentPrice; position = 0; } equityCurve.push({ date: data[i].date, value: cash + position * currentPrice }); } const finalValue = equityCurve[equityCurve.length - 1].value; const totalReturn = (finalValue / 10000 - 1) * 100; return { equityCurve, totalReturn: totalReturn.toFixed(2), finalValue: finalValue.toFixed(2) }; };
const simulateEfficientFrontier = (assets) => { const points = []; for (let i = 0; i < 2000; i++) { let weights = assets.map(() => Math.random()); const totalWeight = weights.reduce((s, w) => s + w, 0); weights = weights.map(w => w / totalWeight); const expectedReturn = weights.reduce((acc, w, j) => acc + w * (Math.random() * 0.2 - 0.05), 0); const volatility = Math.sqrt(weights.reduce((acc, w, j) => acc + Math.pow(w, 2) * Math.pow(Math.random() * 0.3, 2), 0)); points.push({ x: volatility * 100, y: expectedReturn * 100, z: (expectedReturn / volatility) || 0 }); } const minVolPortfolio = points.reduce((min, p) => p.x < min.x ? p : min, points[0]); const maxSharpePortfolio = points.reduce((max, p) => p.z > max.z ? p : max, points[0]); return { points, minVolPortfolio, maxSharpePortfolio }; };

// --- UI COMPONENTS ---
const InfoTooltip = ({ text }) => ( <div className="relative flex items-center group ml-1"><Info className="h-3 w-3 text-gray-400 cursor-pointer" /><div className="absolute bottom-full mb-2 w-64 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">{text}</div></div> );
const StatCard = ({ icon, title, value, unit }) => ( <div className="bg-white p-3 rounded-lg shadow-md"><div className="flex items-center"><div className="bg-blue-100 text-blue-600 p-3 rounded-full mr-3">{icon}</div><div><p className="text-sm text-gray-500">{title}</p><p className="text-lg font-bold text-gray-800">{value} <span className="text-sm font-normal">{unit}</span></p></div></div></div> );
const TabButton = ({ label, isActive, onClick }) => ( <button onClick={onClick} className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${isActive ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}>{label}</button> );
const PortfolioBuilder = ({ portfolio, setPortfolio, onAssetClick, savePortfolio, loadPortfolio }) => {
    const handleWeightChange = (commodity, weight) => { const newPortfolio = { ...portfolio, [commodity]: weight }; const totalWeight = Object.values(newPortfolio).reduce((sum, w) => sum + w, 0); if (totalWeight > 100) newPortfolio[commodity] = weight - (totalWeight - 100); setPortfolio(newPortfolio); };
    const handleRemove = (commodity) => { const newPortfolio = {...portfolio}; delete newPortfolio[commodity]; setPortfolio(newPortfolio); };
    const usedCommodities = Object.keys(portfolio);
    const availableCommodities = ALL_COMMODITIES.filter(c => !usedCommodities.includes(c));
    const totalAllocated = Object.values(portfolio).reduce((s, w) => s + w, 0);
    return ( <div className="p-4 bg-white rounded-lg shadow-md"><h3 className="font-semibold text-gray-700 mb-4 flex items-center">Portfolio Construction <InfoTooltip text="Build a multi-asset portfolio. Click asset name for details."/></h3><div className="space-y-3">{usedCommodities.map(commodity => ( <div key={commodity} className="flex items-center"><button onClick={() => handleRemove(commodity)} className="text-red-400 hover:text-red-600 mr-2 text-xs">✖</button><span onClick={() => onAssetClick(commodity)} className="w-28 text-sm font-medium cursor-pointer hover:text-blue-600">{commodity}</span><input type="range" min="0" max="100" value={portfolio[commodity]} onChange={e => handleWeightChange(commodity, Number(e.target.value))} className="w-full mx-2"/><span className="w-12 text-sm text-right">{portfolio[commodity]}%</span></div> ))}</div><div className="mt-4 flex justify-between items-center"><select onChange={e => handleWeightChange(e.target.value, 20)} className="text-sm p-1 border rounded-md" value=""><option value="" disabled>Add Commodity...</option>{availableCommodities.map(c => <option key={c} value={c}>{c}</option>)}</select><div className="text-sm font-medium">Total: <span className={totalAllocated > 100 ? 'text-red-500' : 'text-green-600'}>{totalAllocated}%</span></div></div><div className="flex justify-between mt-4"><button onClick={savePortfolio} className="text-sm text-blue-600 hover:underline flex items-center"><Save className="h-3 w-3 mr-1"/>Save</button><button onClick={loadPortfolio} className="text-sm text-blue-600 hover:underline flex items-center"><FolderOpen className="h-3 w-3 mr-1"/>Load</button><button onClick={() => setPortfolio({ 'Crude Oil': 50, 'Gold': 50 })} className="text-sm text-blue-600 hover:underline flex items-center"><RefreshCw className="h-3 w-3 mr-1"/>Reset</button></div></div> );
};
const CustomCandle = (props) => {
    const { x, y, width, height, ohlc } = props;
    if (!ohlc || ohlc.length < 4) return null;
    const isUp = ohlc[3] >= ohlc[0];
    const color = isUp ? '#22c55e' : '#ef4444';
    const wickX = x + width / 2;
    const bodyHeight = Math.abs(ohlc[0] - ohlc[3]);
    const bodyY = isUp ? y + (ohlc[1] - ohlc[3]) : y + (ohlc[1] - ohlc[0]);
    return <> <line x1={wickX} y1={y} x2={wickX} y2={y + height} stroke={color} /> <rect x={x} y={bodyY} width={width} height={bodyHeight} fill={color} /> </>;
};
const AssetDrillDownModal = ({ isOpen, onClose, commodity, data }) => {
    if (!isOpen || !data) return null;
    const lastDataPoint = data[data.length - 1];
    return ( <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"><div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl"><div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">{commodity}</h2><button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button></div><div className="grid grid-cols-3 gap-4 mb-4"><StatCard icon={<DollarSign size={20}/>} title="Last Price" value={lastDataPoint.price.toFixed(2)} unit="USD" /><StatCard icon={<Zap size={20}/>} title="Volatility" value={lastDataPoint.volatility.toFixed(2)} unit="%" /><StatCard icon={<Layers size={20}/>} title="Market Regime" value={lastDataPoint.regime} unit="" /></div><ResponsiveContainer width="100%" height={300}><ComposedChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="price" stroke="#8884d8" dot={false} /><Line type="monotone" dataKey="bollingerUpper" name="Upper Band" stroke="#ffc658" strokeDasharray="5 5" dot={false} /><Line type="monotone" dataKey="bollingerLower" name="Lower Band" stroke="#ffc658" strokeDasharray="5 5" dot={false} /></ComposedChart></ResponsiveContainer></div></div> );
};

// --- MAIN APP COMPONENT ---

export default function App() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Price');
    const [portfolio, setPortfolio] = useState({ 'Crude Oil': 60, 'Gold': 40 });
    const [allData, setAllData] = useState({});
    const [displayData, setDisplayData] = useState([]);
    const [efficientFrontier, setEfficientFrontier] = useState({ points: [] });
    const [news, setNews] = useState([]);
    const [economicCalendar, setEconomicCalendar] = useState([]);
    const [time, setTime] = useState(new Date());
    const [drillDownAsset, setDrillDownAsset] = useState(null);
    const [showBollinger, setShowBollinger] = useState(true);
    const [backtestResults, setBacktestResults] = useState(null);
    const [backtestStrategy, setBacktestStrategy] = useState('Momentum');
    const [backtestParam, setBacktestParam] = useState(20);
    const [aiSummary, setAiSummary] = useState('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

    useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);

    const fetchData = useCallback(async (commodities) => {
        setLoading(true);
        const dataPromises = commodities.map(c => new Promise(resolve => setTimeout(() => resolve({ [c]: generateAdvancedMockData(c, 504) }), 0)));
        const results = await Promise.all(dataPromises);
        setAllData(results.reduce((acc, val) => ({ ...acc, ...val }), {}));
        setEconomicCalendar(simulateEconomicCalendar());
        setLoading(false);
    }, []);

    const savePortfolio = () => { try { localStorage.setItem('pricepeak_portfolio', JSON.stringify(portfolio)); alert('Portfolio saved!'); } catch (e) { alert('Could not save portfolio.'); } };
    const loadPortfolio = () => { try { const saved = localStorage.getItem('pricepeak_portfolio'); if (saved) { setPortfolio(JSON.parse(saved)); } } catch (e) { console.error("Could not load portfolio from localStorage"); }};

    useEffect(() => { loadPortfolio(); fetchData(ALL_COMMODITIES); }, [fetchData]);
    
    useEffect(() => {
        if (Object.keys(allData).length === 0) return;
        const totalWeight = Object.values(portfolio).reduce((s, w) => s + w, 0);
        if (totalWeight === 0) { setDisplayData([]); return; }
        const portfolioData = [], numDays = allData['Crude Oil'].length;
        for (let i = 0; i < numDays; i++) {
            let weightedPrice = 0, weightedVolatility = 0, ohlc = [0,0,0,0], rsi = 0, bollingerUpper = 0, bollingerLower = 0;
            for (const [commodity, weight] of Object.entries(portfolio)) {
                if (allData[commodity]?.[i]) {
                    const assetData = allData[commodity][i];
                    weightedPrice += assetData.price * (weight / totalWeight);
                    weightedVolatility += assetData.volatility * (weight / totalWeight);
                    if(assetData.ohlc) { ohlc[0] += assetData.ohlc[0] * (weight / totalWeight); ohlc[1] += assetData.ohlc[1] * (weight / totalWeight); ohlc[2] += assetData.ohlc[2] * (weight / totalWeight); ohlc[3] += assetData.ohlc[3] * (weight / totalWeight); }
                    if(assetData.rsi) rsi += assetData.rsi * (weight / totalWeight);
                    if(assetData.bollingerUpper) bollingerUpper += assetData.bollingerUpper * (weight / totalWeight);
                    if(assetData.bollingerLower) bollingerLower += assetData.bollingerLower * (weight / totalWeight);
                }
            }
            portfolioData.push({ date: allData['Crude Oil'][i].date, price: weightedPrice, ohlc, volatility: weightedVolatility, regime: allData['Crude Oil'][i].regime, rsi, bollingerUpper, bollingerLower });
        }
        setDisplayData(portfolioData);
        setNews(simulateNews(Object.keys(portfolio)));
        setEfficientFrontier(simulateEfficientFrontier(Object.keys(portfolio)));
        setBacktestResults(null);
        setAiSummary('');
    }, [portfolio, allData]);

    const handleRunBacktest = () => { if(displayData.length > 0) setBacktestResults(runBacktest(displayData, backtestStrategy, backtestParam)); };
    
    const generateAiSummary = async () => {
        setIsGeneratingSummary(true);
        setAiSummary('');
        const lastDataPoint = displayData[displayData.length - 1];
        if (!lastDataPoint) {
            setIsGeneratingSummary(false);
            setAiSummary("No data available to generate summary.");
            return;
        }
        const monteCarlo = runMonteCarlo(lastDataPoint.price, lastDataPoint.volatility);

        const prompt = `
            Analyze the following financial data for a commodity portfolio and provide a brief, professional summary (2-3 sentences).
            - Portfolio Assets: ${Object.keys(portfolio).join(', ')}
            - Current Price: $${lastDataPoint.price.toFixed(2)}
            - Current Daily Volatility: ${lastDataPoint.volatility.toFixed(2)}%
            - Market Regime: ${lastDataPoint.regime}
            - RSI (14-Day): ${lastDataPoint.rsi.toFixed(2)}
            - Bollinger Bands: The price is currently ${lastDataPoint.price > lastDataPoint.bollingerUpper ? 'above the upper band' : lastDataPoint.price < lastDataPoint.bollingerLower ? 'below the lower band' : 'within the bands'}.
            - Monte Carlo Mean 30-Day Forecast: $${monteCarlo.mean.toFixed(2)}
            - 30-Day Value at Risk (95%): $${monteCarlo.var_95.toFixed(2)}
            
            Synthesize these points into a coherent market commentary.
        `;

        try {
            let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
            const payload = { contents: chatHistory };
            const apiKey = ""; // Left empty as per instructions
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                setAiSummary(result.candidates[0].content.parts[0].text);
            } else {
                setAiSummary("Could not generate summary. The model may be unavailable or the response was invalid.");
            }
        } catch (error) {
            console.error("AI Summary Error:", error);
            setAiSummary("An error occurred while generating the summary. Please check the console.");
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const lastDataPoint = displayData.slice(-1)[0] || {};
    const monteCarloData = runMonteCarlo(lastDataPoint.price || 0, lastDataPoint.volatility || 0);

    return (
        <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
            <AssetDrillDownModal isOpen={!!drillDownAsset} onClose={() => setDrillDownAsset(null)} commodity={drillDownAsset} data={allData[drillDownAsset]} />
            <header className="bg-white shadow-sm sticky top-0 z-30"><div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center"><div className="flex items-center"><Briefcase className="h-8 w-8 text-blue-600 mr-3" /><h1 className="text-xl md:text-2xl font-bold">PricePeak</h1></div><div className="flex items-center space-x-4"><div className="text-right"><div className="font-medium text-sm text-gray-700">{time.toLocaleTimeString()}</div><div className="text-xs font-bold text-yellow-600">SIMULATED DATA</div></div></div></div></header>

            <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <PortfolioBuilder portfolio={portfolio} setPortfolio={setPortfolio} onAssetClick={setDrillDownAsset} savePortfolio={savePortfolio} loadPortfolio={loadPortfolio} />
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h3 className="font-semibold text-gray-700 mb-4 flex items-center">Economic Calendar <InfoTooltip text="Key economic releases that can impact market volatility and prices."/></h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">{economicCalendar.map((event, i) => (<div key={i} className="p-2 rounded-lg bg-gray-50 text-xs"><div className="flex justify-between items-center"><span className="font-bold">{event.event}</span><span className={`font-semibold px-2 py-0.5 rounded-full ${event.importance === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{event.importance}</span></div><div className="text-gray-500">{event.date} - {event.time}</div></div>))}</div>
                    </div>
                </div>

                <div className="lg:col-span-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <StatCard icon={<DollarSign size={20} />} title="Portfolio Price" value={lastDataPoint.price?.toFixed(2) || 'N/A'} unit="USD" />
                        <StatCard icon={<Zap size={20} />} title="Portfolio Volatility" value={lastDataPoint.volatility?.toFixed(2) || 'N/A'} unit="%" />
                        <StatCard icon={<Shield size={20} />} title="VaR (95%, 30-day)" value={`$${monteCarloData.var_95?.toFixed(2) || 'N/A'}`} unit="" />
                        <StatCard icon={<Shield className="text-red-500"/>} title="CVaR (95%, 30-day)" value={`$${monteCarloData.cvar_95?.toFixed(2) || 'N/A'}`} unit="" />
                    </div>
                    <div className="bg-white rounded-lg shadow-md">
                        <div className="p-4 border-b flex justify-between items-center flex-wrap gap-2">
                            <h3 className="text-lg font-semibold">Portfolio Analysis</h3>
                            <div className="flex space-x-1 sm:space-x-2"><TabButton label="Technicals" isActive={activeTab === 'Price'} onClick={() => setActiveTab('Price')} /><TabButton label="Backtesting" isActive={activeTab === 'Backtesting'} onClick={() => setActiveTab('Backtesting')} /><TabButton label="Optimization" isActive={activeTab === 'Optimization'} onClick={() => setActiveTab('Optimization')} /><TabButton label="AI Summary" isActive={activeTab === 'AI'} onClick={() => setActiveTab('AI')} /></div>
                        </div>
                        
                        {loading ? <div className="h-96 flex justify-center items-center"><p>Loading Market Data...</p></div> :
                        <div className="p-4 min-h-[500px]">
                            {activeTab === 'Price' && <div>
                                <div className="flex justify-end items-center space-x-4 mb-2 text-sm"><label className="flex items-center"><input type="checkbox" checked={showBollinger} onChange={() => setShowBollinger(!showBollinger)} className="mr-1"/>Bollinger Bands</label></div>
                                <ResponsiveContainer width="100%" height={300}><ComposedChart data={displayData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 12 }} /><YAxis domain={['dataMin - 10', 'dataMax + 10']} tickFormatter={(v) => `$${v.toFixed(2)}`} tick={{ fontSize: 12 }} /><Tooltip /><Area type="monotone" dataKey="price" name="Price" stroke="none" fill="#8884d8" fillOpacity={0.1} />{showBollinger && <Line dataKey="bollingerUpper" name="Upper Band" stroke="#ffc658" dot={false} strokeDasharray="3 3" />}{showBollinger && <Line dataKey="bollingerLower" name="Lower Band" stroke="#ffc658" dot={false} strokeDasharray="3 3" />}{displayData.map((d, i) => <CustomCandle key={i} {...d} />)}</ComposedChart></ResponsiveContainer>
                                <h4 className="font-semibold text-gray-600 mt-4 mb-2 text-sm flex items-center">RSI (14-Day) <InfoTooltip text="Relative Strength Index. Above 70 is considered overbought, below 30 is oversold."/></h4>
                                <ResponsiveContainer width="100%" height={100}><BarChart data={displayData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" hide /><YAxis domain={[0, 100]} ticks={[30, 70]} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="rsi"><Cell fill="#8884d8"/></Bar></BarChart></ResponsiveContainer>
                            </div>}
                            {activeTab === 'Backtesting' && <div>
                                <div className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between mb-4"><div className="flex items-center gap-4"><label className="font-medium">Strategy:</label><select value={backtestStrategy} onChange={e => setBacktestStrategy(e.target.value)} className="p-1 border rounded-md text-sm"><option>Momentum</option><option>MeanReversion</option></select></div><div className="flex items-center gap-4"><label className="font-medium">Period:</label><input type="number" value={backtestParam} onChange={e => setBacktestParam(Number(e.target.value))} className="w-20 p-1 border rounded-md text-sm"/></div><button onClick={handleRunBacktest} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"><SlidersHorizontal className="h-4 w-4 mr-2"/>Run Backtest</button></div>
                                {backtestResults ? <div><h4 className="font-semibold text-gray-600 mb-2">Equity Curve</h4><ResponsiveContainer width="100%" height={300}><ComposedChart data={backtestResults.equityCurve}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 10 }}/><YAxis tickFormatter={(v) => `$${v.toLocaleString()}`} domain={['dataMin - 500', 'dataMax + 500']}/><Tooltip formatter={(v) => `$${v.toFixed(2)}`}/><Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} /></ComposedChart></ResponsiveContainer><div className="mt-4 grid grid-cols-2 gap-4 text-center"><StatCard icon={<DollarSign size={20}/>} title="Final Value" value={`$${backtestResults.finalValue}`} /><StatCard icon={<Activity size={20}/>} title="Total Return" value={`${backtestResults.totalReturn}%`} /></div></div> : <div className="text-center text-gray-500 py-16">Select a strategy and click "Run Backtest" to see results.</div>}
                            </div>}
                            {activeTab === 'Optimization' && <div>
                                <h4 className="font-semibold text-gray-600 mb-4 flex items-center">Efficient Frontier <InfoTooltip text="Each point is a possible portfolio. The curve shows the best possible return for a given level of risk."/></h4>
                                <ResponsiveContainer width="100%" height={400}><ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}><CartesianGrid /><XAxis type="number" dataKey="x" name="Volatility" unit="%" tick={{ fontSize: 10 }} /><YAxis type="number" dataKey="y" name="Return" unit="%" tick={{ fontSize: 10 }} /><ZAxis type="number" dataKey="z" name="Sharpe" range={[20, 100]} /><Tooltip cursor={{ strokeDasharray: '3 3' }} /><Scatter name="Portfolios" data={efficientFrontier.points} fill="#8884d8" fillOpacity={0.6} /><Scatter name="Min Volatility" data={[efficientFrontier.minVolPortfolio]} fill="#82ca9d" shape="star" /><Scatter name="Max Sharpe" data={[efficientFrontier.maxSharpePortfolio]} fill="#ffc658" shape="triangle" /><Legend /></ScatterChart></ResponsiveContainer>
                            </div>}
                            {activeTab === 'AI' && <div className="text-center py-8">
                                <h4 className="font-semibold text-gray-600 mb-4 flex items-center justify-center">Generative AI Summary <InfoTooltip text="An AI-generated analysis of the current portfolio state based on all available data."/></h4>
                                <button onClick={generateAiSummary} disabled={isGeneratingSummary} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center disabled:bg-gray-400 mx-auto"><Sparkles className="h-4 w-4 mr-2"/>{isGeneratingSummary ? 'Generating...' : 'Generate AI Summary'}</button>
                                {isGeneratingSummary && <div className="mt-6 text-gray-500">Contacting AI model...</div>}
                                {aiSummary && <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left text-sm leading-6 whitespace-pre-wrap">{aiSummary}</div>}
                            </div>}
                        </div>}
                    </div>
                </div>
            </main>
            <footer className="text-center py-4 text-sm text-gray-500 mt-4"><p>PricePeak | All data is simulated for demonstration purposes.</p></footer>
        </div>
    );
}
