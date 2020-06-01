function convert(str) {
    var mnths = {
        January: "01",
        February: "02",
        March: "03",
        April: "04",
        May: "05",
        June: "06",
        July: "07",
        August: "08",
        September: "09",
        Octorber: "10",
        November: "11",
        December: "12"
      },
      date = str.split(" ");
  
    return [date[2], mnths[date[0]], date[1]].join("-");
  }
  
  console.log(convert("July 9, 2019"))