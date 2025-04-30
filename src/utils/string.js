const mergeConsecutiveWords = (input) => {
  const words = input.split(' ');

  const result = [];
  let currentWord = words[0];
  let count = 1;

  for (let i = 1; i <= words.length; i++) {
    if (words[i] === currentWord) {
      count++;
    } else {
      result.push(count > 1 ? `${currentWord}${count}` : currentWord);
      currentWord = words[i];
      count = 1;
    }
  }

  return result.join(' ');
};

export { mergeConsecutiveWords };
