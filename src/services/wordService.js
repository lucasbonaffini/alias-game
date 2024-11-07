
const options = {
  minLength: 3, // Minimum word length
  maxLength: 8  // Maximum word length 
};

class WordService {
 
  //new 
  async generateWord() {
    try {
      const randomWords = await import('random-words'); // Import dynamically
      const wordData = randomWords.generate(options); // Access the default export
      console.log(`Generated word: ${wordData}`);
      return wordData; // Return the new word
    } catch (error) {
      console.error('Error generating word:', error);
      throw new Error('Error generating word');
    }
  }

  //new 
  async checkUserGuess(wordToGuess, userInput, threshold = 3) {
    const leven = (await import('leven')).default;
    const distance = leven(wordToGuess, userInput);

    //if the word is exactly the same
    if (wordToGuess.toLowerCase() === userInput.toLowerCase()) {
      console.log(`The word '${userInput}' is exactly the same as '${wordToGuess}'`);
      return 4;  //return 4 points
    }
    
    // If the word is similar enough
    if (distance <= threshold) {
      console.log(`The word '${userInput}' is considered similar to '${wordToGuess}' with a distance of ${distance}`);
      return 2;  //return 2 points
    } 
    
    // If the word is not similar enough
    console.log(`The word '${userInput}' is not similar enough to '${wordToGuess}'`);
    return 0;  //return 0 points
  }
  
}

module.exports = WordService;

