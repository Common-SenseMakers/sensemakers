import * as readline from 'readline';

// Import readline module

// const DEBUG = true;

// Function to prompt user for database deletion
export async function promptUser(
  question: string,
  yesAnswer: string = 'Y'
): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toUpperCase() === yesAnswer);
    });
  });
}
