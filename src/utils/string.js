const mergeConsecutiveWords = (input) => {
  const words = input.split(' ').filter(word => word.trim());

  const result = [];
  let i = 0;

  while (i < words.length) {
    const current = words[i];
    const next = words[i+1];

    if (next && current === next && !current.includes('2')) {
      result.push(current.replace(/'?$/, '2'));
      i += 2;
    } else {
      result.push(current);
      i++;
    }
  }

  return result.join(' ');
};

export { mergeConsecutiveWords };