function getWeek (date) {
  const onejan = new Date(date.getFullYear(), 0, 1);
  return Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
}

// sets the clock information
function setClock (minutes, seconds, subHeading) {
  document.getElementById('clockMins').innerText = minutes;
  document.getElementById('clockSecs').innerText = seconds;
  document.getElementById('clockSubHeading').innerText = subHeading;
}

// a class to contain info about a period
function SchoolPeriod (title, startTime, endTime) {
  // The title of the period
  this.title = title;

  // The time the period starts
  this.startTime = new Date();
  startTime = startTime.split(':');
  this.startTime.setHours(startTime[0]);
  this.startTime.setMinutes(startTime[1]);
  this.startTime.setSeconds(0);

  // The time the period ends
  this.endTime = new Date();
  endTime = endTime.split(':');
  this.endTime.setHours(endTime[0]);
  this.endTime.setMinutes(endTime[1]);
  this.endTime.setSeconds(0);

  // Keep the times in an array to be able to easily loop through
  this.times = [this.startTime, this.endTime];
}

const periods = {};

// Mondays where there is an extended mentor
periods.extendedMentor =
[
  new SchoolPeriod('Period 1', '8:40', '9:40'),
  new SchoolPeriod('Period 2', '9:40', '10:40'),
  new SchoolPeriod('Mentor', '11:05', '11:35'),
  new SchoolPeriod('Period 3', '11:35', '12:35'),
  new SchoolPeriod('Period 4', '12:40', '13:40'),
  new SchoolPeriod('Period 5', '14:30', '15:30')
];

// Tuesdays where this is no mentor
periods.noMentor =
[
  new SchoolPeriod('Period 1', '8:40', '9:40'),
  new SchoolPeriod('Period 2', '9:40', '10:40'),
  new SchoolPeriod('Period 3', '11:05', '12:05'),
  new SchoolPeriod('Period 4', '12:10', '13:10'),
  new SchoolPeriod('Period 5', '14:00', '15:00')
];

// Wednesday with co curricular time
periods.coCurricular =
[
  new SchoolPeriod('Period 1', '8:40', '9:35'),
  new SchoolPeriod('Period 2', '9:35', '10:30'),
  new SchoolPeriod('Period 3', '10:55', '11:50'),
  new SchoolPeriod('Period 4', '11:50', '12:45'),
  new SchoolPeriod('Co-curricular', '13:30', '15:30')
];

// Thursday and Friday most days
periods.standard =
[
  new SchoolPeriod('Period 1', '8:40', '9:40'),
  new SchoolPeriod('Period 2', '9:40', '10:40'),
  new SchoolPeriod('Mentor', '11:05', '11:20'),
  new SchoolPeriod('Period 3', '11:20', '12:20'),
  new SchoolPeriod('Period 4', '12:25', '13:25'),
  new SchoolPeriod('Period 5', '14:15', '15:15')
];

const timetable = [[
  // Week A
  periods.extendedMentor,
  periods.noMentor,
  periods.coCurricular,
  periods.standard,
  periods.standard
], [
  // Week B
  periods.extendedMentor,
  periods.noMentor,
  periods.coCurricular,
  periods.standard,
  periods.standard
]];

function calculateNextPeriod () {
  // get today and corresponding timetable
  const today = new Date();
  const week = (getWeek(today) % 2) ? 1 : 0;

  let todaysPeriods = [];
  // ignores weekends
  if (today.getDay() !== 6 || today.getDay() !== 0) {
    todaysPeriods = timetable[week][today.getDay() - 1];
  } else {
    setClock('––', '––', 'Relax, it\'s the weekend');
    return 0;
  }

  // search through today's periods to find the next one to the current time
  let nextPeriod;
  todaysPeriods.forEach((i, ix) => {
    // console.log(i.title, i.startTime, i.endTime)
    const iStartTime = i.startTime.getTime();
    const iEndTime = i.endTime.getTime();
    const todayTime = today.getTime();

    if (iStartTime < todayTime && todayTime < iEndTime) {
      // during a period
      nextPeriod = todaysPeriods[ix + 1];
      return 0;
    } else if (todayTime < iStartTime) {
      // before a period
      nextPeriod = i;
      return 0;
    } else {
      // neither, the day is over
      setClock('––', '––', 'Relax, the day is over');

      // check for periods tomorrow
      const tomorrow = new Date();
      tomorrow.setHours(24);
      tomorrow.setMinutes(0);
      tomorrow.setSeconds(0);
      setTimeout(calculateNextPeriod, tomorrow - today);

      return 0;
    }
  });
}

function setRandomBGImage () {
  // check if a custom image is being used
  const params = new URLSearchParams(window.location.search);
  const cimg = params.get('cimg');

  if (cimg !== null) {
    document.body.style.backgroundImage = `url(${cimg})`;
    return 0;
  }

  const images = [
    './backgrounds/autumnal-peach-preview.png',
    './backgrounds/bright-rain-preview.png',
    './backgrounds/glass-rainbow-preview.png',
    './backgrounds/good-vibes-preview.png',
    './backgrounds/moonrise-preview.png',
    './backgrounds/rose-thorn-preview.png'
  ];

  const imageIndex = Math.floor(Math.random() * images.length);
  const imageURL = images[imageIndex];

  document.body.style.backgroundImage = `url(${imageURL})`;
}

/* ACTUALLY RUN THE CODE */
calculateNextPeriod();
setRandomBGImage();
