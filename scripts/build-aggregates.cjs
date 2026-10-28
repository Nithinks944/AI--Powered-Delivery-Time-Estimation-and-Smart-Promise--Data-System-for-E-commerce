// scripts/build-aggregates.js
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const CSV_PATH = path.join(__dirname, '..', 'public', 'data', 'preprocessed_delivery_dataset.csv');
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data', 'aggregates');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('Reading dataset and building aggregates...');

const byMonth = {};
const byDate = {};
const byCategory = {};
const byCustomerState = {};
const bySellerState = {};
const byRoute = {};
const hourWeekdayMatrix = Array.from({ length: 7 }, () =>
  Array.from({ length: 24 }, () => ({ count: 0, revenue: 0, deliveryDaysSum: 0 }))
);

let totalOrders = 0;
let totalRevenue = 0;
let totalFreight = 0;
let totalDeliveryDays = 0;
let totalEstimatedDays = 0;
let onTimeOrders = 0;
let lateOrders = 0;
let sameStateOrders = 0;
let minDate = '9999-99-99';
let maxDate = '0000-00-00';

const deliveryDaysList = [];
const estimatedDaysList = [];
const totalPriceList = [];

const rl = readline.createInterface({
  input: fs.createReadStream(CSV_PATH),
  crlfDelay: Infinity,
});

let isHeader = true;
let headerCols = [];

rl.on('line', (line) => {
  if (isHeader) {
    headerCols = line.split(',');
    isHeader = false;
    return;
  }
  if (!line.trim()) return;

  const cols = line.split(',');
  const orderId = cols[0];
  const timestamp = cols[1];
  const itemCount = parseInt(cols[2], 10) || 1;
  const totalPrice = parseFloat(cols[3]) || 0;
  const totalFreightVal = parseFloat(cols[4]) || 0;
  const sellerCount = parseInt(cols[5], 10) || 1;
  const category = cols[6] || 'other';
  const customerState = cols[7] || 'UNKNOWN';
  const sellerState = cols[8] || 'UNKNOWN';
  const purchaseMonth = parseInt(cols[9], 10);
  const purchaseDow = parseInt(cols[10], 10); // 0 = Mon
  const purchaseHour = parseInt(cols[11], 10);
  const isWeekend = parseInt(cols[12], 10) || 0;
  const sameState = parseInt(cols[13], 10) || 0;
  const estDays = parseFloat(cols[14]) || 0;
  const actDays = parseFloat(cols[15]) || 0;

  const dateStr = timestamp.slice(0, 10);
  const yearMonth = timestamp.slice(0, 7);

  if (dateStr < minDate) minDate = dateStr;
  if (dateStr > maxDate) maxDate = dateStr;

  const isLate = actDays > estDays;
  totalOrders++;
  totalRevenue += totalPrice;
  totalFreight += totalFreightVal;
  totalDeliveryDays += actDays;
  totalEstimatedDays += estDays;
  if (isLate) lateOrders++;
  else onTimeOrders++;
  if (sameState === 1) sameStateOrders++;

  // Collect samples for percentile calculations
  if (totalOrders % 5 === 0) {
    deliveryDaysList.push(actDays);
    estimatedDaysList.push(estDays);
    totalPriceList.push(totalPrice);
  }

  // byMonth
  if (!byMonth[yearMonth]) {
    byMonth[yearMonth] = {
      yearMonth,
      orders: 0,
      revenue: 0,
      freight: 0,
      deliveryDaysSum: 0,
      estimatedDaysSum: 0,
      onTimeCount: 0,
      lateCount: 0,
    };
  }
  const bm = byMonth[yearMonth];
  bm.orders++;
  bm.revenue += totalPrice;
  bm.freight += totalFreightVal;
  bm.deliveryDaysSum += actDays;
  bm.estimatedDaysSum += estDays;
  if (isLate) bm.lateCount++;
  else bm.onTimeCount++;

  // byDate
  if (!byDate[dateStr]) {
    byDate[dateStr] = {
      date: dateStr,
      orders: 0,
      revenue: 0,
      deliveryDaysSum: 0,
      estimatedDaysSum: 0,
      lateCount: 0,
    };
  }
  const bd = byDate[dateStr];
  bd.orders++;
  bd.revenue += totalPrice;
  bd.deliveryDaysSum += actDays;
  bd.estimatedDaysSum += estDays;
  if (isLate) bd.lateCount++;

  // byCategory
  if (!byCategory[category]) {
    byCategory[category] = {
      category,
      orders: 0,
      revenue: 0,
      freight: 0,
      deliveryDaysSum: 0,
      estimatedDaysSum: 0,
      lateCount: 0,
    };
  }
  const bc = byCategory[category];
  bc.orders++;
  bc.revenue += totalPrice;
  bc.freight += totalFreightVal;
  bc.deliveryDaysSum += actDays;
  bc.estimatedDaysSum += estDays;
  if (isLate) bc.lateCount++;

  // byCustomerState
  if (!byCustomerState[customerState]) {
    byCustomerState[customerState] = {
      state: customerState,
      orders: 0,
      revenue: 0,
      freight: 0,
      deliveryDaysSum: 0,
      estimatedDaysSum: 0,
      lateCount: 0,
      sameStateCount: 0,
    };
  }
  const bcs = byCustomerState[customerState];
  bcs.orders++;
  bcs.revenue += totalPrice;
  bcs.freight += totalFreightVal;
  bcs.deliveryDaysSum += actDays;
  bcs.estimatedDaysSum += estDays;
  if (isLate) bcs.lateCount++;
  if (sameState === 1) bcs.sameStateCount++;

  // byRoute
  const routeKey = `${sellerState}->${customerState}`;
  if (!byRoute[routeKey]) {
    byRoute[routeKey] = {
      sellerState,
      customerState,
      orders: 0,
      revenue: 0,
      freight: 0,
      deliveryDaysSum: 0,
      estimatedDaysSum: 0,
      lateCount: 0,
    };
  }
  const br = byRoute[routeKey];
  br.orders++;
  br.revenue += totalPrice;
  br.freight += totalFreightVal;
  br.deliveryDaysSum += actDays;
  br.estimatedDaysSum += estDays;
  if (isLate) br.lateCount++;

  // Matrix
  if (purchaseDow >= 0 && purchaseDow < 7 && purchaseHour >= 0 && purchaseHour < 24) {
    hourWeekdayMatrix[purchaseDow][purchaseHour].count++;
    hourWeekdayMatrix[purchaseDow][purchaseHour].revenue += totalPrice;
    hourWeekdayMatrix[purchaseDow][purchaseHour].deliveryDaysSum += actDays;
  }
});

