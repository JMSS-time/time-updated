function getWeek (date) {
  const onejan = new Date(date.getFullYear(), 0, 1);
  return Math.floor((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
}

// sets the clock information
function setClock (minutes, seconds, subHeading) {
  document.getElementById('clockMins').innerText = minutes;
  document.getElementById('clockSecs').innerText = seconds;
  document.getElementById('clockSubHeading').innerText = subHeading;

  if (minutes === '––') {
    document.getElementById('clockTime').ariaLabel = 'No time displayed';
  } else {
    document.getElementById('clockTime').ariaLabel = `${minutes} minutes and ${seconds} seconds left until the next period`;
  }
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
const timetable = [];
function initPeriods () {
  // Mondays where there is an extended mentor
  periods.extendedMentor = [
    new SchoolPeriod('Period 1', '8:40', '9:40'),
    new SchoolPeriod('Period 2', '9:40', '10:40'),
    new SchoolPeriod('Mentor', '11:05', '11:35'),
    new SchoolPeriod('Period 3', '11:35', '12:35'),
    new SchoolPeriod('Period 4', '12:40', '13:40'),
    new SchoolPeriod('Period 5', '14:30', '15:30')
  ];

  // Tuesdays where this is no mentor
  periods.noMentor = [
    new SchoolPeriod('Period 1', '8:40', '9:35'),
    new SchoolPeriod('Period 2', '9:35', '10:30'),
    new SchoolPeriod('Period 3', '10:55', '11:50'),
    new SchoolPeriod('Period 4', '11:55', '12:50'),
    new SchoolPeriod('Period 5', '13:40', '14:35'),
    new SchoolPeriod('Period 6', '14:35', '15:30')
  ];

  // Wednesday with co curricular time
  periods.coCurricular = [
    new SchoolPeriod('Period 1', '8:40', '9:35'),
    new SchoolPeriod('Period 2', '9:35', '10:30'),
    new SchoolPeriod('Period 3', '10:55', '11:50'),
    new SchoolPeriod('Period 4', '11:50', '12:45'),
    new SchoolPeriod('Co-curricular', '13:30', '15:30')
  ];

  // Thursday and Friday most days
  periods.standard = [
    new SchoolPeriod('Period 1', '8:40', '9:40'),
    new SchoolPeriod('Period 2', '9:40', '10:40'),
    new SchoolPeriod('Mentor', '11:05', '11:20'),
    new SchoolPeriod('Period 3', '11:20', '12:20'),
    new SchoolPeriod('Period 4', '12:25', '13:25'),
    new SchoolPeriod('Period 5', '14:15', '15:15')
  ];

  // Week A
  timetable[0] = [
    periods.extendedMentor,
    periods.noMentor,
    periods.coCurricular,
    periods.standard,
    periods.standard
  ];

  // Week B
  timetable[1] = [
    periods.extendedMentor,
    periods.noMentor,
    periods.coCurricular,
    periods.standard,
    periods.standard
  ];
}

function updateClock () {
  // get today and corresponding timetable
  const today = new Date();
  const week = (getWeek(today) % 2) ? 1 : 0;

  const weekIndicatorElem = document.getElementById('weekIndicator');
  weekIndicatorElem.innerText = `Week ${week ? 'A' : 'B'}`;
  weekIndicatorElem.setAttribute('data-week', week ? 'A' : 'B');

  let todaysPeriods = [];
  // ignores weekends
  if (today.getDay() !== 6 && today.getDay() !== 0) {
    todaysPeriods = timetable[week][today.getDay() - 1];
  } else {
    setClock('––', '––', 'Relax, it\'s the weekend');
    return false;
  }

  /*
    algorithm:
      cull all periods already done from the list.
      if first item is currently underway, then say period ends
      if first item is about to start, then say period starts
  */

  const todayTime = today.getTime();
  const uncompletedTodaysPeriods = todaysPeriods.filter(i => {
    // make sure that all periods left aren't completed
    return todayTime < i.endTime.getTime();
  });

  // empty list indicates the day is over
  if (uncompletedTodaysPeriods.length === 0) {
    setClock('––', '––', 'Relax, the day is over');

    // check for periods later
    const later = new Date();
    later.setHours(24);
    later.setMinutes(0);
    later.setSeconds(0);
    setTimeout(updateClock, later - today + 2000);
    // reinits periods for the new day, but does that before it updates the clock
    setTimeout(initPeriods, later - today + 1000);
    return false;
  }

  // calculate seconds until and the message to display
  const refPeriod = uncompletedTodaysPeriods[0];
  let secondsUntil;
  let subHeading;
  if (todayTime < refPeriod.startTime.getTime()) {
    // if the lesson is yet to start
    secondsUntil = (refPeriod.startTime - today) / 1000;
    subHeading = `Until ${refPeriod.title} starts`;
  } else {
    // if the lesson is about to end
    secondsUntil = (refPeriod.endTime - today) / 1000;
    subHeading = `Until ${refPeriod.title} ends`;
  }

  // convert to hours mins seconds
  const h = Math.floor(secondsUntil / 3600);
  let m = Math.floor(secondsUntil / 60) % 60;
  let s = Math.floor(secondsUntil % 60);

  // combine hours and minutes
  m = m + (h * 60);
  // Make sure the numbers are always two digits
  m = String(m).padStart(2, '0');
  s = String(s).padStart(2, '0');

  // update display
  setClock(`${m}:`, s, subHeading);
  setTimeout(updateClock, 500);
}

function setRandomBGImage () {
  // check if a custom image is being used
  const params = new URLSearchParams(window.location.search);
  const cimg = params.get('cimg');

  if (cimg !== null) {
    document.body.style.backgroundImage = `url(${cimg})`;
    return false;
  }

  const images = [
    './backgrounds/autumnal-peach-preview.png',
    './backgrounds/bright-rain-preview.png',
    './backgrounds/good-vibes-preview.png',
    './backgrounds/moonrise-preview.png',
    './backgrounds/rose-thorn-preview.png'
  ];

  const imageIndex = Math.floor(Math.random() * images.length);
  const imageURL = images[imageIndex];

  document.body.style.backgroundImage = `url(${imageURL})`;
}

/* ACTUALLY RUN THE CODE */
initPeriods();
updateClock();
setRandomBGImage();

// handles closing and hiding the alerts.
// if you make a new alert just change the id and it will be pushed out.
const alertElem = document.getElementById('alert');
if (alertElem) {
  const alertId = alertElem.dataset.alertId;

  if (window.localStorage.getItem('isAlertClosed_' + alertId) !== 'true') {
    alertElem.style.display = 'flex';
  }

  document.getElementById('alertClose').addEventListener('click', () => {
    alertElem.style.display = 'none';
    window.localStorage.setItem('isAlertClosed_' + alertId, true);
  });
}
