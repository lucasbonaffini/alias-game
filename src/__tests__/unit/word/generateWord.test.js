// Importa el servicio que contiene la función
const WordService = require('../../../services/wordService');

describe('WordService', () => {
  let wordService;

  beforeEach(() => {
    wordService = new WordService();
  });

  it('should generate a word successfully', async () => {
    const mockWord = 'exampleWord';
    const mockOptions = { exactly: 1 }; 

    jest.spyOn(wordService, 'generateWord').mockImplementation(async () => {
      return mockWord;
    });

    const word = await wordService.generateWord(mockOptions); 

    expect(word).toBe(mockWord); 
  });

  it('should throw an error if word generation fails', async () => {
    jest.spyOn(wordService, 'generateWord').mockImplementation(async () => {
      throw new Error('Word generation failed');
    });

    await expect(wordService.generateWord()).rejects.toThrow('Word generation failed');
  });
});
