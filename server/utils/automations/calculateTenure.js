const calculateTenure = (joinedDate) => {
  const currentDate = new Date();
  const differenceInMilliseconds = currentDate - joinedDate;
  const millisecondsInYear = 365 * 24 * 60 * 60 * 1000;

  const tenure = Math.floor(differenceInMilliseconds / millisecondsInYear);

  return tenure;
};

module.exports = calculateTenure;
