$(document).ready(function()
{
	requestNotificationPermissions();
	$("#mainDiv").fadeOut(0);
	calculateNextPeriod();
});

// Class to keep information about a period
function schoolPeriod(title, startTime, endTime)
{
	// The title of the period
	this.title = title;

	// The time the period starts
	this.startTime = new Date();
	this.startTime.setHours(startTime.split(":")[0]);
	this.startTime.setMinutes(startTime.split(":")[1]);
	this.startTime.setSeconds(0);

	// The time the period ends
	this.endTime = new Date();
	this.endTime.setHours(endTime.split(":")[0]);
	this.endTime.setMinutes(endTime.split(":")[1]);
	this.endTime.setSeconds(0);

	// Keep the times in an array to be able to easily loop through
	this.times = [this.startTime, this.endTime];
}

// Calculate the next period
function calculateNextPeriod()
{
	// Most of the days
	var periodsType1 =
	[
		new schoolPeriod("Period 1", "8:40", "10:05"),
		new schoolPeriod("Period 2", "10:10", "10:40"),
		new schoolPeriod("Mentor", "11:05", "11:20"),
		new schoolPeriod("Period 3", "11:20", "12:20"),
		new schoolPeriod("Period 4", "12:25", "13:25"),
		new schoolPeriod("Period 5", "14:15", "15:15")
	];

	// Wednesday
	var periodsType2 =
	[
		new schoolPeriod("Period 1", "8:40", "9:35"),
		new schoolPeriod("Period 2", "9:35", "10:30"),
		new schoolPeriod("Period 3", "10:55", "11:50"),
		new schoolPeriod("Period 4", "11:50", "12:45"),
		new schoolPeriod("Co-curricular", "13:30", "15:30")
	];

	// Tuesday Week A
	var periodsType3 =
	[
		new schoolPeriod("Period 1", "8:40", "9:40"),
		new schoolPeriod("Period 2", "9:40", "10:40"),
		new schoolPeriod("Mentor", "11:05", "11:20"),
		new schoolPeriod("Period 3", "11:20", "12:20"),
		new schoolPeriod("Period 4", "12:25", "13:25"),
		new schoolPeriod("Period 5", "14:15", "15:15")
	];

	// Friday Week B
	var periodsType4 =
	[
		new schoolPeriod("Mentor", "8:30", "8:45"),
		new schoolPeriod("Assembly", "8:45", "9:50"),
		new schoolPeriod("Period 2", "9:55", "10:55"),
		new schoolPeriod("Period 3", "11:20", "12:20"),
		new schoolPeriod("Period 4", "12:25", "13:25"),
		new schoolPeriod("Period 5", "14:15", "15:15")
	];

	// The timetable for two weeks
	var timetable = [[
	// Week A
	periodsType1,
	periodsType3,
	periodsType2,
	periodsType1,
	periodsType1,
	],[
	// Week B
	periodsType1,
	periodsType1,
	periodsType2,
	periodsType1,
	periodsType4,
	]];


	// Today
	var today = new Date();

	// Week number
	var weekNumber = (new Date()).getWeek();

	// Week number in a two week timetable
	var week = (weekNumber%2) ? 0 : 1;

	// Store periods in a day
	var periods = [];

	// Periods for today, exluding the weekend
	if (today.getDay() != 0 && today.getDay() != 6)
	{
		// Get the periods from the timetable
		periods = timetable[week][today.getDay() - 1];
	}

	// The closest start or end period time
	var periodTime = new Date();

	// Milliseconds until the time was reached
	var prevDifference = 0;

	// Milliseconds until the time is reached
	var timeDifference = 0;

	// Flag to set periodTime for the first time or to see if there are any periods left
	var firstRun = true;

	// The label for the time
	var textLabel = "";

	// Check all periods
	for (var i = 0; i < periods.length; i++)
	{
		// Check both start and end times for the period
		for (var j = 0; j < 2; j++)
		{
			// How long until this time
			timeDifference = periods[i].times[j] - today;

			// Make sure it's in the future
			if (timeDifference > 0)
			{
				// Is it less time than before or has periodTime been initialised?
				if (timeDifference < prevDifference || firstRun == true)
				{
					// Assign the closer time
					periodTime = periods[i].times[j];

					// Set difference in time to be able to compare next iteration(s)
					prevDifference = timeDifference;

					// The first time for a period has already been intialized
					firstRun = false;

					// Set the label of the time, depending if the period starts or ends
					textLabel = "Until " + periods[i].title + (j ? " ends" : " starts");
				}
			}
		}
	}

	// No periods in the future
	if (firstRun == true)
	{
		// Set the label accordingly
		textLabel = "No periods left today";

		// Clear the coutdown label
		document.getElementById('timeLeft').innerHTML = "Relax";

		// Reset the title
		document.getElementById('titleText').innerHTML = "Timetable";

		// Tomorrow
		tomorrow = new Date();
		tomorrow.setHours(24);
		tomorrow.setMinutes(0);
		tomorrow.setSeconds(0);

		// Check periods tomorrow
		setTimeout(calculateNextPeriod, tomorrow - today);
	}

	else
	{
		// Debug info
		console.log("New periodTime:", periodTime);

		// Calculate the time until the period starts/ends
		calculateTime(periodTime);
	}

	// Set the label for the time
	document.getElementById('timeLabel').innerHTML = textLabel;

	// Change the background
	setRandomBackground();
}


