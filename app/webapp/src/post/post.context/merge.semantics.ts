import { useState } from "react";

const DEBUG = true;

type ListAction = {
  type: 'add' | 'remove';
  item: string;
};

export const useKeywordsMerge = () => {

  const [deltas, setDeltas] = useState<ListAction[]>([]);

  const addDelta = (action: ListAction): void {
    deltas.push(action)
    setDeltas([...deltas]);
    if (DEBUG) console.log(`addDelta ${action.item} - ${action.type}.`);
  }

  // Adds a keyword to the local list and queue the action
  addItem(item: string): void {
    this.addDelta({ type: 'add', item });
  }

  // Removes a keyword from the local list and queue the action
  removeItem(item: string): void {
    this.addDelta({ type: 'remove', item });
  }

  getCurrent(): string[] {
    const base = this.localList;
  }

  // Merges backend updates with the local list considering the local change queue
  mergeBackendUpdates(receivedKeywords: string[]): void {
    console.log('Processing backend update...');

    // Process each action in the queue to see if it has been reflected in the receivedKeywords
    let currentKeywords = [...receivedKeywords];
    this.changeQueue.forEach((action) => {
      const index = currentKeywords.indexOf(action.keyword);
      if (action.type === 'add' && index === -1) {
        currentKeywords.push(action.keyword);
      } else if (action.type === 'remove' && index !== -1) {
        currentKeywords.splice(index, 1);
      }
    });

    // Update the local keywords and clear the queue
    this.localKeywords = currentKeywords;
    this.changeQueue = [];

    if (DEBUG)
      console.log(
        `Current local keywords after merge: ${this.localKeywords.join(', ')}`
      );
  }

  // Simulate receiving an update from the backend
  receiveBackendUpdate(updatedKeywords: string[]): void {
    this.mergeBackendUpdates(updatedKeywords);
  }
}

// Example usage:
const keywordManager = new KeywordSyncManager(['initial', 'keywords']);
keywordManager.addKeyword('new');
keywordManager.removeKeyword('initial');
keywordManager.receiveBackendUpdate(['keywords', 'new']); // Simulated backend update
