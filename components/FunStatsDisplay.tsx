
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
  return `hsl(${hue.toFixed(0)},70%,50%)`; 
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
        const cv = mean === 0 ? (stdDev === 0 ? 0 : Infinity) : stdDev / mean;
        spendingEquality = Math.max(0, Math.min(100, (1 - cv) * 100));
        if (isNaN(spendingEquality)) spendingEquality = 0;
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

  const statItemBaseDelay = 0.05; // Base delay for the first item when stats are shown
  const statItemStagger = 0.07;
  let currentStaggerIndex = 0;

  const renderStatCard = (
    title: string,
    iconElement: JSX.Element,
    content: JSX.Element,
    plateBgClass: string = "bg-cyan-100",
    plateTextClass: string = "text-cyan-700"
  ) => (
    <div
      className="bg-light-surface rounded-xl shadow-xl border border-light-border animate-fadeIn flex flex-col min-h-[220px]"
      style={{ animationDelay: `${statItemBaseDelay + statItemStagger * currentStaggerIndex++}s` }}
    >
      <div className={`flex flex-row items-center justify-center px-4 py-2 rounded-t-xl shadow-sm ${plateBgClass}`}>
        <span className={`mr-2 ${plateTextClass}`} aria-hidden="true">
          {iconElement}
        </span>
        <h3 className={`font-semibold ${plateTextClass}`}>{title}</h3>
      </div>
      <div className="flex-grow flex flex-col justify-center p-5">
        {content}
      </div>
    </div>
  );

  const totalSpendContent = (
    <>
      <p className="font-archivo-black text-7xl text-center text-cyan-600">{stats.totalSpent.toFixed(2)}</p>
    </>
  );

  const averageSpendContent = (
    <>
      <p className="font-archivo-black text-7xl text-center text-teal-600">{stats.averageSpent.toFixed(2)}</p>
      <p className="text-sm text-light-textSecondary text-center mt-1">Fair share per person</p>
    </>
  );

  const bigSpenderContent = stats.bigSpender ? (
    <>
      <p className="font-archivo-black text-5xl truncate text-center text-orange-600" title={stats.bigSpender.name}>
        {stats.bigSpender.name}
      </p>
      <p className="text-lg text-light-text text-center mt-1">
        Spent: {stats.bigSpender.amountSpent.toFixed(2)} ({stats.bigSpender.percentageOfTotal.toFixed(0)}%)
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
        <div
          className="bg-orange-400 h-2.5 rounded-full"
          style={{ width: `${stats.bigSpender.percentageOfTotal.toFixed(0)}%` }}
        ></div>
      </div>
    </>
  ) : <p className="text-light-textSecondary text-center">N/A</p>;

  const pennyPincherContent = stats.pennyPincher ? (
    <>
      <p className="font-archivo-black text-5xl truncate text-center text-pink-600" title={stats.pennyPincher.name}>
        {stats.pennyPincher.name}
      </p>
      <p className="text-lg text-light-text text-center mt-1">
        Spent: {stats.pennyPincher.amountSpent.toFixed(2)} ({stats.pennyPincher.percentageOfTotal.toFixed(0)}%)
      </p>
       <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
        <div
          className="bg-pink-400 h-2.5 rounded-full"
          style={{ width: `${stats.pennyPincher.percentageOfTotal.toFixed(0)}%` }}
        ></div>
      </div>
    </>
  ) : <p className="text-light-textSecondary text-center">N/A</p>;

  const perfectBalanceContent = stats.perfectBalancePerson ? (
     <>
      <p className="font-archivo-black text-7xl text-center text-green-600">
        {stats.perfectBalancePerson.diffFromAverage.toFixed(2)}
      </p>
      <p className="text-xl font-medium text-green-500 truncate text-center mt-1" title={stats.perfectBalancePerson.name}>
         by {stats.perfectBalancePerson.name}
      </p>
      <p className="text-sm text-light-textSecondary text-center">from average spend</p>
    </>
  ) : <p className="text-light-textSecondary text-center">N/A</p>;

  const wealthDisparityContent = (
    <div className="text-center">
      <p className="font-archivo-black text-7xl text-center text-red-600">{stats.wealthDisparity.toFixed(2)}</p>
      <p className="text-xl text-red-500 -mt-1 mb-2">gap</p>
      <div className="flex justify-around items-end mt-2 h-10"> 
        <div className="text-xs text-light-textSecondary">
          <div
            className="bg-red-200 mx-auto"
            style={{
              width: '16px',
              height: `${stats.bigSpender && stats.bigSpender.amountSpent > 0.005 ? Math.max(0, (stats.pennyPincher?.amountSpent ?? 0) / stats.bigSpender.amountSpent) * 100 : 0}%`,
              minHeight: '2px'
            }}></div>
          Low: {stats.pennyPincher?.amountSpent.toFixed(2) ?? 'N/A'}
        </div>
        <div className="text-xs text-light-textSecondary">
          <div className="bg-green-200 mx-auto" style={{ width: '16px', height: '100%', minHeight: '2px' }}></div>
          High: {stats.bigSpender?.amountSpent.toFixed(2) ?? 'N/A'}
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
            stroke="#E5E7EB" 
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
          <span className={`font-archivo-black text-6xl text-[${calculatedSpendingEqualityColor}]`}>
            {stats.spendingEquality.toFixed(0)}%
          </span>
        </div>
      </div>
      <p className="text-sm text-light-textSecondary text-center mt-2">How equally the group spent</p>
    </div>
  );

  const sponsorContent = stats.sponsor ? (
    <>
      <p className="font-archivo-black text-5xl truncate text-center text-purple-600" title={stats.sponsor.name}>
        {stats.sponsor.name}
      </p>
      <p className="text-lg text-light-text text-center mt-1">
        Owed: {stats.sponsor.amountOwed.toFixed(2)}
      </p>
    </>
  ) : <p className="text-light-textSecondary text-center">All settled or no one is owed significantly.</p>;


  return (
    <div>
      {/* The h2 title "Group Spending Stats" has been removed from here and is now part of the clickable header in App.tsx */}
      <div className="grid grid-cols-1 gap-6">
        {renderStatCard(
          "Group Total",
          <FontAwesomeIcon icon={faSackDollar} className="w-6 h-6" />,
          totalSpendContent,
          "bg-cyan-100",
          "text-cyan-700"
        )}
        {renderStatCard(
          "Average Spending",
          <FontAwesomeIcon icon={faScaleBalanced} className="w-6 h-6" />,
          averageSpendContent,
          "bg-teal-100",
          "text-teal-700"
        )}
        {renderStatCard(
          "The Big Spender",
          <FontAwesomeIcon icon={faCrown} className="w-6 h-6" />,
          bigSpenderContent,
          "bg-orange-100",
          "text-orange-700"
        )}
        {renderStatCard(
          "The Cautious Spender",
          <FontAwesomeIcon icon={faPiggyBank} className="w-6 h-6" />,
          pennyPincherContent,
          "bg-pink-100",
          "text-pink-700"
        )}
        {renderStatCard(
          "Closest to Average",
          <FontAwesomeIcon icon={faBullseye} className="w-6 h-6" />,
          perfectBalanceContent,
          "bg-green-100",
          "text-green-700"
        )}
        {renderStatCard(
          "The Group Sponsor",
          <FontAwesomeIcon icon={faAward} className="w-6 h-6" />,
          sponsorContent,
          "bg-purple-100",
          "text-purple-700"
        )}
        {renderStatCard(
          "Wealth Gap",
          <FontAwesomeIcon icon={faCircleHalfStroke} className="w-6 h-6" />,
          wealthDisparityContent,
          "bg-red-100",
          "text-red-700"
        )}
        {renderStatCard(
          "Equality Meter",
          <FontAwesomeIcon icon={faHandsClapping} className="w-6 h-6" />,
          spendingEqualityContent,
          "bg-slate-100",
          "text-slate-700"
        )}
      </div>
    </div>
  );
};