rl.on('close', () => {
  console.log(`Processing complete. Total rows: ${totalOrders}`);

  // Sort helper for percentiles
  deliveryDaysList.sort((a, b) => a - b);
  estimatedDaysList.sort((a, b) => a - b);
  totalPriceList.sort((a, b) => a - b);

  const getP = (arr, p) => arr[Math.floor(arr.length * p)];

  const summary = {
    totalOrders,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalFreight: Math.round(totalFreight * 100) / 100,
    avgOrderValue: Math.round((totalRevenue / totalOrders) * 100) / 100,
    avgFreight: Math.round((totalFreight / totalOrders) * 100) / 100,
    freightRatio: Math.round((totalFreight / totalRevenue) * 10000) / 100, // percentage
    avgDeliveryDays: Math.round((totalDeliveryDays / totalOrders) * 10) / 10,
    avgEstimatedDays: Math.round((totalEstimatedDays / totalOrders) * 10) / 10,
    avgDelayGap: Math.round(((totalDeliveryDays - totalEstimatedDays) / totalOrders) * 10) / 10,
    onTimeRate: Math.round((onTimeOrders / totalOrders) * 1000) / 10, // percentage
    lateRate: Math.round((lateOrders / totalOrders) * 1000) / 10,
    sameStateShare: Math.round((sameStateOrders / totalOrders) * 1000) / 10,
    dateRange: { start: minDate, end: maxDate },
    p50DeliveryDays: getP(deliveryDaysList, 0.5),
    p90DeliveryDays: getP(deliveryDaysList, 0.9),
    p99DeliveryDays: getP(deliveryDaysList, 0.99),
    p99EstimatedDays: getP(estimatedDaysList, 0.99),
    p99TotalPrice: getP(totalPriceList, 0.99),
  };

  const monthlyList = Object.values(byMonth)
    .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth))
    .map((m) => ({
      yearMonth: m.yearMonth,
      orders: m.orders,
      revenue: Math.round(m.revenue),
      avgFreight: Math.round((m.freight / m.orders) * 100) / 100,
      avgDeliveryDays: Math.round((m.deliveryDaysSum / m.orders) * 10) / 10,
      avgEstimatedDays: Math.round((m.estimatedDaysSum / m.orders) * 10) / 10,
      onTimeRate: Math.round((m.onTimeCount / m.orders) * 1000) / 10,
      lateRate: Math.round((m.lateCount / m.orders) * 1000) / 10,
    }));

  const stateList = Object.values(byCustomerState)
    .map((s) => ({
      state: s.state,
      orders: s.orders,
      revenue: Math.round(s.revenue),
      avgFreight: Math.round((s.freight / s.orders) * 100) / 100,
      avgDeliveryDays: Math.round((s.deliveryDaysSum / s.orders) * 10) / 10,
      avgEstimatedDays: Math.round((s.estimatedDaysSum / s.orders) * 10) / 10,
      lateRate: Math.round((s.lateCount / s.orders) * 1000) / 10,
      sameStateShare: Math.round((s.sameStateCount / s.orders) * 1000) / 10,
    }))
    .sort((a, b) => b.orders - a.orders);

  const categoryList = Object.values(byCategory)
    .map((c) => ({
      category: c.category,
      orders: c.orders,
      revenue: Math.round(c.revenue),
      avgFreight: Math.round((c.freight / c.orders) * 100) / 100,
      avgDeliveryDays: Math.round((c.deliveryDaysSum / c.orders) * 10) / 10,
      lateRate: Math.round((c.lateCount / c.orders) * 1000) / 10,
      freightRatio: Math.round((c.freight / c.revenue) * 1000) / 10,
    }))
    .sort((a, b) => b.orders - a.orders);

  const routeList = Object.values(byRoute)
    .map((r) => ({
      sellerState: r.sellerState,
      customerState: r.customerState,
      orders: r.orders,
      revenue: Math.round(r.revenue),
      avgFreight: Math.round((r.freight / r.orders) * 100) / 100,
      avgDeliveryDays: Math.round((r.deliveryDaysSum / r.orders) * 10) / 10,
      avgEstimatedDays: Math.round((r.estimatedDaysSum / r.orders) * 10) / 10,
      lateRate: Math.round((r.lateCount / r.orders) * 1000) / 10,
    }))
    .sort((a, b) => b.orders - a.orders);

  const dateList = Object.values(byDate)
    .map((d) => ({
      date: d.date,
      orders: d.orders,
      revenue: Math.round(d.revenue),
      avgDeliveryDays: Math.round((d.deliveryDaysSum / d.orders) * 10) / 10,
      lateRate: Math.round((d.lateCount / d.orders) * 1000) / 10,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const heatmapData = [];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  for (let dow = 0; dow < 7; dow++) {
    for (let hour = 0; hour < 24; hour++) {
      const cell = hourWeekdayMatrix[dow][hour];
      heatmapData.push({
        dayIndex: dow,
        dayName: dayNames[dow],
        hour,
        orders: cell.count,
        revenue: Math.round(cell.revenue),
        avgDeliveryDays: cell.count ? Math.round((cell.deliveryDaysSum / cell.count) * 10) / 10 : 0,
      });
    }
  }

  // Centroids for 27 Brazilian states for distance & flow visualization
  const stateCentroids = {
    AC: { name: 'Acre', lat: -9.0238, lng: -70.812, region: 'North' },
    AL: { name: 'Alagoas', lat: -9.5713, lng: -36.782, region: 'Northeast' },
    AP: { name: 'Amapá', lat: 1.41, lng: -51.77, region: 'North' },
    AM: { name: 'Amazonas', lat: -3.47, lng: -65.1, region: 'North' },
    BA: { name: 'Bahia', lat: -12.97, lng: -38.51, region: 'Northeast' },
    CE: { name: 'Ceará', lat: -5.2, lng: -39.5, region: 'Northeast' },
    DF: { name: 'Distrito Federal', lat: -15.78, lng: -47.93, region: 'Central-West' },
    ES: { name: 'Espírito Santo', lat: -19.19, lng: -40.34, region: 'Southeast' },
    GO: { name: 'Goiás', lat: -15.98, lng: -49.86, region: 'Central-West' },
    MA: { name: 'Maranhão', lat: -5.42, lng: -45.44, region: 'Northeast' },
    MT: { name: 'Mato Grosso', lat: -12.64, lng: -55.42, region: 'Central-West' },
    MS: { name: 'Mato Grosso do Sul', lat: -20.51, lng: -54.54, region: 'Central-West' },
    MG: { name: 'Minas Gerais', lat: -18.1, lng: -44.38, region: 'Southeast' },
    PA: { name: 'Pará', lat: -3.79, lng: -52.48, region: 'North' },
    PB: { name: 'Paraíba', lat: -7.28, lng: -36.72, region: 'Northeast' },
    PR: { name: 'Paraná', lat: -24.89, lng: -51.55, region: 'South' },
    PE: { name: 'Pernambuco', lat: -8.38, lng: -37.86, region: 'Northeast' },
    PI: { name: 'Piauí', lat: -6.6, lng: -42.28, region: 'Northeast' },
    RJ: { name: 'Rio de Janeiro', lat: -22.91, lng: -43.2, region: 'Southeast' },
    RN: { name: 'Rio Grande do Norte', lat: -5.81, lng: -36.59, region: 'Northeast' },
    RS: { name: 'Rio Grande do Sul', lat: -30.17, lng: -53.5, region: 'South' },
    RO: { name: 'Rondônia', lat: -10.9, lng: -62.8, region: 'North' },
    RR: { name: 'Roraima', lat: 1.99, lng: -61.33, region: 'North' },
    SC: { name: 'Santa Catarina', lat: -27.45, lng: -50.95, region: 'South' },
    SP: { name: 'São Paulo', lat: -23.55, lng: -46.63, region: 'Southeast' },
    SE: { name: 'Sergipe', lat: -10.57, lng: -37.45, region: 'Northeast' },
    TO: { name: 'Tocantins', lat: -9.46, lng: -48.26, region: 'North' },
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'by_month.json'), JSON.stringify(monthlyList, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'by_state.json'), JSON.stringify(stateList, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'by_category.json'), JSON.stringify(categoryList, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'by_routes.json'), JSON.stringify(routeList, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'by_date.json'), JSON.stringify(dateList, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'by_hour_weekday.json'), JSON.stringify(heatmapData, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'state_centroids.json'), JSON.stringify(stateCentroids, null, 2));

  console.log('Precomputed aggregates successfully written to public/data/aggregates/');
});
