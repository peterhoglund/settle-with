import React, { useMemo } from 'react';
import { Person, Transaction } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSackDollar, 
  faScaleBalanced, 
  faCrown, 
  faPiggyBank, 
  faBullseye, 
  faAward, 
  faCircleHalfStroke, 
  faHandsClapping 
} from '@fortawesome/free-solid-svg-icons';

interface FunStatsDisplayProps {
  people: Person[];
  transactions: Transaction[];
}

// Helper function to calculate a color based on a percentage
const getPercentageColor = (percentage: number): string => {
  const hue = (percentage / 100) * 120; // 0 (red) to 120 (green)
  return `hsl(${hue}, 70%, 50%)`;
};


export const FunStatsDisplay: React.FC<FunStatsDisplayProps> = ({ people, transactions }) => {
  const stats = useMemo(() => {
    if (people.length === 0) {
      return {
        totalSpent: 0,
        averageSpent: 0,
        bigSpender: null,
        pennyPincher: null,
        perfectBalancePerson: null,
        wealthDisparity: 0,
        spendingEquality: 100,
        sponsor: null,
      };
    }

    const totalSpent = people.reduce((sum, p) => sum + p.amountSpent, 0);
    const averageSpent = people.length > 0 ? totalSpent / people.length : 0;

    let bigSpender: (Person & { percentageOfTotal: number }) | null = null;
    if (people.length > 0) {
      const spender = people.reduce((max, p) => (p.amountSpent > max.amountSpent ? p : max), people[0]);
      bigSpender = {
        ...spender,
        percentageOfTotal: totalSpent > 0 ? (spender.amountSpent / totalSpent) * 100 : 0,
      };
    }

    let pennyPincher: (Person & { percentageOfTotal: number }) | null = null;
    if (people.length > 0) {
      const spender = people.reduce((min, p) => (p.amountSpent < min.amountSpent ? p : min), people[0]);
      pennyPincher = {
        ...spender,
        percentageOfTotal: totalSpent > 0 ? (spender.amountSpent / totalSpent) * 100 : 0,
      };
    }

    let perfectBalancePerson: (Person & { diffFromAverage: number }) | null = null;
    if (people.length > 0) {
      const sortedByDiff = people
        .map(p => ({ ...p, diffFromAverage: Math.abs(p.amountSpent - averageSpent) }))
        .sort((a, b) => a.diffFromAverage - b.diffFromAverage);
      perfectBalancePerson = sortedByDiff[0];
    }

    const wealthDisparity = bigSpender && pennyPincher ? bigSpender.amountSpent - pennyPincher.amountSpent : 0;

    let spendingEquality = 100;
    if (people.length > 1 && averageSpent > 0.005) {
        const mean = averageSpent;
        const stdDev = Math.sqrt(people.reduce((sum, p) => sum + Math.pow(p.amountSpent - mean, 2), 0) / people.length);
        const cv = stdDev / mean;
        spendingEquality = Math.max(0, Math.min(100, (1 - cv) * 100));
    } else if (people.length <= 1 || (averageSpent < 0.005 && totalSpent < 0.005) ) {
        spendingEquality = 100;
    } else if (averageSpent < 0.005 && totalSpent > 0.005) {
        spendingEquality = 0;
    }


    let sponsor: { name: string; amountOwed: number } | null = null;
    if (transactions.length > 0) {
      const owedToMap: { [key: string]: number } = {};
      people.forEach(p => owedToMap[p.name] = 0);

      transactions.forEach(t => {
        owedToMap[t.to] = (owedToMap[t.to] || 0) + t.amount;
      });

      let maxOwed = 0;
      let sponsorName = '';
      for (const name in owedToMap) {
        if (owedToMap[name] > maxOwed) {
          maxOwed = owedToMap[name];
          sponsorName = name;
        }
      }
      if (maxOwed > 0.005) {
        sponsor = { name: sponsorName, amountOwed: maxOwed };
      }
    }

    return {
      totalSpent,
      averageSpent,
      bigSpender,
      pennyPincher,
      perfectBalancePerson,
      wealthDisparity,
      spendingEquality,
      sponsor,
    };
  }, [people, transactions]);


  if (people.length <= 1) {
    return (
      <div className="text-center py-6">
        <p className="text-light-textSecondary text-lg">Add more participants to see detailed spending stats!</p>
      </div>
    );
  }

  const statItemBaseDelay = 0.05;
  const statItemStagger = 0.07;
  let currentStaggerIndex = 0;

  const renderStatCard = (
    title: string,
    iconElement: JSX.Element, // Changed from iconSvgElement to iconElement
    content: JSX.Element,
    colorClass: string = "text-light-primary"
  ) => (
    <div
      className="bg-white/80 p-5 rounded-xl shadow-lg border border-light-border/70 animate-fadeIn flex flex-col min-h-[160px]"
      style={{ animationDelay: `${statItemBaseDelay + statItemStagger * currentStaggerIndex++}s` }}
    >
      <div className="flex items-center mb-3">
        <span className={`mr-2.5 ${colorClass}`} aria-hidden="true">
          {iconElement}
        </span>
        <h3 className={`font-semibold ${colorClass}`}>{title}</h3>
      </div>
      <div className="flex-grow flex flex-col justify-center">
        {content}
      </div>
    </div>
  );

  // Specific card contents
  const totalSpendContent = (
    <>
      <p className="text-4xl font-bold text-light-primary text-center">{stats.totalSpent.toFixed(2)}</p>
    </>
  );

  const averageSpendContent = (
    <>
      <p className="text-4xl font-bold text-teal-600 text-center">{stats.averageSpent.toFixed(2)}</p>
      <p className="text-sm text-light-textSecondary text-center mt-1">Fair share per person</p>
    </>
  );

  const bigSpenderContent = stats.bigSpender ? (
    <>
      <p className="text-2xl font-bold text-orange-500 truncate text-center" title={stats.bigSpender.name}>
        {stats.bigSpender.name}
      </p>
      <p className="text-lg text-light-text text-center mt-1">
        Spent: {stats.bigSpender.amountSpent.toFixed(2)} ({stats.bigSpender.percentageOfTotal.toFixed(0)}%)
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
        <div
          className="bg-orange-500 h-2.5 rounded-full"
          style={{ width: `${stats.bigSpender.percentageOfTotal.toFixed(0)}%` }}
        ></div>
      </div>
    </>
  ) : <p className="text-light-textSecondary text-center">N/A</p>;

  const pennyPincherContent = stats.pennyPincher ? (
    <>
      <p className="text-2xl font-bold text-pink-500 truncate text-center" title={stats.pennyPincher.name}>
        {stats.pennyPincher.name}
      </p>
      <p className="text-lg text-light-text text-center mt-1">
        Spent: {stats.pennyPincher.amountSpent.toFixed(2)} ({stats.pennyPincher.percentageOfTotal.toFixed(0)}%)
      </p>
       <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
        <div
          className="bg-pink-500 h-2.5 rounded-full"
          style={{ width: `${stats.pennyPincher.percentageOfTotal.toFixed(0)}%` }}
        ></div>
      </div>
    </>
  ) : <p className="text-light-textSecondary text-center">N/A</p>;

  const perfectBalanceContent = stats.perfectBalancePerson ? (
     <>
      <p className="text-2xl font-bold text-green-600 truncate text-center" title={`${stats.perfectBalancePerson.name} was ${stats.perfectBalancePerson.diffFromAverage.toFixed(2)} from the average`}>
        {stats.perfectBalancePerson.name} at {stats.perfectBalancePerson.diffFromAverage.toFixed(2)}
      </p>
      <p className="text-lg text-light-text text-center mt-1">
        Spent: {stats.perfectBalancePerson.amountSpent.toFixed(2)}, Avg: {stats.averageSpent.toFixed(2)}
      </p>
    </>
  ) : <p className="text-light-textSecondary text-center">N/A</p>;

  const wealthDisparityContent = (
    <div className="text-center">
      <p className="text-3xl font-bold text-red-500">{stats.wealthDisparity.toFixed(2)} gap</p>
      <div className="flex justify-around items-end mt-6 h-12"> 
        <div className="text-xs text-light-textSecondary">
          <div
            className="bg-red-400 mx-auto"
            style={{
              width: '20px',
              height: `${stats.bigSpender && stats.bigSpender.amountSpent > 0.005 ? Math.max(0, (stats.pennyPincher?.amountSpent ?? 0) / stats.bigSpender.amountSpent) * 100 : 0}%`,
              minHeight: '2px'
            }}></div>
          Lowest: {stats.pennyPincher?.amountSpent.toFixed(2) ?? 'N/A'}
        </div>
        <div className="text-xs text-light-textSecondary">
          <div className="bg-green-400 mx-auto" style={{ width: '20px', height: '100%', minHeight: '2px' }}></div>
          Highest: {stats.bigSpender?.amountSpent.toFixed(2) ?? 'N/A'}
        </div>
      </div>
    </div>
  );

  const calculatedSpendingEqualityColor = getPercentageColor(stats.spendingEquality);
  const circumference = 2 * Math.PI * 28; // r = 28
  const strokeDashoffset = circumference * (1 - stats.spendingEquality / 100);

  const spendingEqualityContent = (
     <div className="flex flex-col items-center justify-center">
      <div className="relative w-24 h-24">
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 60 60">
          <circle
            cx="30"
            cy="30"
            r="28"
            stroke="#e5e7eb" // bg-gray-200
            strokeWidth="4"
            fill="transparent"
          />
          <circle
            cx="30"
            cy="30"
            r="28"
            stroke={calculatedSpendingEqualityColor}
            strokeWidth="4"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold" style={{ color: calculatedSpendingEqualityColor }}>
            {stats.spendingEquality.toFixed(0)}%
          </span>
        </div>
      </div>
      <p className="text-sm text-light-textSecondary text-center mt-1">How equally the group spent</p>
    </div>
  );

  const sponsorContent = stats.sponsor ? (
    <>
      <p className="text-2xl font-bold text-purple-600 truncate text-center" title={stats.sponsor.name}>
        {stats.sponsor.name}
      </p>
      <p className="text-lg text-light-text text-center mt-1">
        Owed: {stats.sponsor.amountOwed.toFixed(2)}
      </p>
    </>
  ) : <p className="text-light-textSecondary text-center">All settled or no one is owed significantly.</p>;


  return (
    <div>
      <h2 id="fun-stats-heading" className="text-3xl font-semibold text-light-text font-unica mb-6 border-b border-light-border pb-4">
        Group Spending Stats
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        {renderStatCard(
          "Group Total",
          <FontAwesomeIcon icon={faSackDollar} className="w-6 h-6" />,
          totalSpendContent,
          "text-light-primary"
        )}
        {renderStatCard(
          "Average Spending",
          <FontAwesomeIcon icon={faScaleBalanced} className="w-6 h-6" />,
          averageSpendContent,
          "text-teal-600"
        )}
        {renderStatCard(
          "The Big Spender",
          <FontAwesomeIcon icon={faCrown} className="w-6 h-6" />,
          bigSpenderContent,
          "text-orange-500"
        )}
        {renderStatCard(
          "The Cautious Spender",
          <FontAwesomeIcon icon={faPiggyBank} className="w-6 h-6" />,
          pennyPincherContent,
          "text-pink-500"
        )}
        {renderStatCard(
          "Closest to Average",
          <FontAwesomeIcon icon={faBullseye} className="w-6 h-6" />,
          perfectBalanceContent,
          "text-green-600"
        )}
        {renderStatCard(
          "The Group Sponsor",
          <FontAwesomeIcon icon={faAward} className="w-6 h-6" />,
          sponsorContent,
          "text-purple-600"
        )}
        {renderStatCard(
          "Wealth Gap",
          <FontAwesomeIcon icon={faCircleHalfStroke} className="w-6 h-6" />,
          wealthDisparityContent,
          "text-red-500"
        )}
        {renderStatCard(
          "Equality Meter",
          <FontAwesomeIcon icon={faHandsClapping} className="w-6 h-6" />,
          spendingEqualityContent,
          `text-[${calculatedSpendingEqualityColor}]`
        )}
      </div>
    </div>
  );
};