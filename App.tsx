
import React, { useState, useEffect, useCallback } from 'react';
import { PersonInputForm } from './components/PersonInputForm';
import { PeopleList } from './components/PeopleList';
import { SettlementDisplay } from './components/SettlementDisplay';
import { FunStatsDisplay } from './components/FunStatsDisplay';
import { calculateSettlements } from './utils/expenseCalculator';
import { Person, Transaction } from './types';

// Helper function to convert Uint8Array to Base64 string
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper function to convert Base64 string to Uint8Array
function base64ToUint8Array(base64: string): Uint8Array {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

const App: React.FC = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [shareNotification, setShareNotification] = useState<string | null>(null);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const processUrlData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const compressedDataParam = urlParams.get('cdata');
      const legacyDataParam = urlParams.get('data');
      
      try {
        if (compressedDataParam) {
          if (typeof CompressionStream === 'undefined' || typeof DecompressionStream === 'undefined') {
            console.warn('Compression API not supported, cannot process compressed data.');
            setShareNotification("This browser doesn't support the feature to read this shared link.");
            setTimeout(() => setShareNotification(null), 5000);
            // Clear URL param even if not processed to avoid re-processing on refresh
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            return;
          }
          const compressedUint8Array = base64ToUint8Array(compressedDataParam);
          const blob = new Blob([compressedUint8Array]);
          const decompressionStream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
          const decompressedBuffer = await new Response(decompressionStream).arrayBuffer();
          const decodedJson = new TextDecoder().decode(decompressedBuffer);
          const parsedPeople = JSON.parse(decodedJson);

          if (Array.isArray(parsedPeople) && parsedPeople.every(
            (p: any) => typeof p.id === 'string' &&
                        typeof p.name === 'string' &&
                        typeof p.amountSpent === 'number' && !isNaN(p.amountSpent)
          )) {
            setPeople(parsedPeople as Person[]);
          } else {
            console.warn('Invalid data structure in compressed URL parameter.');
             setShareNotification("Invalid data in shared link.");
             setTimeout(() => setShareNotification(null), 3000);
          }
        } else if (legacyDataParam) {
          const decodedJson = atob(legacyDataParam);
          const parsedPeople = JSON.parse(decodedJson);

          if (Array.isArray(parsedPeople) && parsedPeople.every(
            (p: any) => typeof p.id === 'string' &&
                        typeof p.name === 'string' &&
                        typeof p.amountSpent === 'number' && !isNaN(p.amountSpent)
          )) {
            setPeople(parsedPeople as Person[]);
          } else {
            console.warn('Invalid data structure in URL parameter.');
            setShareNotification("Invalid data in shared link.");
            setTimeout(() => setShareNotification(null), 3000);
          }
        }
      } catch (error) {
        console.error('Failed to parse data from URL:', error);
        setShareNotification("Error reading shared link data.");
        setTimeout(() => setShareNotification(null), 3000);
      } finally {
        if (compressedDataParam || legacyDataParam) {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    };

    if(appReady) { // Ensure app is ready before processing URL data
        processUrlData();
    }
  }, [appReady]);


  const handleAddPerson = useCallback((name: string, amountSpent: number) => {
    const newPerson: Person = {
      id: `person-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name,
      amountSpent,
    };
    setPeople(prevPeople => [...prevPeople, newPerson]);
  }, []);

  const handleRemovePerson = useCallback((personId: string) => {
    setPeople(prevPeople => prevPeople.filter(person => person.id !== personId));
  }, []);

  const handleUpdatePerson = useCallback((personId: string, newName: string, newAmount: number) => {
    setPeople(prevPeople =>
      prevPeople.map(person =>
        person.id === personId
          ? { ...person, name: newName, amountSpent: newAmount }
          : person
      )
    );
  }, []);

  const handleShare = useCallback(async () => {
    if (people.length === 0) {
      setShareNotification("Add participants to share.");
      setTimeout(() => setShareNotification(null), 3000);
      return;
    }
    try {
      if (typeof CompressionStream === 'undefined') {
         console.warn('CompressionStream API not available. Falling back to uncompressed sharing.');
         const jsonToEncode = JSON.stringify(people);
         const encodedData = btoa(jsonToEncode);
         const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
         await navigator.clipboard.writeText(shareUrl);
         setShareNotification("Link copied (uncompressed due to browser limits)!");
      } else {
        const jsonToEncode = JSON.stringify(people);
        const dataStream = new Blob([jsonToEncode], { type: 'text/plain' }).stream();
        const compressedStream = dataStream.pipeThrough(new CompressionStream('gzip'));
        const compressedBuffer = await new Response(compressedStream).arrayBuffer();
        const compressedUint8Array = new Uint8Array(compressedBuffer);
        const encodedData = uint8ArrayToBase64(compressedUint8Array);
        const shareUrl = `${window.location.origin}${window.location.pathname}?cdata=${encodedData}`;

        await navigator.clipboard.writeText(shareUrl);
        setShareNotification("Compressed link copied to clipboard!");
      }
    } catch (err) {
      console.error('Failed to copy link: ', err);
      setShareNotification("Failed to copy link. Try manually.");
    }
    setTimeout(() => setShareNotification(null), 3000);
  }, [people]);

  useEffect(() => {
    if (people.length > 0) {
      const newTransactions = calculateSettlements(people);
      setTransactions(newTransactions);
    } else {
      setTransactions([]);
    }
  }, [people]);

  if (!appReady) {
    return null; 
  }

  const peopleListCardAnimationDelay = 0.3;
  const settlementPlanCardAnimationDelay = 0.1;
  const funStatsCardAnimationDelay = settlementPlanCardAnimationDelay + 0.15;
  const baseItemAnimationDelay = 0.05;

  const jaggedEdgeTexture = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAFCAYAAACjKgd3AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABRSURBVHgBnc5BDcAgEETRlVAJSKiESsFBJSClUiqhElZCJQyfI4QQ4CfvBJOs2SBJNz5EW43RhVd1jnNmHPBoXHkPvfGBhF9zlX+pPd21lyNmNajFub8COB4AAAAASUVORK5CYII=';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Dark Theme Top Section */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full mx-auto">
          <header className="text-center mb-12 animate-fadeIn">
            <h1 className="text-6xl sm:text-7xl font-unica text-brand-text drop-shadow-md">
              Settle With
            </h1>
            <p className="mt-4 text-lg text-brand-textSecondary">
              Settle expenses effortlessly.
            </p>
          </header>

          {shareNotification && (
            <div
              className={`fixed top-5 right-5 p-4 rounded-xl shadow-lg text-white ${
                shareNotification.startsWith("Failed") || shareNotification.startsWith("Error") || shareNotification.startsWith("Invalid data") ? 'bg-red-500/80' : 
                shareNotification.includes("uncompressed") ? 'bg-yellow-500/80' : 
                shareNotification.includes("browser doesn't support") ? 'bg-orange-500/80' : 'bg-green-500/80'
              } backdrop-blur-sm border ${
                shareNotification.startsWith("Failed") || shareNotification.startsWith("Error") || shareNotification.startsWith("Invalid data") ? 'border-red-400' : 
                shareNotification.includes("uncompressed") ? 'border-yellow-400' : 
                shareNotification.includes("browser doesn't support") ? 'border-orange-400' : 'border-green-400'
              } transition-all duration-300 ease-in-out z-50 animate-fadeIn`}
              role="alert"
            >
              {shareNotification}
            </div>
          )}

          <div className="space-y-6">
            <section className="glassmorphic-card rounded-2xl p-6 sm:p-8 animate-fadeInDelayed">
              <PersonInputForm onAddPerson={handleAddPerson} />
            </section>

            {people.length > 0 && (
              <section
                className="glassmorphic-card rounded-2xl p-6 sm:p-8 animate-fadeInDelayed"
                style={{ animationDelay: `${peopleListCardAnimationDelay}s` }}
              >
                <PeopleList
                  people={people}
                  onRemovePerson={handleRemovePerson}
                  onUpdatePerson={handleUpdatePerson}
                  baseItemAnimationDelay={baseItemAnimationDelay}
                />
              </section>
            )}

            {people.length === 0 && (
               <div className="text-center py-12 glassmorphic-card rounded-2xl p-6 animate-fadeInDelayed">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 text-brand-textSecondary opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                 <p className="mt-6 text-xl text-brand-textSecondary">
                   Add participants to see who owes who.
                 </p>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* New Jagged Edge Separator */}
      {people.length > 0 && (
        <div
          aria-hidden="true"
          style={{
            height: '5px', 
            backgroundImage: `url('${jaggedEdgeTexture}')`,
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'center top',
            width: '100%',
            flexShrink: 0,
          }}
          className="animate-fadeIn"
        />
      )}

      {/* Light Theme Bottom Section */}
      {people.length > 0 && (
        <div
          className="text-light-text flex-grow relative"
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: '#F4F7FC' /* light.background */ }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 settlement-background-texture"
            aria-hidden="true"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0"
            style={{
              height: '80px',
              background: 'linear-gradient(to bottom, white 0%, rgba(255, 255, 255, 0) 100%)',
            }}
          />
          
          <div className="relative z-[1] max-w-3xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            <section
              className="bg-light-surface border border-light-border rounded-2xl p-6 sm:p-8 shadow-xl animate-fadeInDelayed"
              style={{animationDelay: `${settlementPlanCardAnimationDelay}s`}}
            >
              <div className="flex justify-between items-center mb-6 border-b border-light-border pb-4">
                <h2 className="text-3xl font-semibold text-light-text font-unica">
                  Who Owes Who?
                </h2>
                <button
                  onClick={handleShare}
                  className="px-4 py-2 bg-light-primary text-white font-semibold rounded-xl shadow-md hover:bg-light-primaryHover focus:outline-none focus:ring-2 focus:ring-light-primary focus:ring-offset-2 focus:ring-offset-light-surface transition-all duration-200 ease-in-out text-sm sm:text-base flex items-center group"
                  aria-label="Share current expense list"
                  disabled={people.length === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  Share
                </button>
              </div>
              <SettlementDisplay transactions={transactions} />
            </section>

            {people.length > 1 && (
              <section
                className="bg-light-surface border border-light-border rounded-2xl p-6 sm:p-8 shadow-xl animate-fadeInDelayed"
                style={{animationDelay: `${funStatsCardAnimationDelay}s`}}
                aria-labelledby="fun-stats-heading"
              >
                <FunStatsDisplay people={people} transactions={transactions} />
              </section>
            )}

          </div>
        </div>
      )}

      <footer className={`text-center py-8 border-t ${
        people.length > 0
          ? 'settlement-background-texture bg-light-background text-light-textSecondary border-light-border'
          : 'text-brand-textSecondary border-brand-border'
      }`}>
        <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm">
            (C) Copyright Settler 2025
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
