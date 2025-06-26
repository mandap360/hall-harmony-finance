
export const getCurrentFY = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  if (month >= 3) { // April onwards (month is 0-indexed, so March = 2, April = 3)
    return { startYear: year, endYear: year + 1 };
  } else { // January to March
    return { startYear: year - 1, endYear: year };
  }
};

export const isInCurrentFY = (date: string, currentFY: { startYear: number; endYear: number }) => {
  const itemDate = new Date(date);
  const itemYear = itemDate.getFullYear();
  const itemMonth = itemDate.getMonth();
  
  if (itemMonth >= 3) { // April onwards
    return itemYear === currentFY.startYear;
  } else { // January to March
    return itemYear === currentFY.endYear;
  }
};
