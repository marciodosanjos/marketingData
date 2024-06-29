const stringTodate = (dateArray) => {
  const convertedDates = dateArray
    ? dateArray.map((date) => new Date(date))
    : ["empty array"];

  //get the most recent date in the table
  const mostRecentDate = convertedDates.sort((a, b) => b - a)[0];

  //convert the most recent date in date type
  let startDate = new Date(
    mostRecentDate.setDate(mostRecentDate.getDate() + 1)
  );

  //create and convert the end date as date type based on the most recent date
  let endDate = new Date(mostRecentDate.setDate(mostRecentDate.getDate() + 2));

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
