const stringTodate = (dateArray) => {
  const convertedDates = dateArray
    ? dateArray.map((date) => new Date(date))
    : ["empty array"];

  //get the most recent date in the table
  const mostRecentDate = convertedDates.sort((a, b) => b - a)[0];

  //convert the most recent date in date type

  let startDate;
  let endDate;

  if (mostRecentDate) {
    // Verifica se mostRecentDate é válido antes de tentar usar setDate
    startDate = new Date(mostRecentDate);
    startDate.setDate(startDate.getDate() + 1);
  } else {
    // Se mostRecentDate for undefined, definir uma data padrão
    startDate = new Date("2024-01-01");
  }

  //create and convert the end date as date type based on the most recent date
  if (mostRecentDate) {
    // Verifica se mostRecentDate é válido antes de tentar usar setDate
    endDate = new Date(mostRecentDate);
    endDate.setDate(startDate.getDate() + 2);
  } else {
    // Se mostRecentDate for undefined, definir uma data padrão
    endDate = new Date("2024-01-02");
  }

  //start date as string
  let finalStartDate = `${startDate.getUTCFullYear()}-${(
    startDate.getUTCMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${startDate.getUTCDate().toString().padStart(2, "0")}`;

  //end date as string
  let finalEndDate = `${endDate.getUTCFullYear()}-${(endDate.getUTCMonth() + 1)
    .toString()
    .padStart(2, "0")}-${endDate.getUTCDate().toString().padStart(2, "0")}`;

  return { finalStartDate, finalEndDate };
};

module.exports = stringTodate;