// Calculate the time until the period starts/ends
function calculateTime(periodTime)
{
	// Today
	var today = new Date();

	// Time until the selected time is reached in seconds
	var timeLeft = (periodTime - today)/1000;

	// Format the time into hours, minutes and seconds
	var h = Math.floor(timeLeft/3600);
	var m = Math.floor(timeLeft/60)%60;
	var s = Math.floor(timeLeft%60);

	// Make sure the numbers are always two digits
	m = formatTime(m);
	s = formatTime(s);

	// Format the time
	var timeFormatted = h + ":" + m + ":" + s;

	// Display the countdown
	document.getElementById('timeLeft').innerHTML = timeFormatted;

	// Set the title to the countdown
	document.getElementById('titleText').innerHTML = timeFormatted;

	// Has the time been reached?
	if (timeLeft > 0)
	{
		// Repeat the calculations to update the countdown
		setTimeout(calculateTime.bind(periodTime, periodTime), 500);
	}

	else
	{
		// Get the label for the period
		var timeLabel = document.getElementById('timeLabel').innerHTML;

		// Extract the period name
		var periodTitle = timeLabel.replace("Until ", "").replace(" starts", "").replace(" ends", "");

		// See if the period starts or ends
		var description = timeLabel.includes(" starts") ? " has started" : " has ended";

		//Show notification
		spawnNotification("", "./logo.png", periodTitle + description);

		// The time has passed, find the new period time
		calculateNextPeriod();
	}
}

// Add zero in front of numbers < 10
function formatTime(i)
{
	return i < 10 ? "0" + i : i;
}

// Flag to see if notifications work on the device
var notificationsSupported = false;

// Request notification permissions
function requestNotificationPermissions()
{
	try
	{
		// Attempt to request permission
		Notification.requestPermission();
		notificationsSupported = true;
	}
	catch (err)
	{
		// Did not work, notifications are not supported
		console.log(err);
	}
}

// Show a notification
function spawnNotification(theBody, theIcon, theTitle)
{
	if (notificationsSupported == false)
	{
		return;
	}

	var options =
	{
		body: theBody,
		icon: theIcon
	}

	// Try to send a notification
	try
	{
		var n = new Notification(theTitle, options);
	}
	catch (err)
	{
		// Log error to console
		console.log(err, "Using ServiceWorkerRegistration.showNotification() instead");

		// new Notification is not supported on the mobile chrome browser
		// Use ServiceWorkerRegistration.showNotification() instead
		navigator.serviceWorker.register('sw.js');
		Notification.requestPermission(function(result)
		{
			if (result === 'granted')
			{
				navigator.serviceWorker.ready.then(function(registration)
				{
					registration.showNotification(theTitle, options);
				});
			}
		});
	}
}

// Set a random image as the background
function setRandomBackground()
{
	// Fade out first
	$("#mainDiv").fadeOut(400, setRandomBackgroundLoad);
}

// Don't do this, avoid global variables
// Save the last background index to make sure that there is a unique background each time
var lastBackgroundIndex = -1;

// Set the background after the div has faded out
function setRandomBackgroundLoad()
{
	// The images to choose from
	var images = ["./backgrounds/forestbridge.jpg",
								"./backgrounds/landscape1.jpg",
								"./backgrounds/landscape2.jpg",
								"./backgrounds/landscape3.jpg",
								"./backgrounds/landscape4.jpg",
								"./backgrounds/landscape5.jpg",
								"./backgrounds/landscape6.jpg",
								"./backgrounds/landscape7.jpg"];

	// Select a random image
	var newImageIndex = Math.floor(Math.random() * images.length);

	// Ended up selecting the same image
	if (newImageIndex == lastBackgroundIndex)
	{
		// Get next image in line
		newImageIndex++;

		// If out of range wrap around
		if (newImageIndex >= images.length)
		{
			newImageIndex = 0;
		}
	}

	// Store the new image index
	lastBackgroundIndex = newImageIndex;

	// Get the image at the index
	var newImage = images[newImageIndex];

	// Create a new element to load the image
	$("<img id='loaderImg' src='"+newImage+"' onload='setRandomBackgroundLoaded(this.src)'/>");
}

// Set the background once the image has loaded
function setRandomBackgroundLoaded(imgUrl)
{
		// Set the background
    $("#mainDiv").css("background-image", "url("+imgUrl+")");

		// Remove the new element
    $("#loaderImg").remove();

		// Fade back in
		$("#mainDiv").fadeIn(400);
}

// Get week number
Date.prototype.getWeek = function()
{
    var onejan = new Date(this.getFullYear(), 0, 1);
	return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};
