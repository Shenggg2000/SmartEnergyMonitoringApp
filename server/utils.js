function findGreaterNumbers(arr, num) {
  const filteredArr = arr.filter((n) => n > num);
  if (filteredArr.length === 0) {
    return null; // or any other value to indicate that no number was found
  }
  return filteredArr;
}

function findBetweenNumbers(arr, num, num2) {
  const filteredArr = arr.filter((n) => n >= num && n <= num2);
  if (filteredArr.length === 0) {
    return null; // or any other value to indicate that no number was found
  }
  return filteredArr;
}

function findNearestGreaterNumber(arr, num) {
  const filteredArr = arr.filter((n) => n > num);
  if (filteredArr.length === 0) {
    return null; // or any other value to indicate that no number was found
  }
  const nearestNum = filteredArr.reduce((acc, n) => {
    return Math.abs(n - num) < Math.abs(acc - num) ? n : acc;
  });
  return nearestNum;
}

function findNearestSmallerNumber(arr, num) {
  const filteredArr = arr.filter((n) => n < num);
  if (filteredArr.length === 0) {
    return null; // or any other value to indicate that no number was found
  }
  const nearestNum = filteredArr.reduce((acc, n) => {
    return Math.abs(num - n) < Math.abs(num - acc) ? n : acc;
  });
  return nearestNum;
}

function todayTimestamp() {
  const now = new Date();
  const todayMidnight = new Date(now);
  todayMidnight.setHours(0, 0, 0, 0);
  const timestamp = todayMidnight.getTime();
  return Math.floor(timestamp / 1000)
}

function thisWeekTimestamp() {
  const now = new Date();
  let month = now.getMonth();
  let date = now.getDate() - now.getDay();
  if (date < 1) {
    month -= 1;
    if (month == 0 || month == 2 || month == 4 || month == 6 || month == 7 || month == 9 || month == 11) {
      date = 31 + date;
    }
    if (month == 3 || month == 5 || month == 8 || month == 10) {
      date = 30 + date;
    }
    if (month == 1 && isLeapYear(now.getFullYear())) {
      date = 29 + date;
    }
    if (month == 1 && !isLeapYear(now.getFullYear())) {
      date = 28 + date;
    }
  }
  const firstDayOfWeek = new Date(now.getFullYear(), month, date);
  firstDayOfWeek.setHours(0, 0, 0, 0);
  const timestamp = firstDayOfWeek.getTime();
  return Math.floor(timestamp / 1000)
}

function thisMonthTimestamp() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  firstDayOfMonth.setHours(0, 0, 0, 0);
  const timestamp = firstDayOfMonth.getTime();
  return Math.floor(timestamp / 1000)
}

function isLeapYear(year) {
  if (year % 4 !== 0) {
    return false;
  } else if (year % 100 !== 0) {
    return true;
  } else if (year % 400 !== 0) {
    return false;
  } else {
    return true;
  }
}

function groupConsecutiveNumbers(arr) {
  arr.sort((a, b) => a - b);
  let result = [];
  let temp = [arr[0]];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] - arr[i - 1] < 60) {
      temp.push(arr[i]);
    } else {
      result.push(temp);
      temp = [arr[i]];
    }
  }
  result.push(temp);
  return result;
}

module.exports = {
  findGreaterNumbers,
  findBetweenNumbers,
  findNearestGreaterNumber,
  findNearestSmallerNumber,
  todayTimestamp,
  thisWeekTimestamp,
  thisMonthTimestamp,
  groupConsecutiveNumbers
}