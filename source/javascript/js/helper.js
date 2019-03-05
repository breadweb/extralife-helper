/*!
 * Extra Life Helper v2.4
 * https://github.com/breadweb/extralifehelper
 *
 * Copyright (c) 2013 - 2019, Adam "Bread" Slesinger
 * http://www.breadweb.net
 *
 * All rights reserved.
 *
 * Date: 3/5/2019 17:00:07
 *
 */

const IS_DEBUG = false;
const WIDTH_ORIGINAL = 264;
const HEIGHT_ORIGINAL = 110;
const ANCHOR_POINT = { x: 1, y: 1 };      // Point to start drawing which avoids clipping of stroke
const PADDING = 2;                      // Pixels of width and height to reduce to avoid clipping of stroke
const DARK_BLUE = "#1D4C6C";
const LIGHT_BLUE = "#28C0E8";
const GREEN = "#97C93D";
const WHITE = "#FFFFFF";
const GRAY = "#BCBEC0";
const CLOCK_TIMER_INTERVAL = 1000;      // Frequency that the countdown should be refreshed, in ms
const ACTION_TIMER_INTERVAL = 60000;    // Frequency that a new action should be taken, in ms
const DONOR_TIMER_INTERVAL = 60000;     // Length of time a new donation is shown, in ms
const LOGO_PLAY_MARK = 60;              // Number of times the action item ticks before showing logos
const DONOR_AMOUNT_POINT_Y = 40;
const DONOR_AMOUNT_FONT_SIZE = 36;
const DONOR_NAME_POINT_Y = 56;
const DONOR_NAME_FONT_SIZE = 12;
const DONOR_AMOUNT_POINT_Y_ALT = 52;
const DONOR_AMOUNT_FONT_SIZE_ALT = 40;
const DONOR_NAME_POINT_Y_ALT = 76;
const DONOR_NAME_FONT_SIZE_ALT = 14;
const TEXT_DAYS_UNTIL = "DAYS UNTIL EXTRA LIFE:";
const TEXT_HOURS_UNTIL = "HOURS UNTIL EXTRA LIFE:";
const TEXT_EXTRA_LIFE = "PLAYING GAMES TO HEAL KIDS!";
const TEXT_AMOUNT_RAISED = "MY AMOUNT RAISED:"
const TEXT_HOURS_PLAYED = "TOTAL TIME PLAYED:";
const TEXT_ANONYMOUS = "Anonymous";
const TEXT_A_GFIT = "A Gift";
const KEY_SUM_DONATIONS = "sumDonations";
const KEY_DISPLAY_NAME = "displayName";
const KEY_AMOUNT = "amount";
const KEY_MESSAGE = "message";
const KEY_AVATAR_IMAGE_URL = "avatarImageUrl";
const KEY_CREATED_DATE = "createdDateUTC";
const KEY_FUNDRAISING_GOAL = "fundraisingGoal";
const BASE_URL = "https://www.extra-life.org/api/";
const PARTICIPANT_INFO_URL = BASE_URL + "participants/{1}";
const DONOR_INFO_URL = BASE_URL + "participants/{1}/donations";
const TEAM_INFO_URL = BASE_URL + "teams/{1}";
const TEAM_ROSTER_URL = BASE_URL + "teams/{1}/participants";
const TEAM_DONOR_INFO_URL = BASE_URL + "teams/{1}/donations";

var participantInfoUrl;
var donorInfoUrl;
var teamInfoUrl;
var teamRosterUrl;
var teamDonorInfoUrl;
var backgroundRect;
var titleText;
var daysText;
var raisedText;
var moneyText;
var infoGroup;
var donorAmountText;
var donorNameText;
var donorMessageText;
var donorGroup
var clockGroup;
var logoGroup;
var actionTimerId;
var clockTimerId;
var donorTimerId;
var donationTimer;
var helperScale;
var clockNumbers;
var dateTimeStart;
var soundObjects;
var newDonors;
var lastRaised;
var shownDonors;
var extraLifeLogoItem;
var cmnhLogoItem;
var logoCounter;
var selectedVoice;
var itemsLoaded = 0;

document.addEventListener('DOMContentLoaded', onReady, false);

function onReady() {
    // Customize the URLs.
    participantInfoUrl = PARTICIPANT_INFO_URL.replace("{1}", participantId);
    donorInfoUrl = DONOR_INFO_URL.replace("{1}", participantId);
    teamInfoUrl = TEAM_INFO_URL.replace("{1}", teamId);
    teamRosterUrl = TEAM_ROSTER_URL.replace("{1}", teamId);
    teamDonorInfoUrl = TEAM_DONOR_INFO_URL.replace("{1}", teamId);

    // Create new start date/time by parsing user-specified values.
    var dateParts = startDate.split("-");
    var timeParts = startTime.split(":");
    dateTimeStart = new Date(
        parseInt(dateParts[2]),
        parseInt(dateParts[0]) - 1,
        parseInt(dateParts[1]),
        parseInt(timeParts[0]),
        parseInt(timeParts[1]),
        parseInt(timeParts[2]));
    log(dateTimeStart);

    // Initialize some variables.
    newDonors = [];
    lastRaised = 0;
    logoCounter = 0;
    yearMode = yearMode == "true" ? true : false;

    loadItems();
}

function loadItems() {
    const scripts = ["js/paper.js", "js/jquery.js", "js/tweenjs.js", "js/responsivevoice.js"];
    for (let i = 0; i < scripts.length; i++) {
        var element = document.createElement("script");
        element.type = "text/javascript";
        element.src = scripts[i];
        element.onload = onItemsLoaded;
        document.head.append(element);
    }

    const fonts = ["Cantarell-Regular", "Cantarell-Bold", "LetsGoDigital", "Furore"];
    for (let i = 0; i < fonts.length; i++) {
        document.fonts.load(fonts[i]).then(onItemsLoaded())
    }
}

function onItemsLoaded() {
    itemsLoaded++;
    console.log(itemsLoaded);
    if (itemsLoaded >= 8) {
        initHelper();
    }
}

function initHelper() {
    initSound();
    initPage();
    initPaper();
    initScreen();

    if (IS_DEBUG) {
        participantInfoUrl = "http://localhost:8888/participant.txt";
        donorInfoUrl = "http://localhost:8888/donations.txt";
        teamInfoUrl = "http://localhost:8888/team.txt";
        teamDonorInfoUrl = "http://localhost:8888/teamDonations.txt";

        CLOCK_TIMER_INTERVAL = 1000;
        ACTION_TIMER_INTERVAL = 10000;
        DONOR_TIMER_INTERVAL = 10000;

        // Use this to set states and change views for faster testing
        // of new features and fixes.        
        paper.project.activeLayer.onMouseDown = function (event) {
            // Show the logos immediately.
            logoCounter = LOGO_PLAY_MARK - 1;
        }
    }

    // A small delay helps prevent the jarring visual of the fonts loading
    // in over the temporary fonts in the first screen.
    window.setTimeout(startHelper, 100);
}

function startHelper() {
    startTimer("action");
    startTimer("clock");

    if (!isNaN(testDonationSeconds) && testDonationSeconds != 0) {
        window.setTimeout(showTestDonation, testDonationSeconds * 1000);
    }
}

function showTestDonation() {
    testName = "John Smith";
    testAmount = 100.00;
    testMessage = "This is such a good cause. Good luck!";
    testAvatar = "//assets.donordrive.com/clients/extralife/img/avatar-constituent-default.gif";
    testCreatedOn = "2018-10-05T01:09:59.97+0000";

    showNewDonor(testName, testAmount, testMessage, testAvatar, testCreatedOn);
}

function startTimer(timerType) {
    switch (timerType) {
        case "action":
            actionTimerId = setInterval(onActionTimer, ACTION_TIMER_INTERVAL);
            onActionTimer();
            break;
        case "clock":
            if (!yearMode) {
                clockTimerId = setInterval(onClockTimer, CLOCK_TIMER_INTERVAL);
                onClockTimer();
            }
            break;
        case "donor":
            donorTimerId = setInterval(onDonorTimer, DONOR_TIMER_INTERVAL);
            break;
    }
}

function stopTimer(timerType) {
    switch (timerType) {
        case "action":
            clearInterval(actionTimerId);
            break;
        case "clock":
            clearInterval(clockTimerId);
            break;
        case "donor":
            clearInterval(donorTimerId);
            break;
    }
}

function initSound() {
    // Load custom donation sounds.
    soundObjects = donationSounds.split(",");
    for (i = 0; i < soundObjects.length; i++) {
        soundObjects[i] = new Audio("audio/" + soundObjects[i].trim());
    }

    // Initialize text-to-speech.
    var mapping =
    {
        "US-female": "US English Female",
        "UK-male": "UK English Male",
        "UK-female": "UK English Female"
    };
    if (donationMessageVoice in mapping) {
        selectedVoice = mapping[donationMessageVoice];
    }
}

function initPage() {
    // Determine how much we've scaled up or down. Use that scale to change the width
    // and height. Note that the custom height values are ignored to keep the scale uniform.
    helperScale = helperWidth / WIDTH_ORIGINAL;
    helperHeight = HEIGHT_ORIGINAL * helperScale;

    if (!$('#myCanvas').length) {
        $(document.body).append(
            '<canvas id="myCanvas" display="block" width="' +
            helperWidth +
            '" height="' +
            helperHeight +
            '"></canvas>');

        // Haven't figured out why custom styles for body are being ignored in 
        // chromium so explicitly setting them here.
        $("body").css("margin", "0px");
        $("body").css("overflow", "hidden");
    }
}

function initPaper() {
    var canvas = $('#myCanvas')[0];
    paper.setup(canvas);
}

function initScreen() {
    // Set up background used for all display groups and apply different style properties
    // based on user settings.

    backgroundRect = new paper.Rectangle({
        point: ANCHOR_POINT,
        size: [helperWidth - PADDING, helperHeight - PADDING]
    });

    switch (helperBorder) {
        case "none":
            var backgroundPath = new paper.Path.Rectangle(backgroundRect);
            backgroundPath.strokeWidth = 0;
            break;
        case "rounded":
            var backgroundPath = new paper.Path.Rectangle(backgroundRect, 6);
            backgroundPath.strokeWidth = 2;
            break;
        default: // square
            var backgroundPath = new paper.Path.Rectangle(backgroundRect);
            backgroundPath.strokeWidth = 2;
            break;
    }

    // Set up the info group which contains the day/time countdown/countup
    // and the total amount raised by the participant.

    var centerX = backgroundRect.point.x + backgroundRect.size.width / 2;
    var centerY = backgroundRect.point.y + backgroundRect.size.height / 2;

    titleText = new paper.PointText({
        point: [centerX, 20],
        content: yearMode ? TEXT_EXTRA_LIFE : TEXT_DAYS_UNTIL,
        fontFamily: "Furore",
        fontSize: 12,
        justification: 'center'
    });

    daysText = new paper.PointText({
        point: [centerX, 60],
        content: yearMode ? new Date().getFullYear() : '0',
        fontFamily: "LetsGoDigital",
        fontSize: 50,
        justification: 'center'
    });

    // The clock face is set up with indvidual text items in order to
    // keep all numbers fixed with. Otherwise the entire clock face 
    // will shift in minor increments when the value changes, looking weird.
    clockNumbers = [6];
    clockGroup = new paper.Group();
    var xPos = 0;
    for (i = 0; i < 6; i++) {
        // A colon separator is needed after every two clock digits.
        doesNeedSep = i > 0 && i % 2 == 0;

        if (doesNeedSep) {
            // Add a colon separator.
            var colonSep = new paper.PointText({
                point: [xPos - 8, 0],
                content: ':',
                fontFamily: "LetsGoDigital",
                fontSize: 50,
                justification: 'center'
            });
            clockGroup.addChild(colonSep);
            xPos += 10;
        }

        clockNumbers[i] = new paper.PointText({
            point: [xPos, 0],
            content: '0',
            fontFamily: "LetsGoDigital",
            fontSize: 50,
            justification: 'center'
        });
        clockGroup.addChild(clockNumbers[i]);

        xPos += 28;
    }

    clockGroup.position = [centerX, 45];
    clockGroup.visible = false;

    raisedText = new paper.PointText({
        point: [centerX, 78],
        content: TEXT_AMOUNT_RAISED,
        fontFamily: "Furore",
        fontSize: 12,
        justification: 'center'
    });

    moneyText = new paper.PointText({
        point: [centerX, 100],
        content: '$0',
        fontFamily: "Cantarell-Bold",
        fontSize: 20,
        justification: 'center'
    });

    infoGroup = new paper.Group();
    infoGroup.addChild(titleText);
    infoGroup.addChild(daysText);
    infoGroup.addChild(clockGroup);
    infoGroup.addChild(raisedText);
    infoGroup.addChild(moneyText);
    infoGroup.visible = false;

    // Setup the donor group which contains information about a newly
    // received donation.

    donorAmountText = new paper.PointText({
        point: [centerX, DONOR_AMOUNT_POINT_Y],
        content: '$0',
        fontFamily: "Cantarell-Bold",
        fontSize: DONOR_AMOUNT_FONT_SIZE,
        justification: 'center'
    });

    donorNameText = new paper.PointText({
        point: [centerX, DONOR_NAME_POINT_Y],
        content: TEXT_ANONYMOUS,
        fontFamily: "Furore",
        fontSize: DONOR_NAME_FONT_SIZE,
        justification: 'center'
    });

    donorMessageText1 = new paper.PointText({
        point: [centerX, 76],
        content: "[Message]",
        fontFamily: "Cantarell-Regular",
        fontSize: 12,
        justification: 'center'
    });

    donorMessageText2 = new paper.PointText({
        point: [centerX, 88],
        content: "[Message]",
        fontFamily: "Cantarell-Regular",
        fontSize: 12,
        justification: 'center'
    });

    donorGroup = new paper.Group();
    donorGroup.addChild(donorAmountText);
    donorGroup.addChild(donorNameText);
    donorGroup.addChild(donorMessageText1);
    donorGroup.addChild(donorMessageText2);
    donorGroup.visible = false;

    // Setup the animating logos.

    paper.project.importSVG(extraLifeLogo, function (item) {
        extraLifeLogoItem = item;
        extraLifeLogoItem.position = [142, 62];
        extraLifeLogoItem.opacity = 0;
    });

    paper.project.importSVG(cmnhLogo, function (item) {
        cmnhLogoItem = item;
        cmnhLogoItem.position = [164, 70];
        cmnhLogoItem.opacity = 0;
    });

    logoGroup = new paper.Group();
    logoGroup.addChild(extraLifeLogoItem);
    logoGroup.addChild(cmnhLogoItem);
    logoGroup.visible = false;

    // Apply scale to all groups.

    setScale(infoGroup, helperScale, "topCenter");
    setScale(donorGroup, helperScale, "topCenter");
    setScale(logoGroup, helperScale, "topLeft");

    // Apply the selected color theme to all items.

    switch (helperTheme) {
        case "blue1":
            backgroundPath.strokeColor = GREEN;
            backgroundPath.fillColor = DARK_BLUE;
            titleText.fillColor = WHITE;
            daysText.fillColor = GREEN;
            clockGroup.fillColor = GREEN;
            raisedText.fillColor = WHITE;
            moneyText.fillColor = WHITE;
            donorAmountText.fillColor = GREEN;
            donorNameText.fillColor = WHITE;
            donorMessageText1.fillColor = WHITE;
            donorMessageText2.fillColor = WHITE;
            logoGroup.fillColor = WHITE;
            break;
        case "blue2":
            backgroundPath.strokeColor = DARK_BLUE;
            backgroundPath.fillColor = LIGHT_BLUE;
            titleText.fillColor = DARK_BLUE;
            daysText.fillColor = WHITE;
            clockGroup.fillColor = WHITE;
            raisedText.fillColor = DARK_BLUE;
            moneyText.fillColor = DARK_BLUE;
            donorAmountText.fillColor = WHITE;
            donorNameText.fillColor = DARK_BLUE;
            donorMessageText1.fillColor = DARK_BLUE;
            donorMessageText2.fillColor = DARK_BLUE;
            logoGroup.fillColor = WHITE;
            break;
        case "gray1":
            backgroundPath.strokeColor = DARK_BLUE;
            backgroundPath.fillColor = GRAY;
            titleText.fillColor = DARK_BLUE;
            daysText.fillColor = WHITE;
            clockGroup.fillColor = WHITE;
            raisedText.fillColor = DARK_BLUE;
            moneyText.fillColor = DARK_BLUE;
            donorAmountText.fillColor = WHITE;
            donorNameText.fillColor = DARK_BLUE;
            donorMessageText1.fillColor = DARK_BLUE;
            donorMessageText2.fillColor = DARK_BLUE;
            logoGroup.fillColor = WHITE;
            break;
        default: // white1
            backgroundPath.strokeColor = DARK_BLUE;
            backgroundPath.fillColor = WHITE;
            titleText.fillColor = DARK_BLUE;
            daysText.fillColor = LIGHT_BLUE;
            clockGroup.fillColor = LIGHT_BLUE;
            raisedText.fillColor = DARK_BLUE;
            moneyText.fillColor = DARK_BLUE;
            donorAmountText.fillColor = LIGHT_BLUE;
            donorNameText.fillColor = DARK_BLUE;
            donorMessageText1.fillColor = DARK_BLUE;
            donorMessageText2.fillColor = DARK_BLUE;
            break;
    }
}

function onClockTimer() {
    var timeDiff = new Date().getTime() - dateTimeStart.getTime();
    var isCountingUp;

    // If the difference is negative, the start time hasn't been hit or passed yet
    // and the difference is the amount of time left until the start time. Otherwise,
    // the difference is the amount of time played.
    if (timeDiff < 0) {
        timeDiff = timeDiff * -1;
        titleText.content = TEXT_HOURS_UNTIL;
        isCountingUp = false;
    }
    else {
        titleText.content = TEXT_HOURS_PLAYED;
        isCountingUp = true;
    }

    var days = Math.floor(timeDiff / 1000 / 60 / 60 / 24);

    // If there are three or more days left, the text will be updated to show how many 
    // days are left before the start time. Otherwise, we will show how the time which 
    // could be counting down or up.
    if (days > 3 && !isCountingUp) {
        titleText.content = TEXT_DAYS_UNTIL;
        daysText.content = days;
        daysText.visible = true;
        clockGroup.visible = false;
    }
    else {
        var hours = Math.floor(timeDiff / 1000 / 60 / 60);
        timeDiff -= hours * 1000 * 60 * 60;
        var minutes = Math.floor(timeDiff / 1000 / 60);
        timeDiff -= minutes * 1000 * 60;
        var seconds = Math.floor(timeDiff / 1000);

        var hourText = zeroPad(String(hours), 2);
        var minuteText = zeroPad(String(minutes), 2);
        var secondText = zeroPad(String(seconds), 2);

        // Special case for campaigns that might go longer than 99 hours.
        hourText = hourText.substring(hourText.length - 2);

        clockNumbers[0].content = hourText.substring(0, 1);
        clockNumbers[1].content = hourText.substring(1);
        clockNumbers[2].content = minuteText.substring(0, 1);
        clockNumbers[3].content = minuteText.substring(1);
        clockNumbers[4].content = secondText.substring(0, 1);
        clockNumbers[5].content = secondText.substring(1);

        daysText.visible = false;
        clockGroup.visible = true;
    }
}

function onActionTimer() {
    // First check to see if we should be showing any new donations. This
    // has the highest priority over any other action.
    if (newDonors.length > 0) {
        getAndShowNewDonor();
        return;
    }

    // Then check to see if we should be showing the logo animations.
    logoCounter++;
    if (logoCounter >= LOGO_PLAY_MARK) {
        logoCounter = 0;
        animateLogos();
        return;
    }

    infoGroup.visible = true;
    donorGroup.visible = false;
    logoGroup.visible = false;

    // Otherwise, poll general info for player or team to see if total
    // amount raised has changed.
    requestGeneralInfo();
}

function animateLogos() {
    stopTimer("action");
    stopTimer("clock");

    infoGroup.visible = false;
    donorGroup.visible = false;
    logoGroup.visible = true;

    createjs.Tween.get(extraLifeLogoItem)
        .wait(200)
        .to({ opacity: 1 }, 1500)
        .wait(5000)
        .to({ opacity: 0 }, 1000);
    createjs.Tween.get(cmnhLogoItem)
        .wait(7700)
        .to({ opacity: 1 }, 1500)
        .wait(5000)
        .to({ opacity: 0 }, 1000)
        .wait(300)
        .call(onAnimateLogosComplete);
}

function onAnimateLogosComplete() {
    startTimer("action");
    startTimer("clock");
}

function onDonorTimer() {
    stopTimer("donor");
    startTimer("action");
    startTimer("clock");
}

function getAndShowNewDonor() {
    if (newDonors.length < 1) {
        console.log("A new donation was expected but NOT found...");
        return;
    }

    var donorEntry = newDonors.shift();
    shownDonors.push(donorEntry);

    // TODO: We got a undefined donorEntry once. Need to protect against it.
    // TypeError: Cannot read property 'donationAmount' of undefined
    var donorName = donorEntry[KEY_DISPLAY_NAME];
    var donorAmount = donorEntry[KEY_AMOUNT];
    var donorMessage = donorEntry[KEY_MESSAGE];
    var donorAvatar = donorEntry[KEY_AVATAR_IMAGE_URL];
    var donorCreatedOn = donorEntry[KEY_CREATED_DATE];

    showNewDonor(donorName, donorAmount, donorMessage, donorAvatar, donorCreatedOn);
}

function showNewDonor(donorName, donorAmount, donorMessage, donorAvatar, donorCreatedOn) {
    stopTimer("action");
    stopTimer("clock");
    startTimer("donor");

    donorAmountText.content = donorAmount == null
        ? A_GIFT
        : formatMoney(donorAmount, true);
    donorNameText.content = donorName == null
        ? TEXT_ANONYMOUS
        : donorName;

    updateDonorGroup(donorMessage);

    infoGroup.visible = false;
    donorGroup.visible = true;
    logoGroup.visible = false;

    playSounds();

    if (selectedVoice) {
        setTimeout(function () {
            speakText(donorMessage);
        }, 5000);

    }

    // Call the function that participants can use to run their own code when
    // a new donation arrives.
    onNewDonation(donorName, donorAmount, donorMessage, donorAvatar, donorCreatedOn);
}

function updateDonorGroup(message) {
    // Reset scaling first before making changes. There is a better
    // way of doing this but this works for now.
    setScale(infoGroup, 1 / helperScale, "topCenter");
    setScale(donorGroup, 1 / helperScale, "topCenter");

    var isVisible = true;
    var donorAmountPointY = DONOR_AMOUNT_POINT_Y;
    var donorAmountFontSize = DONOR_AMOUNT_FONT_SIZE;
    var donorNamePointY = DONOR_NAME_POINT_Y;
    var donorNameFontSize = DONOR_NAME_FONT_SIZE;

    donorMessageText1.content = "";
    donorMessageText2.content = "";

    // If there is a message, add it. Otherwise, we'll scale the
    // donor amount and name so it is bigger and fills the area more. 
    if (message != null) {
        // Remove some characters that make things look weird.
        message = message.split("\r\n").join(" ");

        // Paper doesn't support text areas yet so we'll manually fill in 
        // up to two lines of the message and support a max number of 
        // characters per line.
        var words = message.split(' ');
        var totalChars = 0;
        var maxCharsPerLine = 25;
        for (i = 0; i < words.length; i++) {
            word = words[i];
            if (totalChars > maxCharsPerLine * 2) {
                var textContent = donorMessageText2.content;
                if (textContent.endsWith(".") ||
                    textContent.endsWith("?") ||
                    textContent.endsWith("!")) {
                    textContent = textContent.slice(0, -1);
                }
                donorMessageText2.content += "...";
                break;
            }
            else if (totalChars > maxCharsPerLine) {
                donorMessageText2.content += " " + word;
            }
            else {
                donorMessageText1.content += " " + word;
            }
            totalChars += word.length;
        }
    }
    else {
        isVisible = false;
        donorAmountPointY = DONOR_AMOUNT_POINT_Y_ALT;
        donorAmountFontSize = DONOR_AMOUNT_FONT_SIZE_ALT;
        donorNamePointY = DONOR_NAME_POINT_Y_ALT;
        donorNameFontSize = DONOR_NAME_FONT_SIZE_ALT;
    }

    donorMessageText1.visible = isVisible;
    donorMessageText2.visible = isVisible;

    donorAmountText.point = [donorAmountText.point.x, donorAmountPointY];
    donorAmountText.fontSize = donorAmountFontSize;
    donorNameText.point = [donorNameText.point.x, donorNamePointY];
    donorNameText.fontSize = donorNameFontSize;

    // Re-apply scaling after making changes to text size and positions.
    setScale(infoGroup, helperScale);
    setScale(donorGroup, helperScale);
}

function requestGeneralInfo() {
    var url = participantId ? participantInfoUrl : teamInfoUrl;
    makeRequest(url, onGeneralInfoSuccess, onRequestError);
}

function requestDonorInfo() {
    var url = participantId ? donorInfoUrl : teamDonorInfoUrl;
    makeRequest(url, onDonorInfoSuccess, onRequestError);
}

function makeRequest(url, onSuccess, onError) {
    log(url);

    $.ajax({
        url: url,
        type: 'GET',
        data: '',
        dataType: 'json',
        cache: false,
        success: function (res) {
            onSuccess(res);
        },
        error: function (res) {
            onError(res);
        }
    });
}

function onGeneralInfoSuccess(res) {
    log(res);
    var raised = res[KEY_SUM_DONATIONS];
    var goal = res[KEY_FUNDRAISING_GOAL];

    moneyText.content = formatMoney(raised, false);

    if (showGoal == "true") {
        moneyText.content += " / " + formatMoney(goal, false);
    }

    // If the amount raised is more than the last recorded value, then one or
    // more donations have come in since the last time general info was polled.
    // This is always true at startup, but the processing of donations will 
    // ensure we don't treat all donations as new the first time.
    if (raised > lastRaised) {
        if (showDonationAlerts == "true") {
            requestDonorInfo();
        }
    }

    lastRaised = raised;
}

function onRequestError(res) {
    // Errors are usually due to transient network failures so ignore and try 
    // again at the next timer tick.
    log(res);
}

function onDonorInfoSuccess(res) {
    log(res);

    // If donators is null, this must be the first time getting the list so just
    // set shown donors to the value and exit instead of treating everything as new.
    if (!shownDonors) {
        shownDonors = res;
        return;
    }

    // Go through the list and find the new ones.            
    for (i = 0; i < res.length; i++) {
        var wasFound = false;
        for (j = 0; j < shownDonors.length; j++) {
            // A unique ID is provided by Extra Life for donations (timestamp) but for 
            // some reason, jquery ajax response objects sometimes show the wrong timestamp
            // value and this can cause donation alerts to now show. Until we can figure
            // out why, resort to the old method of uniquely identifying a donation by a
            // combination of who and when.
            if (res[i][KEY_DISPLAY_NAME] == shownDonors[j][KEY_DISPLAY_NAME] &&
                res[i][KEY_CREATED_DATE] == shownDonors[j][KEY_CREATED_DATE]) {
                wasFound = true;
                break;
            }
        }

        if (!wasFound) {
            newDonors.unshift(res[i]);
        }
    }

    // Since this is not the first time getting donors, we have at least one new 
    // donation. Show it immediately.
    getAndShowNewDonor();
}

function playSounds() {
    for (i = 0; i < soundObjects.length; i++) {
        soundObject = soundObjects[i];
        soundObject.load();
        soundObject.play();
    }
}

function speakText(text) {
    responsiveVoice.speak(text, selectedVoice);
}

function setScale(group, amount, anchorPoint) {
    var xPos = anchorPoint != "topCenter"
        ? 0 // "topLeft"
        : group.bounds.topLeft.x + group.bounds.width / 2;

    group.scale(amount, [xPos, 0]);
}

function zeroPad(value, length) {
    while (value.length < length) {
        value = "0" + value;
    }
    return value;
}

function formatMoney(amount, showCents) {
    amount = showCents ? amount.toFixed(2) : amount.toFixed(0);
    return '$' + String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function log(message) {
    console.log(message);
}

// Vector Extra Life and CMNH logos.
const extraLifeLogo = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="none" x="0px" y="0px" width="260px" height="111px" viewBox="0 0 260 111"><defs><g id="Layer0_0_FILL"><path fill="#1C5A7D" stroke="none" d="M 216.15 68Q 215.15 67 214 67.85L 203.75 77Q 202.8 78.05 203.6 79.25L 212.55 89.7Q 213.6 90.75 214.75 89.9L 224.95 80.7Q 225.95 79.7 225.15 78.45L 216.15 68M 213.85 71.5Q 214.9 70.8 215.8 71.65 216.55 72.75 215.7 73.65 214.65 74.45 213.7 73.55 213 72.5 213.85 71.5M 218.75 75.15Q 219.5 76.25 218.65 77.15 217.65 77.95 216.7 77.05 215.95 76 216.8 75 217.85 74.3 218.75 75.15M 219.8 78.55Q 220.85 77.85 221.75 78.7 222.5 79.75 221.65 80.7 220.6 81.45 219.65 80.6 218.95 79.55 219.8 78.55M 213.3 84.1Q 214.35 83.35 215.25 84.25 216 85.3 215.15 86.25 214.1 87 213.15 86.15 212.45 85.05 213.3 84.1M 207.35 77.1Q 208.4 76.35 209.3 77.25 210.05 78.3 209.2 79.25 208.15 80 207.2 79.15 206.5 78.05 207.35 77.1M 210.35 80.6Q 211.35 79.85 212.25 80.75 213.05 81.8 212.2 82.75 211.15 83.5 210.2 82.65 209.5 81.55 210.35 80.6M 227.7 71.6Q 229.1 71.25 229 69.75L 226.65 56.05Q 226.25 54.65 224.85 54.75L 211.4 57.2Q 210.05 57.6 210.2 59.05L 211.85 68.8 213.8 67.1Q 215.1 66.15 216.35 67.25L 221.1 72.85 227.7 71.6M 226.35 68.05Q 226.45 69.4 225.2 69.7 224 69.8 223.6 68.55 223.5 67.3 224.75 66.9 226 66.8 226.35 68.05M 212.8 61.05Q 212.7 59.75 213.95 59.4 215.2 59.3 215.55 60.55 215.65 61.85 214.4 62.2 213.15 62.3 212.8 61.05M 220.95 64.3Q 221.05 65.6 219.8 65.95 218.55 66.05 218.2 64.75 218.1 63.5 219.35 63.1 220.6 63 220.95 64.3 Z"/></g><g id="Layer0_1_FILL"><path fill="#4EC1E0" stroke="none" d="M 39.85 17.95Q 36.05 18.65 31.3 21.35 26.6 24.2 24 27.1 21.45 30.05 22.25 31.8 23.3 33.4 27.1 32.7 30.9 31.95 35.7 29.3 45.7 23 44.7 18.85 43.65 17.25 39.85 17.95M 31.8 22.25Q 36 19.8 39.25 18.95 42.45 18.1 43.2 19.25 43.75 22.25 34.85 27.75 30.55 30.15 27.35 31 24.1 31.8 23.35 30.75 22.85 27.75 31.8 22.25 Z"/></g><g id="Layer0_2_FILL"><path fill="#4EC1E0" stroke="none" d="M 22.4 45.45Q 22.45 46.3 22.55 47.1 22.75 48.8 23.15 50.3 23.15 50.35 23.2 50.4 23.2 50.55 23.25 50.65 23.3 50.75 23.3 50.8 23.35 50.9 23.4 51.05 23.4 51.1 23.4 51.15 23.45 51.3 23.5 51.35 23.55 51.4 23.55 51.45 23.6 51.6 23.65 51.7 23.65 51.8 23.7 51.8 23.75 51.95 23.8 52.05 23.8 52.1 23.85 52.15 23.85 52.3 23.95 52.4 23.95 52.45 24 52.5 24 52.6 24.05 52.75L 24.05 52.8Q 24.15 52.95 24.2 53 24.2 53.05 24.25 53.1 24.3 53.2 24.35 53.35L 24.4 53.4Q 24.45 53.5 24.55 53.65L 24.55 53.7Q 24.65 53.8 24.7 53.95 24.8 54.1 24.9 54.25 25.85 55.9 27.05 56.85 27.65 54.25 25.8 52.35 23.95 50.45 22.4 45.45M 56.3 37.05Q 55.95 36.35 55.55 35.6 56.85 40.65 56.3 43.25 55.7 45.9 57.6 47.8 59.05 43.5 56.3 37.05M 61.05 8.9Q 62.45 4.7 62.3 4.2 61.4 7.2 60.4 8.95 61.25 6.35 60.3 2.85 60.25 3.05 59.25 6.2 59.45 1.1 59.05 0.45 59.2 3.85 58.7 5.95 58.95 3.1 57.6 0 57.75 0.65 56.55 6.95 56.05 5.35 55.95 5.25 55.6 10.15 54.25 11.9 53.75 13 53.65 13.45 53.55 12.25 53.75 11.75 52.95 13.65 53.15 14.55 53.4 15.45 54.95 17.45 56.15 19.25 55.8 20.7 54.7 23.55 53.3 24.65 53.05 25 53 25.35 52.85 24.3 53.45 22.75 53.3 22.8 52.4 24.7 51.5 26.7 51.65 30 49.05 27.95 46.35 28.65 46.1 28.75 45.8 28.85 45.7 28.9 45.7 29.05 48.6 28.3 51.55 30.55 51.6 30.65 51.7 30.7 51.75 30.8 51.75 30.9 47.95 27.6 43.45 30.25 43.15 30.45 42.95 30.6 43.4 35.85 42.6 39.3 42.15 41.25 41.3 42.3 43.4 39.05 42.65 30.85 42.4 31.2 36.8 32.85 31.2 34.5 30.8 34.35 34.45 41.7 37.95 43.3 36.65 42.9 35.25 41.45 32.8 39 30.45 34.35 30.2 34.35 29.85 34.35 24.5 34.55 23.1 39.65 23.1 39.55 23.05 39.5 23.1 39.25 23.15 39 24.45 35.5 27.35 34.5 27.2 34.45 27.1 34.45 26.8 34.5 26.6 34.6 23.8 35.4 22.75 38.85 21.15 35.85 19.3 34.65 17.45 33.45 17.3 33.5 18.6 34.45 19.05 35.45 18.8 35.2 18.45 35.05 16.7 34.85 14.25 33.05 13.2 32 13.25 29.85 13.55 27.3 13.25 26.4 12.95 25.5 11.25 24.3 11.65 24.65 12.3 25.75 12.05 25.45 11 24.75 8.9 24.05 6 20.1 6 20.25 6.45 21.85 2.15 17.2 1.9 16.6 2.4 19.9 4.05 22.2 2.6044921875 20.7044921875 0.95 17.75 0.9828125 18.54921875 3.75 22.7 1.25 20.6 1.1 20.4 2.2 23.95 4.2 25.65 2.4 24.7 0.15 22.7 0.3 23.2 3.7 26 1.1 24.75 0.95 24.65 2.35 27.7 4.4 28.75 2.55 28.1 0 26.6 0.3 27.15 4.3 29.3 1.55 28.9 1.35 28.8 3.15 31.35 5.25 31.7 3.35 31.65 0.7 31.05 1.1 31.4 5.15 32.25 2.5 32.75 2.3 32.7 4.05 34.4 5.9 34.35 4.35 34.65 2.25 34.8 2.7 35.05 6.65 34.65 3.9 36 3.7 36.05 5.5 37.05 7.2 36.65 5.7 37.3 3.65 37.85 4.1 38 7.95 36.85 5.65 38.6 5.45 38.65 7.7 39.25 9.45 38.2 8 39.3 5.85 40.4 6.2 40.4 9.45 38.8 7.7 40.55 7.6 40.6 9.7 40.7 11.2 39.65 10.2 40.8 8.5 42.1 9 42 11.65 39.75 10.15 41.8 10 41.9 12.3 41.65 13.6 40.35 12.8 41.5 10.95 43 11.45 42.95 13.9 40.6 12.85 42.7 12.65 42.75 14.95 42.3 15.85 41.05 15.3 42.05 14.3 43.35 14.65 43.2 16.35 40.85 15.75 43.1 15.6 43.2 17.85 42.65 18.4 41.2 18.15 42.25 17.6 43.65 17.8 43.45 18.7 41.1 18.75 43.4 18.6 43.5 20.85 42.8 20.8 41.1 21 42.3 20.95 44 21.1 43.75 21.15 41.35 21.8 43.5 21.75 43.65 22.1 43.5 22.45 42.9 22.4 43.85 22.4 44.8 22.75 45.95 23.1 46.85L 23.1 46.9Q 24.35 49.75 25.65 51.45 27.7 53.9 27.2 56.95 28.65 58.1 29.95 57.85 31.2 57.35 31.75 54.85 31.55 54.05 31.65 51.8 31.65 50.3 31.95 48.9 31.5 48.35 31.3 47.65 30.75 44.65 33.4 43.55 35.25 43.1 36.55 44.45 35.3 43.35 33.65 43.75 31 44.85 31.55 47.7 31.75 48.35 32.15 48.85 31.8 50.05 31.75 52.1 31.7 54.15 31.8 54.55 32.15 52.95 32.45 51.45 32.5 51.35 32.55 51.15L 32.55 51.1 32.6 51.05Q 32.6 51 32.6 50.95 32.65 50.95 32.65 50.9L 32.65 50.85Q 32.7 50.75 32.7 50.7 32.7 50.65 32.75 50.65 32.75 50.6 32.75 50.55L 32.75 50.5 32.8 50.45 32.8 50.4Q 32.85 50.35 32.85 50.3L 32.9 50.25 32.9 50.2Q 32.95 50.15 32.95 50.1L 32.95 50.05Q 33 50.05 33 50L 33.05 49.95 33.05 49.85 33.1 49.8Q 33.15 49.7 33.2 49.65 34.2 50.2 35.4 49.85 37.3 49.2 37.55 47.2 38.35 46.85 39.1 46.55L 39.15 46.55Q 39.35 46.5 39.45 46.45L 39.5 46.4Q 39.65 46.35 39.85 46.35 40.05 46.3 40.2 46.25L 40.25 46.2Q 40.4 46.15 40.55 46.1 40.7 46.05 40.9 46L 40.95 46Q 41.1 45.95 41.25 45.9 42.4 45.6 43.65 45.4 44.9 46.9 46.9 46.4 48.05 46.1 48.65 45.1 48.7 45.1 48.8 45.15L 48.85 45.15Q 48.9 45.2 48.95 45.2L 49 45.25 49.05 45.25 49.1 45.3 49.15 45.3Q 49.25 45.4 49.35 45.5 49.4 45.55 49.45 45.55 49.65 45.7 49.85 45.85L 49.85 45.9Q 49.9 45.9 49.95 45.95 50.1 46.1 50.25 46.25 51.2 47.25 52.35 48.4 52.25 48 51.15 46.35 50.05 44.65 49.1 43.8 49.2 43.15 49 42.5 48 39.8 45.15 40.35 43.75 40.85 43.15 42.2 43.7 40.55 45.3 40 48.1 39.5 49.2 42.35 49.4 43 49.35 43.75 50.25 44.75 51.1 46.05 52.3 47.9 52.6 48.65 54.3 50.45 55.65 50.2 56.9 49.7 57.5 47.95 55.5 45.65 56 42.45 56.35 39.7 55.25 35.1 54.75 34.35 54.3 33.65 54.75 33.8 55 33.75 54.9 33.7 54.3 31.45 55.65 33.5 55.85 33.6 54.9 32.2 54.45 31.1 55.35 32.5 57.55 31.9 57.4 31.9 56.25 29.95 58.25 31.4 58.5 31.45 57.35 30.6 56.55 29.8 57.75 30.75 60 30 59.8 30 58.15 28.4 60.7 29.5 61.15 29.45 59.6 28.9 58.6 28.3 60.1 28.85 62.2 28 62 28 60.05 26.85 63.3 27.55 63.8 27.3 61.45 27.05 60.2 26.5 61.95 26.9 64 25.85 63.85 25.9 61.5 24.95 65.05 25.35 65.5 25.15 63.3 25 61.85 24.6 63.65 24.65 65.4 23.4 65.25 23.45 62.9 22.9 66.45 22.5 66.75 22.25 64.3 22.6 62.55 22.45 64.6 22.3 66.15 20.6 65.95 20.7 63.1 20.45 66.8 19.35 67.25 18.95 65.25 19.65 63.65 19.85 65.25 19.3 66.25 17.4 66.1 17.55 63.1 17.9 66.6 16.05 66.85 15.65 65 16.65 63.55 17.2 65.1 16.25 65.65 13.85 65.6 14 63.05 15 66.0322265625 12.1171875 66.15 11.55 64.29765625 13.5517578125 62.7 14.65 64.3 13.15 64.45 10.05 64.35 10.25 62.2 12.05 64.45 8.2 64.45 7.5 63.1 10.1 61.85 11.65 63 9.65 62.6 6.3 62.6 6.5 61.05 8.9M 51.4 33.3Q 51.6 33.4 51.8 33.6 51.95 33.8 52.05 34.05 52.1 34.3 52.1 34.55 52.05 34.75 52 34.95 51.9 35.2 51.7 35.35 51.45 35.5 51.2 35.55 50.95 35.6 50.7 35.55 50.4 35.5 50.2 35.4 50 35.25 49.8 35.05 49.65 34.8 49.55 34.6 49.5 34.35 49.5 34.1 49.55 33.85 49.65 33.65 49.8 33.45 50 33.35 50.2 33.2 50.4 33.15 50.7 33.1 50.95 33.15 51.15 33.15 51.4 33.3M 41.15 36.55Q 41.15 36.65 41.15 36.8 41.15 37.05 40.9 37.1 40.2 37.2 39.5 37.35 39.3 37.35 39.2 37.1 39.15 37 39.15 36.85 39.1 36.6 39.35 36.5 40.1 36.35 40.8 36.3 41.1 36.3 41.15 36.55M 44.85 34.4Q 45.1 34.25 45.4 34.2 45.7 34.15 45.9 34.2 46.2 34.25 46.4 34.4 46.6 34.5 46.75 34.65 46.9 34.9 46.95 35.15 47.05 35.4 46.95 35.7 46.95 35.95 46.75 36.2 46.6 36.35 46.4 36.5 46.2 36.7 45.9 36.75 45.6 36.85 45.35 36.8 45.05 36.7 44.8 36.6 44.6 36.45 44.45 36.25 44.3 36.05 44.25 35.75 44.2 35.45 44.3 35.2 44.35 34.95 44.5 34.75 44.7 34.55 44.85 34.4M 48.65 31.9Q 48.8 32.05 48.9 32.3 48.95 32.55 48.9 32.75 48.9 33 48.75 33.15 48.6 33.3 48.4 33.45 48.25 33.6 47.95 33.65 47.7 33.7 47.45 33.65 47.2 33.65 47 33.5 46.75 33.35 46.6 33.15 46.5 33 46.45 32.8 46.4 32.55 46.45 32.3 46.5 32.1 46.6 31.9 46.7 31.75 46.95 31.6 47.15 31.5 47.4 31.45 47.6 31.4 47.85 31.4 48.15 31.45 48.35 31.6 48.5 31.7 48.65 31.9M 48.6 36.15Q 48.9 36.1 49.2 36.15 49.4 36.2 49.65 36.35 49.9 36.45 50.1 36.65 50.25 36.9 50.3 37.15 50.4 37.45 50.35 37.75 50.35 38 50.25 38.25 50.1 38.5 49.85 38.7 49.65 38.85 49.35 38.95 49.05 39 48.75 38.95 48.45 38.9 48.25 38.75 48 38.6 47.8 38.35 47.65 38.1 47.55 37.85 47.5 37.55 47.55 37.25 47.6 37 47.75 36.75 47.9 36.5 48.15 36.35 48.35 36.25 48.6 36.15M 47.35 41.95Q 46.6 41.5 45.65 41.75 44.7 42.1 44.25 42.85 44.4 41.7 45.5 41.3 46.6 41.05 47.35 41.95M 48.1 42.55Q 48.05 42.3 47.95 42.1 48.15 42.4 48.25 42.75 48.6 44.8 46.7 45.6 44.7 46 43.95 44 43.9 43.9 43.9 43.75 44.7 45.7 46.6 45.3 48.45 44.55 48.1 42.55M 42.95 43.35Q 43 43.55 43 43.7 41.35 43.9 40.05 44.3 38.75 44.65 37.3 45.4 37.2 45.25 37.1 45.1 38.6 44.4 39.95 44 41.25 43.6 42.95 43.35M 29.6 36.65Q 30 36.7 30.3 36.8 31.1 37.1 31.65 37.65 32.25 38.15 32.6 39 33 39.8 32.95 40.75 32.9 41.65 32.5 42.55 32.1 43.4 31.35 44.05 30.65 44.7 29.7 45.05 29.6 45.05 29.5 45.1 28.65 45.35 27.8 45.25 26.95 45.15 26.2 44.7 25.5 44.35 25 43.65 24.55 43 24.35 42.15 24.2 41.35 24.35 40.5 24.5 39.7 24.9 39.05 24.6 39.65 24.45 40.35 24.3 41.15 24.45 41.9 24.65 42.75 25.1 43.35 25.55 44.05 26.25 44.45 26.95 44.85 27.8 44.95 28.65 45.05 29.55 44.75 30.5 44.5 31.2 43.8 31.9 43.15 32.25 42.35 32.65 41.5 32.7 40.6 32.75 39.7 32.35 38.9 32.05 38.1 31.45 37.6 30.85 37.05 30.15 36.8 29.9 36.7 29.6 36.65M 28.6 37.3Q 29.25 37.3 29.8 37.5 30.35 37.75 30.85 38.15 31.25 38.55 31.55 39.25 31.8 39.85 31.8 40.6 31.75 41.3 31.4 41.95 31.15 42.6 30.55 43.1 30.05 43.6 29.35 43.85 28.55 44.1 27.9 44.05 27.2 43.95 26.7 43.65 26.1 43.3 25.75 42.85 25.35 42.3 25.2 41.65 25.05 41 25.15 40.4 25.25 39.75 25.55 39.2 25.85 38.65 26.3 38.25 26.75 37.85 27.4 37.6 28 37.3 28.6 37.3M 24.95 38.95L 24.9 38.95Q 25.023828125 38.7201171875 25.2 38.5 25.05 38.7 24.95 38.95M 37 37.75Q 37.1 38 36.85 38.1 36.2 38.35 35.6 38.7 35.35 38.8 35.2 38.55 35.15 38.45 35.1 38.35 35 38.05 35.25 37.95 35.85 37.65 36.55 37.35 36.8 37.3 36.95 37.55 36.95 37.65 37 37.75M 32.25 46.8Q 32.3 47 32.35 47.2 33.05 49.1 35.05 48.7 36.9 48 36.55 46 36.5 45.8 36.4 45.6 36.6 45.9 36.65 46.2 37.05 48.25 35.1 49 33.1 49.45 32.35 47.45 32.25 47.15 32.25 46.8M 32.7 46.3Q 32.8 45.15 33.95 44.7 35.05 44.5 35.75 45.4 35 44.9 34.05 45.2 33.05 45.5 32.7 46.3M 29.75 37.6Q 29.2 37.35 28.6 37.4 28 37.4 27.4 37.65 26.8 37.9 26.35 38.3 25.9 38.7 25.65 39.25 25.35 39.75 25.25 40.4 25.1 41 25.25 41.6 25.45 42.25 25.8 42.75 26.15 43.25 26.7 43.55 27.25 43.9 27.9 43.95 28.55 44 29.3 43.75 30 43.5 30.5 43 31.05 42.55 31.35 41.9 31.65 41.3 31.7 40.6 31.7 39.9 31.45 39.25 31.2 38.65 30.75 38.2 30.3 37.8 29.75 37.6M 28.55 37.75Q 29.1 37.7 29.6 37.9 30.1 38.05 30.45 38.45 30.9 38.85 31.1 39.4 31.3 39.95 31.25 40.55 31.2 41.2 31 41.7 30.7 42.3 30.25 42.75 29.8 43.15 29.15 43.35 28.55 43.6 27.95 43.5 27.4 43.45 26.85 43.2 26.4 42.95 26.05 42.5 25.75 42.05 25.6 41.45 25.5 40.95 25.55 40.4 25.65 39.85 25.9 39.4 26.15 38.9 26.6 38.5 26.95 38.15 27.5 37.95 28.05 37.75 28.55 37.75M 28.3 37.85Q 28.3 37.8 28.25 37.85 28.2 37.8 28.15 37.85L 26.9 38.3 26.8 38.4 26.8 38.45Q 26.75 38.5 26.8 38.55L 27.2 39.95 25.75 40.55Q 25.7 40.55 25.7 40.6 25.65 40.6 25.65 40.65 25.6 40.7 25.6 40.75L 25.6 40.8 25.9 42.1 25.9 42.15Q 25.95 42.2 26 42.2 26 42.25 26.05 42.25 26.1 42.25 26.15 42.2L 27.65 41.65 28.15 43.3Q 28.15 43.35 28.2 43.35 28.2 43.4 28.25 43.4 28.3 43.45 28.35 43.45 28.4 43.45 28.45 43.45L 29.8 42.95Q 29.85 42.95 29.9 42.9L 29.95 42.85Q 29.95 42.8 29.95 42.75 30 42.75 29.95 42.65L 29.4 41 31.05 40.4Q 31.1 40.35 31.15 40.35 31.15 40.3 31.2 40.25L 31.2 40.2Q 31.2 40.15 31.2 40.1L 30.7 38.85Q 30.65 38.8 30.65 38.75 30.6 38.75 30.6 38.7 30.55 38.7 30.5 38.7 30.45 38.7 30.4 38.7L 28.85 39.35 28.4 37.95 28.4 37.9Q 28.35 37.85 28.3 37.85M 28.5 40Q 28.6 40.05 28.65 40.1 28.7 40.2 28.75 40.3 28.8 40.4 28.8 40.5 28.75 40.6 28.7 40.7 28.65 40.8 28.6 40.85 28.5 40.95 28.45 40.95 28.35 41 28.25 41 28.1 41 28.05 40.95 27.95 40.9 27.9 40.85 27.8 40.75 27.8 40.65 27.75 40.55 27.75 40.45 27.75 40.35 27.8 40.25 27.85 40.15 27.95 40.1 28.05 40 28.15 40 28.25 39.95 28.35 39.95 28.45 39.95 28.5 40M 30.25 40.2L 29.95 39.35 30.5 39.65 30.25 40.2M 27.35 38.95L 27.65 38.4 28.2 38.6 27.35 38.95M 26.1 41.3L 26.4 40.7 26.65 41.55 26.1 41.3M 28.95 42.75L 28.4 42.5 29.35 42.15 28.95 42.75M 48.65 36.3Q 48.4 36.35 48.25 36.4 48.05 36.55 47.95 36.75 47.8 36.95 47.8 37.2 47.75 37.4 47.8 37.65 47.85 37.9 48 38.05 48.15 38.25 48.35 38.4 48.5 38.5 48.75 38.55 49 38.6 49.25 38.55 49.5 38.5 49.65 38.35 49.85 38.2 49.95 38 50.1 37.8 50.1 37.6 50.15 37.35 50.05 37.1 50 36.85 49.85 36.7 49.7 36.5 49.5 36.4 49.35 36.3 49.1 36.25 48.9 36.25 48.65 36.3M 48.65 32.25Q 48.6 32.05 48.45 31.9 48.35 31.75 48.2 31.65 48 31.55 47.8 31.5 47.6 31.5 47.45 31.5 47.2 31.55 47.05 31.65 46.85 31.8 46.75 31.9 46.65 32.1 46.6 32.25 46.6 32.45 46.6 32.65 46.65 32.85 46.8 33 46.9 33.1 47.1 33.2 47.25 33.3 47.5 33.35 47.65 33.4 47.9 33.35 48.1 33.3 48.3 33.2 48.4 33.05 48.5 32.95 48.65 32.8 48.65 32.6 48.7 32.45 48.65 32.25M 45.4 34.3Q 45.2 34.35 45 34.5 44.8 34.6 44.7 34.75 44.55 34.9 44.5 35.15 44.45 35.35 44.5 35.6 44.55 35.8 44.65 36 44.8 36.2 44.95 36.3 45.1 36.35 45.35 36.4 45.6 36.45 45.8 36.4 46.05 36.35 46.25 36.25 46.45 36.1 46.6 35.95 46.65 35.75 46.7 35.5 46.75 35.3 46.7 35.1 46.65 34.85 46.55 34.7 46.45 34.55 46.25 34.45 46.05 34.35 45.85 34.3 45.65 34.25 45.4 34.3M 51.25 33.35Q 51.1 33.25 50.9 33.25 50.7 33.2 50.45 33.25 50.25 33.3 50.1 33.4 49.95 33.5 49.85 33.7 49.75 33.85 49.7 34.05 49.7 34.25 49.75 34.45 49.8 34.65 49.95 34.8 50.1 34.95 50.25 35.05 50.45 35.2 50.7 35.2 50.9 35.25 51.15 35.2 51.3 35.15 51.5 35.05 51.65 34.9 51.75 34.75 51.85 34.6 51.85 34.4 51.9 34.2 51.8 34 51.75 33.8 51.6 33.65 51.45 33.45 51.25 33.35 Z"/></g><g id="Layer0_3_FILL"><path fill="#1C5A7D" stroke="none" d="M 165.55 54.9Q 165.55 51.9 162.6 51.9 161.3 51.9 160.5 52.75 159.7 53.6 159.7 54.9L 159.7 71.75Q 159.7 73.05 160.5 73.9 161.3 74.75 162.6 74.75 163.9 74.7 164.75 73.9 165.55 73.1 165.55 71.75L 165.55 54.9M 165.15 48.7Q 166.2 47.65 166.2 46.15 166.2 44.6 165.15 43.5 164.1 42.4 162.6 42.4 161.1 42.4 160.05 43.5 158.95 44.6 158.95 46.15 158.95 47.65 160.05 48.7 161.1 49.8 162.6 49.8 164.1 49.8 165.15 48.7 Z"/></g><g id="Layer0_4_FILL"><path fill="#4EC1E0" stroke="none" d="M 112.7 81.95Q 112.9 80.95 111.75 80.35 110.5 79.6 109 79.25 108.85 79.25 108.85 79.1 108.8 78.7 108.4 78.7L 108.25 78.7Q 107.85 78.7 107.5 79.2L 106.85 79.4Q 106.8 79.4 106.5 79.9L 106.45 80.05Q 106.45 80.2 107.25 80.5L 107.1 81.45Q 106.75 83.95 106.85 84.75L 106.85 84.8Q 106.4 85.15 106.35 85.2L 106.35 85.25 106.4 85.3Q 106.4 85.7 106.5 85.8 106.85 85.85 106.85 85.9 107 85.9 107 86.75 106.8 88.6 107.5 88.6 107.95 88.45 108.1 87.8L 108.15 87.65Q 108.2 86.95 108.15 85.55L 109.05 85.2Q 110.15 84.75 111.15 84.1 112.45 83.2 112.7 82.05L 112.7 81.95M 111.5 82.05Q 111.45 82.2 111.4 82.25 110.95 83.1 110.05 83.6 109.25 84.05 108.05 84.45 107.9 83.95 108.4 80.35L 108.45 80.35Q 111.7 81.1 111.5 82L 111.5 82.05 Z"/></g><g id="Layer0_5_FILL"><path fill="#4EC1E0" stroke="none" d="M 114.75 77.7Q 114.5 77.7 114.15 77.95 113.9 78.7 113.8 78.7L 113.95 78.8Q 113.9 79.25 113.95 79.25 113.5 80.65 113.2 81.9L 113.1 82.55Q 112.7 84.45 112.65 87.4 112.8 87.55 112.9 87.7 113.35 87.55 113.5 87.55 113.65 87.5 113.75 87.1L 113.8 86.85Q 113.85 84.35 114.15 82.9L 114.2 82.55 114.95 79.35Q 115.1 78.6 115.1 78 115.15 77.7 114.8 77.7L 114.75 77.7 Z"/></g><g id="Layer0_6_FILL"><path fill="#4EC1E0" stroke="none" d="M 116.1 83.9Q 114.5 85.35 114.35 86.35L 114.35 86.4 114.3 86.6Q 114.4 87.35 115.1 87.4 115.8 87.4 116.5 86.75 117.1 86.3 117.9 85.25L 118 85.4Q 118.2 86.6 118.35 87.05 118.65 87.65 119.1 87.85 119.15 87.85 119.45 87.65 119.75 87.65 119.8 87.45L 119.8 87.35Q 119.85 87.1 119.65 86.65 119.25 86.05 119.15 85.1 119.1 83.45 119.15 83.15 119.15 82.6 118.85 82.6L 118.75 82.6Q 118.45 82.6 118.1 82.85 117 83.25 116.1 83.9M 115.6 86.2Q 115.75 85.45 116.35 84.85 117.35 84 117.65 83.95L 117.7 83.95Q 117.6 84.5 116.65 85.45 116.1 86.2 115.6 86.2 Z"/></g><g id="Layer0_7_FILL"><path fill="#4EC1E0" stroke="none" d="M 120.2 85.45Q 120.1 85.85 120.1 86.3 120.2 87 120.5 87L 120.6 87Q 121.05 87 121.35 86.9 121.55 86.9 122.25 86.3 123.05 85.3 123.4 84.95 123.4 86.7 123.1 88.15 122.95 89.05 122.75 89.6 122.4 90.55 121.85 90.55L 121.8 90.55Q 121.7 90.55 121.55 90.5L 120.8 89.95Q 120.55 89.95 120.5 89.9 120 89.5 119.85 89.5 119.65 89.5 119.35 89.7 119.3 90 119.5 90.35 120.4 91.65 121.55 91.7 121.8 91.7 122.15 91.55 123.55 91.05 123.95 89.3L 124.3 86.5 124.35 86.4Q 124.55 85.05 125.05 81.75 124.9 81.55 124.65 81.55L 124.3 81.55Q 124.1 81.8 123.85 82 123.75 82.35 123.65 82.6 123.55 83 122.3 84.75 122.05 85.15 122 85.15 121.45 85.75 121.2 85.75L 121.15 85.75 121.2 85.45Q 121.3 84.9 121.5 84.55 122.1 83.15 122.15 82.75L 122.15 82.7Q 121.95 82.45 121.75 82.45L 121.65 82.45Q 121.4 82.45 121.1 82.9 120.4 84.35 120.2 85.45 Z"/></g><g id="Layer0_8_FILL"><path fill="#4EC1E0" stroke="none" d="M 132.6 81.6Q 132.65 81.55 133.1 81.1 133.15 80.85 133.05 80.15 132.6 78.7 131.5 78.7L 131.35 78.7Q 130.6 78.7 129.75 79.4 128.3 80.8 127.9 83L 127.9 83.15Q 127.4 85.5 128.6 87.55 129.35 88.35 130.25 88.35L 130.35 88.35Q 130.6 88.35 130.8 88.25 132 87.8 132.85 86.6 134.4 84.15 134.6 83 134.65 82.65 134.65 82.4 134.7 82.3 134.4 82.25 133.6 82.25 132.65 82.4 130.95 82.65 130.8 83.3 130.8 83.45 130.95 83.55 131.25 83.65 131.2 83.85L 131.2 83.9Q 132.85 83.55 133.4 83.5 133.05 84.4 132.75 84.95 131.5 87.35 130.5 87.35 130.05 87.35 129.75 86.9 128.75 85.3 129.15 83L 129.2 82.85Q 129.5 81.3 130.4 80.4 130.75 80.05 131.3 79.9L 131.4 79.95Q 131.7 80.15 131.85 80.8 132.05 81.7 132.35 81.7 132.45 81.7 132.6 81.6 Z"/></g><g id="Layer0_9_FILL"><path fill="#4EC1E0" stroke="none" d="M 135.85 83.9Q 134.3 85.35 134.1 86.35L 134.1 86.4 134.05 86.6Q 134.15 87.35 134.85 87.4 135.55 87.4 136.25 86.75 136.85 86.3 137.65 85.25L 137.75 85.4Q 138 86.6 138.1 87.05 138.4 87.65 138.9 87.85 138.95 87.85 139.2 87.65 139.5 87.65 139.55 87.45L 139.55 87.35Q 139.6 87.1 139.4 86.65 139 86.05 138.95 85.1 138.9 83.45 138.95 83.15 138.95 82.6 138.6 82.6L 138.5 82.6Q 138.2 82.6 137.9 82.85 136.75 83.25 135.85 83.9M 135.35 86.2Q 135.5 85.45 136.15 84.85 137.1 84 137.4 83.95L 137.45 83.95Q 137.35 84.5 136.35 85.45 135.8 86.2 135.35 86.2 Z"/></g><g id="Layer0_10_FILL"><path fill="#4EC1E0" stroke="none" d="M 140.25 84.85L 140 86.35Q 139.95 86.65 139.8 87L 139.85 87.1 139.85 87.3Q 140 87.45 140.25 87.5 140.75 87.5 141.25 86.35 141.7 85.3 142 85.05 142.1 85.05 141.95 86.15 141.8 87.5 142.5 87.5L 142.6 87.5Q 143 87.5 144.25 85.2L 144.3 85.2Q 144.4 85.6 144.5 86.55 144.6 87.5 145.45 87.5 145.5 87.5 145.55 87.4 145.8 87.2 145.8 87.15 145.6 86.3 145.45 85.3 145.3 84.1 145.1 83.6 145.1 83.45 144.5 83.35L 144.4 83.35 144.3 83.55 144.1 83.5Q 143.95 83.65 143.75 83.85 143.45 84.45 143.25 84.75L 143.2 84.75 143.15 84.65Q 143.05 83.5 142.2 83.5 142.15 83.5 141.9 83.65 141.3 84.3 141.15 84.3L 140.95 84.25Q 140.9 84.2 140.85 84.35 140.55 84.45 140.55 84.5L 140.55 84.6Q 140.5 84.85 140.25 84.85 Z"/></g><g id="Layer0_11_FILL"><path fill="#4EC1E0" stroke="none" d="M 152 84.75L 151.95 84.75Q 151.9 84.9 151.75 84.95 151.7 84.9 151.7 84.85L 151.75 84.8 151.75 84.6 151.7 84.6Q 151.45 84.6 150.75 85.2 149.6 86.45 148.85 86.45 148.25 86.45 148 85.9L 148 85.85Q 149.45 85.3 149.65 84.45 149.7 84.25 149.65 83.85 149.3 82.7 148.4 82.7 147.95 82.7 147.25 83 146.65 83.2 146.45 84.1L 146.45 84.25 146.25 85.6 146.25 85.65Q 147.15 87.5 148.45 87.5L 148.65 87.5Q 148.85 87.5 149.15 87.45 150.2 87.1 150.8 86.3 150.85 86.15 151.1 86.1 151.2 85.9 151.3 85.75 151.95 85.05 152 84.75M 148.5 84.5Q 148.45 84.65 148.35 84.8 147.9 85.1 147.65 85.1 147.4 84.9 147.5 84.4 147.6 84.05 147.7 83.9 147.75 83.7 148 83.7L 148.15 83.7Q 148.6 83.9 148.5 84.5 Z"/></g><g id="Layer0_12_FILL"><path fill="#4EC1E0" stroke="none" d="M 153.65 83.05Q 153.2 83.05 152.55 83.3 151.4 83.8 151.2 84.7L 151.2 84.75Q 151.1 85.3 152.35 85.75 153.6 86.05 154.05 86.3L 154.05 86.35Q 153.65 86.6 153.15 86.6 152.5 86.6 151.7 86.2 151.3 86.45 151.25 86.75L 151.2 86.85Q 151.2 87.1 151.3 87.3 151.25 87.55 152.85 87.7 153.3 87.65 153.75 87.6 155.4 87.3 155.6 86.35 155.7 85.85 155.2 85.5 154.65 85.2 153.4 84.9 152.7 84.7 152.55 84.4 152.55 84.3 153.9 84.05 154.3 83.95 154.5 83.75 154.5 83.7 154.45 83.35 154.45 83.05 153.8 83.05L 153.65 83.05 Z"/></g><g id="Layer0_13_FILL"><path fill="#4EC1E0" stroke="none" d="M 156.95 86.3L 156.85 86.3 156.45 86.35Q 156 86.55 155.9 86.95L 155.9 87.15Q 155.95 87.55 156.3 87.6L 156.45 87.55Q 157.2 87.25 157.35 86.75L 157.35 86.7Q 157.4 86.35 156.95 86.3 Z"/></g><g id="Layer0_14_FILL"><path fill="#4EC1E0" stroke="none" d="M 167.55 77.6L 167.4 77.6Q 166.9 77.75 166.8 78.35L 166.75 78.5Q 166.6 79.75 165.95 83.85 165.1 84.05 163.9 84.05L 163.75 84.05 163.8 83.55Q 164.25 80.1 164.45 79.15L 164.6 78.35Q 164.65 78.1 164.55 78 164.6 77.85 164.1 77.85L 163.85 77.85Q 163.5 77.85 163.2 79.1 162.8 81.7 162.5 84.05 162.5 84.1 162.25 84.15L 161.45 84.15Q 161.25 84.15 161.1 84.7 161.1 84.8 161.15 84.9 161.3 85.2 162.1 85.2L 162.3 85.15 162.4 85.15Q 162.45 85.2 162.3 86.45 161.85 88.15 161.95 88.6L 162.7 88.6Q 163.05 88.6 163.2 87.7 163.35 86.85 163.65 85.1L 165.45 85 165.8 85.05Q 165.85 85.05 165.8 85.8 165.5 87.6 165.55 87.75 165.5 87.95 166 87.95 166.45 87.95 166.7 87.7L 166.75 87.5Q 167 85.25 167 85.55 167.1 84.95 167.05 84.95L 167.1 84.9Q 167.1 85 168.25 85.05L 168.35 85.05Q 168.9 85.05 168.95 84.65 168.95 84.1 167.25 83.85 167.15 83.85 167.2 83.4 167.8 80.1 167.9 79.6L 168.05 78.3 168.05 78Q 168.05 77.6 167.55 77.6 Z"/></g><g id="Layer0_15_FILL"><path fill="#4EC1E0" stroke="none" d="M 174 84.6L 173.95 84.6Q 173.65 84.6 173 85.2 171.8 86.45 171.05 86.45 170.5 86.45 170.2 85.9L 170.2 85.85Q 171.65 85.3 171.85 84.45 171.9 84.25 171.85 83.85 171.5 82.7 170.6 82.7 170.15 82.7 169.5 83 168.85 83.2 168.7 84.1L 168.7 84.25 168.5 85.6 168.5 85.65Q 169.4 87.5 170.65 87.5L 170.85 87.5Q 171.05 87.5 171.4 87.45 172.4 87.1 173.05 86.3 173.1 86.15 173.3 86.1 173.4 85.9 173.5 85.75 174.2 85.05 174.2 84.75 174.15 84.9 174 84.95 173.95 84.9 173.95 84.85L 174 84.8 174 84.6M 169.7 84.4Q 169.8 84.05 169.9 83.9 169.95 83.7 170.25 83.7L 170.4 83.7Q 170.8 83.9 170.7 84.5 170.65 84.65 170.6 84.8 170.1 85.1 169.85 85.1 169.65 84.9 169.7 84.4 Z"/></g><g id="Layer0_16_FILL"><path fill="#4EC1E0" stroke="none" d="M 177.15 82.6Q 176.9 82.6 176.55 82.85 175.4 83.25 174.5 83.9 172.95 85.35 172.75 86.35L 172.75 86.4 172.7 86.6Q 172.8 87.35 173.5 87.4 174.2 87.4 174.95 86.75 175.45 86.3 176.3 85.25L 176.4 85.4Q 176.65 86.6 176.8 87.05 177.05 87.65 177.55 87.85 177.6 87.85 177.85 87.65 178.15 87.65 178.2 87.45L 178.2 87.35Q 178.25 87.1 178 86.65 177.7 86.05 177.6 85.1 177.55 83.45 177.6 83.15 177.6 82.6 177.25 82.6L 177.15 82.6M 176.1 83.95Q 176.05 84.5 175.05 85.45 174.45 86.2 174.05 86.2 174.2 85.45 174.8 84.85 175.75 84 176.05 83.95L 176.1 83.95 Z"/></g><g id="Layer0_17_FILL"><path fill="#4EC1E0" stroke="none" d="M 180.8 77.7Q 180.55 77.7 180.2 77.95 179.95 78.7 179.85 78.7L 180 78.8Q 179.95 79.25 180 79.25 179.55 80.65 179.25 81.9L 179.15 82.55Q 178.75 84.45 178.7 87.4 178.85 87.55 178.95 87.7 179.4 87.55 179.55 87.55 179.7 87.5 179.8 87.1L 179.85 86.85Q 179.9 84.35 180.2 82.9L 181 79.35Q 181.15 78.6 181.15 78 181.2 77.7 180.85 77.7L 180.8 77.7 Z"/></g><g id="Layer0_18_FILL"><path fill="#4EC1E0" stroke="none" d="M 189.7 79.75L 188.9 80.3Q 187.25 81.35 185.8 81.85L 185.85 81.45Q 186.35 80.1 186.4 79.9L 186.45 79.6Q 186.5 79.35 186 79.35L 185.9 79.35Q 185.75 79.35 185.55 79.45 185 80.65 184.8 81.55L 184.7 82.3 184.35 82.5Q 183.45 82.8 183.45 83L 183.4 83.1Q 183.35 83.35 183.55 83.55 184.15 84.05 184.2 84.2 184.35 84.3 184.2 85.35L 184.05 87.7Q 184.05 87.85 184.4 87.9L 184.55 87.9Q 184.85 87.9 185.1 87.65L 185.1 87.25Q 185.2 85.65 185.3 85.35L 185.3 85.25 185.35 85.15Q 185.45 85.15 186.2 85.75 188.05 87.35 189.3 87.3L 189.45 87.3Q 189.9 87.35 190.5 87.05 190.5 86.75 190.4 86.65 190.45 86.5 189.6 86.5 189.1 86.5 188.3 85.9 187.45 85.4 186 84.05 185.35 83.75 185.45 83.3L 185.55 83.05Q 186.1 82.8 186.2 82.8 188 81.9 188.85 81.4 190.4 80.7 190.5 80.3L 190.5 80.2Q 190.55 79.85 189.7 79.75 Z"/></g><g id="Layer0_19_FILL"><path fill="#4EC1E0" stroke="none" d="M 193.1 80.7L 193 80.7Q 192.4 80.7 192.25 81.15L 192.2 81.25 192.2 81.3Q 192.2 81.55 192.65 81.6L 192.8 81.6Q 193.55 81.45 193.6 81.15L 193.6 80.95Q 193.55 80.7 193.1 80.7M 193 82.65Q 193.05 82.45 192.65 82.5 192.2 82.45 192.05 83.2 191.9 84.05 191.8 84.5L 191.25 86.6Q 191.1 87.4 191.35 87.65L 191.4 87.55Q 191.45 87.8 191.6 87.75L 191.8 87.65Q 192.1 87.6 192.25 87.45L 192.75 85.05Q 193 83.8 193 82.65 Z"/></g><g id="Layer0_20_FILL"><path fill="#4EC1E0" stroke="none" d="M 197.9 80Q 197.8 80 197.75 80.05L 197.05 80.5 196.95 81Q 196.85 81.6 196.65 83.7 196.6 83.95 196.4 84 195.75 84.1 194.55 84.95 193.25 86.1 193.2 86.55L 193.2 86.65Q 193.15 86.8 193.15 87.25 193.15 87.3 193.5 87.65 194.6 87.65 195.6 87.15 196.4 86.7 196.8 86.1 196.95 86.4 197.05 86.7 197.15 87.55 197.75 87.5L 198.05 87.5Q 198.45 87.1 198.45 87L 198.45 86.85Q 198.5 86.65 198.2 86.3 197.65 84.6 197.9 83.3L 197.9 83.15 198.25 81.6Q 198.45 80.35 198.3 80.25 198.1 80.15 198.1 80L 197.9 80M 194.35 86.5Q 194.4 86.4 194.75 86 195.25 85.35 196.15 85.05 196.1 85.15 196 85.35 195.3 86.55 194.5 86.55L 194.35 86.5 Z"/></g><g id="Layer0_21_FILL"><path fill="#4EC1E0" stroke="none" d="M 202.2 83.35Q 202.2 83.05 201.5 83.05L 201.4 83.05Q 200.9 83.05 200.3 83.3 199.1 83.8 198.9 84.7L 198.9 84.75Q 198.8 85.3 200.05 85.75 201.35 86.05 201.75 86.3L 201.75 86.35Q 201.4 86.6 200.85 86.6 200.25 86.6 199.45 86.2 199 86.45 198.95 86.75L 198.95 86.85Q 198.9 87.1 199 87.3 198.95 87.55 200.55 87.7 201 87.65 201.45 87.6 203.15 87.3 203.3 86.35 203.4 85.85 202.95 85.5 202.35 85.2 201.15 84.9 200.45 84.7 200.3 84.4 200.35 84.3 201.6 84.05 202.05 83.95 202.25 83.75 202.25 83.7 202.2 83.35 Z"/></g><g id="Layer0_22_FILL"><path fill="#4EC1E0" stroke="none" d="M 204.65 86.3L 204.55 86.3 204.15 86.35Q 203.7 86.55 203.6 86.95L 203.6 87.15Q 203.65 87.55 204.05 87.6L 204.15 87.55Q 205 87.25 205 86.75L 205.05 86.7Q 205.1 86.35 204.65 86.3 Z"/></g><g id="Layer0_23_FILL"><path fill="#1C5A7D" stroke="none" d="M 111.65 54.9Q 111.65 53.6 110.8 52.8 109.95 51.9 108.7 51.9 104.7 51.9 102 54.65 99.25 57.5 99.25 61.55L 99.25 71.7Q 99.25 73.05 100.05 73.9 100.9 74.7 102.2 74.7 103.5 74.7 104.35 73.9 105.15 73.05 105.15 71.7L 105.15 61.5Q 105.2 60 106.15 59.05 107.15 58.05 108.6 57.95 111.65 57.7 111.65 54.9 Z"/></g><g id="Layer0_24_FILL"><path fill="#1C5A7D" stroke="none" d="M 85.15 47.5Q 84.3 46.6 83 46.6 81.7 46.6 80.9 47.5 80.1 48.3 80.1 49.65L 80.1 65.05Q 80.1 69.2 82.8 71.95 85.5 74.7 89.5 74.7L 92.3 74.7Q 95.2 74.7 95.2 71.65 95.2 70.35 94.4 69.55 93.6 68.65 92.3 68.7L 89.5 68.7 89.5 68.65Q 88.05 68.7 87 67.65 85.95 66.55 85.95 65.05L 85.95 58.05 92.3 58.05Q 95.2 58.05 95.2 55 95.2 53.7 94.4 52.9 93.6 52 92.3 52.05L 85.95 52.05 85.95 49.65Q 86 48.3 85.15 47.5 Z"/></g><g id="Layer0_25_FILL"><path fill="#1C5A7D" stroke="none" d="M 116.6 55.1Q 113.4 58.4 113.4 63.25 113.4 68.05 116.6 71.4 119.8 74.7 124.5 74.7L 132.7 74.7Q 133.4 74.7 134.9 73.9 135.7 73.05 135.7 71.7L 135.7 63.25Q 135.7 58.4 132.5 55.1 129.25 51.8 124.5 51.8 119.85 51.8 116.6 55.1M 120.85 67.1Q 119.25 65.5 119.25 63.25 119.3 61 120.85 59.45 122.35 57.85 124.5 57.85 126.7 57.9 128.25 59.45 129.85 61.05 129.85 63.25L 129.85 68.7 124.5 68.7Q 122.35 68.65 120.85 67.1 Z"/></g><g id="Layer0_26_FILL"><path fill="#1C5A7D" stroke="none" d="M 149.95 43.7Q 149.15 44.55 149.15 45.85L 149.15 71.8Q 149.15 73.1 149.95 73.9 150.75 74.75 152.1 74.7 153.4 74.75 154.25 73.9 155.05 73.05 155.05 71.75L 155.05 45.9Q 155.1 42.9 152.1 42.9 150.75 42.9 149.95 43.7 Z"/></g><g id="Layer0_27_FILL"><path fill="#1C5A7D" stroke="none" d="M 179.65 42.7Q 175.6 42.7 172.9 45.45 170.2 48.25 170.2 52.4L 170.2 71.65Q 170.2 73 171 73.9 171.8 74.7 173.15 74.7 174.4 74.7 175.25 73.9 176.05 73 176.05 71.65L 176.05 64.85 180.55 64.85Q 181.85 64.85 182.65 64.05 183.45 63.15 183.45 61.85 183.5 58.8 180.55 58.8L 176.05 58.8 176.05 52.4Q 176.1 50.9 177.1 49.8 178.15 48.75 179.65 48.75L 181.2 48.75Q 184.1 48.55 184.1 45.75 184.1 42.95 181.2 42.7L 179.65 42.7 Z"/></g><g id="Layer0_28_FILL"><path fill="#1C5A7D" stroke="none" d="M 186.35 63.25Q 186.35 68.05 189.6 71.4 192.8 74.7 197.5 74.7L 201.4 74.7Q 202.7 74.7 203.5 73.9 204.3 73 204.3 71.65 204.3 70.35 203.5 69.55 202.7 68.7 201.4 68.7L 197.5 68.7Q 196.85 68.65 196.25 68.55L 205.15 59.85Q 206.45 58.85 206.45 57.4 206.45 56.3 205.6 55.3 202.3 51.8 197.5 51.8 192.8 51.8 189.6 55.1 186.35 58.4 186.35 63.25M 193.8 59.45Q 195.3 57.85 197.5 57.85 198.05 57.9 198.65 58L 192.3 64.1Q 192.25 63.7 192.25 63.25 192.3 61 193.8 59.45 Z"/></g><g id="Layer0_29_FILL"><path fill="#1C5A7D" stroke="none" d="M 37.7 55.1Q 34.5 58.4 34.5 63.25 34.5 68.05 37.7 71.4 40.95 74.7 45.65 74.7L 49.5 74.7Q 50.85 74.7 51.65 73.9 52.45 73 52.45 71.65 52.45 70.35 51.65 69.55 50.85 68.7 49.5 68.7L 45.65 68.7Q 44.95 68.65 44.4 68.55L 53.3 59.85Q 54.6 58.85 54.6 57.4 54.6 56.3 53.75 55.3 50.4 51.8 45.65 51.8 40.95 51.8 37.7 55.1M 40.45 64.1Q 40.4 63.7 40.35 63.25 40.4 61 41.95 59.45 43.45 57.85 45.65 57.85 46.2 57.9 46.75 58L 40.45 64.1 Z"/></g><g id="Layer0_30_FILL"><path fill="#1C5A7D" stroke="none" d="M 74.05 51.85Q 72.9 51.9 72.15 52.6 71.45 53.15 70.5 54.45L 67.1 59.25 63.6 54.45Q 62.65 53.2 61.95 52.65 61.15 51.9 60.05 51.8 58.7 51.9 57.85 52.75 57 53.45 57 54.55 57 55.75 58.35 57.35L 62.85 62.7 57.7 69.25Q 56.45 71 56.45 72 56.45 73 57.35 73.85 58.3 74.7 59.5 74.7 60.65 74.7 61.35 73.95 62.05 73.4 63 72.1L 67.1 67 71.05 72.1Q 71.95 73.35 72.75 73.95 73.55 74.7 74.65 74.7 75.9 74.7 76.8 73.85 77.7 73.1 77.7 72.05 77.7 71.05 76.4 69.25L 71.25 62.7 75.75 57.35Q 76.45 56.5 76.75 55.9 77.1 55.25 77.15 54.55 77.1 53.45 76.25 52.7 75.35 51.9 74.05 51.85 Z"/></g><g id="Layer0_31_FILL"><path fill="#1C5A7D" stroke="none" d="M 208.6 54.7L 208.6 51.95 209.6 51.95 209.6 51.55 207.1 51.55 207.1 51.95 208.15 51.95 208.15 54.7 208.6 54.7 Z"/></g><g id="Layer0_32_FILL"><path fill="#1C5A7D" stroke="none" d="M 213 54.7L 213 51.55 212.35 51.55 211.45 54.25 210.6 51.55 210 51.55 210 54.7 210.4 54.7 210.4 52.9Q 210.4 52.75 210.4 52.5 210.4 52.3 210.4 52.15L 210.4 52.05 211.3 54.7 211.7 54.7 212.55 52.05Q 212.55 52.3 212.55 52.55 212.55 52.8 212.55 52.9L 212.55 54.7 213 54.7 Z"/></g></defs><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_0_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_1_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_2_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_3_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_4_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_5_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_6_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_7_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_8_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_9_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_10_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_11_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_12_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_13_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_14_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_15_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_16_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_17_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_18_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_19_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_20_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_21_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_22_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_23_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_24_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_25_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_26_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_27_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_28_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_29_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_30_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_31_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_32_FILL"/></g></svg>';
const cmnhLogo = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="none" x="0px" y="0px" width="260px" height="111px" viewBox="0 0 260 111"><defs><g id="Layer0_0_FILL"><path fill="#808285" stroke="none" d="M 63.75 15.35Q 63.45 13.9 62.55 13.75 63.25 13.75 63.55 12.4 63.35 10.55 61.25 10.65L 58.05 10.65 58.05 17.4 61.35 17.4Q 63.35 17.6 63.75 15.35M 61.05 14.4Q 61.95 14.3 62.15 15.3 62.15 16.15 60.85 16.15L 59.65 16.15 59.65 14.4 61.05 14.4M 62.05 12.55Q 61.85 13.35 60.95 13.25L 59.65 13.25 59.65 11.9 60.95 11.9Q 61.85 11.8 62.05 12.55 Z"/></g><g id="Layer0_1_FILL"><path fill="#808285" stroke="none" d="M 69.75 10.65L 64.65 10.65 64.65 17.4 69.85 17.4 69.85 16.15 66.25 16.15 66.25 14.4 69.45 14.4 69.45 13.25 66.25 13.25 66.25 11.9 69.75 11.9 69.75 10.65 Z"/></g><g id="Layer0_2_FILL"><path fill="#808285" stroke="none" d="M 76.3 10.65L 74.7 10.65Q 74.8 12 74.8 15.1L 72.1 10.65 70.65 10.65 70.65 17.4 72.2 17.4Q 72.1 14 72 13.05L 74.8 17.4 76.3 17.4 76.3 10.65 Z"/></g><g id="Layer0_3_FILL"><path fill="#808285" stroke="none" d="M 82.2 14.4L 82.2 13.25 79 13.25 79 11.9 82.5 11.9 82.5 10.65 77.4 10.65 77.4 17.4 82.6 17.4 82.6 16.15 79 16.15 79 14.4 82.2 14.4 Z"/></g><g id="Layer0_4_FILL"><path fill="#808285" stroke="none" d="M 88.4 10.65L 83.3 10.65 83.3 17.4 84.9 17.4 84.9 14.6 88 14.6 88 13.35 84.9 13.35 84.9 11.9 88.4 11.9 88.4 10.65 Z"/></g><g id="Layer0_5_FILL"><path fill="#808285" stroke="none" d="M 89.1 17.4L 90.7 17.4 90.7 10.65 89.1 10.65 89.1 17.4 Z"/></g><g id="Layer0_6_FILL"><path fill="#808285" stroke="none" d="M 93.4 17.4L 94.85 17.4 94.85 11.9 96.95 11.9 96.95 10.65 91.3 10.65 91.3 11.9 93.4 11.9 93.4 17.4 Z"/></g><g id="Layer0_7_FILL"><path fill="#808285" stroke="none" d="M 97.55 17.4L 99.15 17.4 99.15 10.65 97.55 10.65 97.55 17.4 Z"/></g><g id="Layer0_8_FILL"><path fill="#808285" stroke="none" d="M 105.85 10.65L 104.25 10.65Q 104.35 12 104.35 15.1L 101.65 10.65 100.15 10.65 100.15 17.4 101.75 17.4Q 101.65 14 101.55 13.05L 104.35 17.4 105.85 17.4 105.85 10.65 Z"/></g><g id="Layer0_9_FILL"><path fill="#808285" stroke="none" d="M 106.75 14Q 106.65 17.2 109.95 17.5 111.25 17.5 112.05 16.55L 112.15 17.3 113.35 17.3 113.35 13.65 110.15 13.65 110.15 14.8 111.95 14.8Q 111.55 16.15 110.25 16.25 108.25 15.95 108.35 13.9 108.35 12 110.25 11.7 111.45 11.7 111.75 12.85L 113.25 12.75Q 112.65 10.35 110.25 10.45 106.85 10.65 106.75 14 Z"/></g><g id="Layer0_10_FILL"><path fill="#808285" stroke="none" d="M 51.55 25.15L 51.55 24.95Q 49.85 4.65 29.7 0.3 27.8 0 25.7 0 23.75 0 21.85 0.3 1.55 4.65 0 24.95L 0 25.15Q 0.3 32.95 3.75 39.55 9.25 49.5 15.65 55.7 19.85 59.85 21.75 61.4L 21.85 61.4Q 22.15 61.7 22.45 61.9 25.5 63.7 28.8 62.05 28.9 62.05 29.6 61.5L 29.7 61.4Q 33 58.9 40 51.15 44.3 46.1 47.8 39.55 51.25 32.95 51.55 25.15M 41.9 24.95Q 41.8 24.95 41.9 25.05 41.8 30.05 39 35.5 34.6 43.6 28.8 49.2 27.1 50.95 25.7 52.2 22.65 49.4 18.65 44.65 14.95 40.3 12.35 35.1 9.75 29.95 9.65 25.05L 9.65 24.95Q 10.75 12.3 23.35 9.55 24.5 9.4 25.7 9.4 27 9.4 28.2 9.55 40.8 12.3 41.9 24.95 Z"/></g><g id="Layer0_11_FILL"><path fill="#808285" stroke="none" d="M 26.9 76.75Q 31.5 76.3 31.9 71.95L 31.9 67.4 19.55 67.4 19.55 71.95Q 19.95 76.3 24.5 76.75L 26.9 76.75 Z"/></g><g id="Layer0_12_FILL"><path fill="#808285" stroke="none" d="M 66.85 31.6Q 65.75 31.15 64.15 31.15 57.85 31.7 57.75 37.7 58.05 42.15 60.85 43.4 61.55 44.1 64.25 44.3 66.25 44.45 68.45 42.95 69.05 42.35 69.45 41.55 69.55 41.1 69.55 41 69.35 39.65 68.05 39.65 67.25 39.75 67.15 40.1 66.95 40.4 66.75 40.7 66.15 41.75 64.25 41.95 61.15 41.95 60.85 37.8 60.35 34.5 64.25 33.45 66.25 33.75 66.45 34.4 66.65 34.6 66.85 34.8 67.05 35.2 67.95 35.3 69.05 35.3 69.25 34.05 68.85 32.3 66.85 31.6 Z"/></g><g id="Layer0_13_FILL"><path fill="#808285" stroke="none" d="M 77.6 35Q 76.7 34.5 75.9 34.6 73.7 34.9 73.3 35.7L 73.3 32.85Q 73.5 32 72.5 31.3 72.2 31.25 71.9 31.25 71.4 31.25 71.05 31.5 70.55 32.1 70.65 32.75L 70.65 42.55Q 70.45 43.5 71.5 44.1 71.8 44.2 72 44.1 72.6 44.1 73 43.7 73.4 43 73.3 42.45L 73.3 39.05Q 73.2 38 74 37.15 74.3 36.95 74.9 36.85 76.7 37.2 76.4 38.85L 76.4 42.55Q 76.3 43.3 76.8 43.8 77.2 44.1 77.7 44.1 78.3 44.1 78.7 43.8 79.1 43.2 79 42.55L 79 38Q 79.4 36.55 77.6 35 Z"/></g><g id="Layer0_14_FILL"><path fill="#808285" stroke="none" d="M 82.7 34.8Q 82.5 34.7 82.1 34.7 81.4 34.7 81.2 35 80.8 35.3 80.8 36.25L 80.8 42.45Q 80.6 43.4 81.6 44.1 81.8 44.2 82.2 44.1 82.7 44.2 83.2 43.6 83.5 43.1 83.5 42.45L 83.5 36.25Q 83.7 35.4 82.7 34.8M 83.5 32.4Q 83.3 31.25 82.2 31.15 80.9 31.25 80.8 32.4 80.9 33.65 82.2 33.75 83.4 33.65 83.5 32.4 Z"/></g><g id="Layer0_15_FILL"><path fill="#808285" stroke="none" d="M 86.6 44.2Q 88.2 43.6 87.9 42.55L 87.9 32.75Q 88.1 31.9 87.1 31.3 86.7 31.25 86.5 31.25 86 31.25 85.6 31.5 85.1 32.1 85.2 32.75L 85.2 42.55Q 84.8 43.7 86.6 44.2 Z"/></g><g id="Layer0_16_FILL"><path fill="#808285" stroke="none" d="M 97.85 31.3Q 97.55 31.25 97.15 31.25 96.35 31.25 96.05 31.9 95.85 32.3 95.85 32.75L 95.85 35.5Q 95.15 34.8 93.3 34.5 89.2 35.1 89.2 39.25 89.7 44.4 93.3 44.3 95.35 44.1 95.95 42.95 95.95 43.3 96.25 43.7 96.65 44.2 97.25 44.1 98.85 43.7 98.55 42.45L 98.55 32.85Q 98.65 31.9 97.85 31.3M 94 42.05Q 93.4 42.15 92.7 41.55 91.8 40.4 91.9 39.25 91.8 37.05 93.9 36.75 94.65 36.55 95.55 37.8 95.85 38.5 95.95 39.45 96.35 41.1 94 42.05 Z"/></g><g id="Layer0_17_FILL"><path fill="#808285" stroke="none" d="M 100.35 35Q 99.85 35.7 99.95 36.35L 99.95 42.55Q 99.75 43.5 100.85 44.1 101.25 44.2 101.35 44.2 101.95 44.2 102.35 43.8 102.85 43.2 102.75 42.55L 102.75 39.75Q 102.45 37.8 104.15 37.05 104.55 37.05 104.95 37.05 105.45 37.05 105.95 36.65 106.25 36.35 106.25 35.75 106.25 34.7 104.85 34.6 103.65 34.6 102.95 35.7 102.65 36.05 102.55 36.45L 102.55 36.25Q 102.75 35.6 101.85 34.8 101.65 34.7 101.25 34.7 100.65 34.7 100.35 35 Z"/></g><g id="Layer0_18_FILL"><path fill="#808285" stroke="none" d="M 106.05 39.45Q 105.75 43.5 110.95 44.3 112.55 44.3 113.85 43.4 114.65 42.95 114.65 42.25 114.55 41.2 113.45 41.1 113.05 41.1 112.65 41.4 112.45 41.55 112.35 41.75 112.05 42.05 110.95 42.15 110.55 42.35 109.45 41.55 108.95 40.9 108.85 40.1L 114.15 40.1Q 115.15 40.4 115.35 38.95 115.75 35.4 110.95 34.5 106.25 34.9 106.05 39.45M 112.45 37.2Q 112.75 37.7 112.75 38.2L 108.85 38.2Q 108.95 36.95 110.85 36.55 111.85 36.55 112.45 37.2 Z"/></g><g id="Layer0_19_FILL"><path fill="#808285" stroke="none" d="M 124.6 37.9Q 124.9 36.55 123.3 35.1 122.7 34.6 121.4 34.5 119.1 34.9 118.8 35.85 118.8 35.2 118 34.7 117.65 34.6 117.45 34.6 116.85 34.7 116.65 34.9 116.05 35.5 116.15 36.15L 116.15 42.55Q 115.95 43.5 117.05 44.1 117.15 44.1 117.55 44.1 118 44.1 118.4 43.7 118.8 43.2 118.8 42.55L 118.8 38.85Q 118.6 37.9 119.5 37.05 119.9 36.75 120.5 36.75 121.3 36.75 121.7 37.5 121.9 38 121.9 38.6L 121.9 42.55Q 121.8 43.1 122.3 43.7 122.6 44.1 123.3 44.1 124.1 44 124.3 43.7 124.7 43.1 124.6 42.45L 124.6 37.9 Z"/></g><g id="Layer0_20_FILL"><path fill="#808285" stroke="none" d="M 125.8 32.6Q 125.9 33.45 126.3 33.75 126.9 34.05 127.4 34.05 127.5 34.7 126.4 35.7 125.9 35.95 125.9 36.25 126 36.75 126.4 36.75 128.3 36.65 128.9 33.25 128.9 31.4 127.2 31.25 125.9 31.3 125.8 32.6 Z"/></g><g id="Layer0_21_FILL"><path fill="#808285" stroke="none" d="M 137.9 36.55Q 137.8 34.8 134.2 34.5 132.3 34.4 130.9 35.7 130.1 36.75 130.2 37.5 130.8 40.05 132.8 40.1 133.7 40.4 134.6 40.6 135.4 40.7 135.5 41.5 135.5 42.25 134.1 42.35 132.4 42.05 132.3 41.55 132 40.8 131.1 40.7 130 40.8 129.9 41.95 129.9 43.9 134.2 44.3 138.8 43.6 138.3 41.3 137.8 38.65 135.3 38.5 134.8 38.3 134.3 38.2 132.8 37.9 132.8 37.2 132.8 36.45 134.1 36.45 135.5 36.55 135.7 37.15 135.9 37.6 136.7 37.7 137.8 37.6 137.9 36.55 Z"/></g><g id="Layer0_22_FILL"><path fill="#808285" stroke="none" d="M 69.15 47.45Q 67.05 47.55 67.05 49.1L 66.05 52.8Q 65.35 55.4 64.85 57.45 64.05 53.45 63.75 52.6L 62.75 48.9Q 62.65 47.45 60.55 47.45 59.75 47.35 58.95 47.75 58.05 48.55 58.25 49.5L 58.25 58.7Q 57.95 59.95 59.55 60.45 61.25 59.95 60.95 58.7L 60.95 55.2Q 60.85 52.6 60.75 50.45 61.45 53.35 62.15 56.05L 63.05 59.05Q 63.15 60.25 64.85 60.45 66.75 60.25 66.75 59.05L 67.65 55.9Q 68.35 53.45 69.05 50.45 68.85 53.95 68.85 54.9L 68.85 58.7Q 68.55 59.95 70.25 60.45 71.8 59.95 71.5 58.7L 71.5 49.5Q 71.8 47.35 69.15 47.45 Z"/></g><g id="Layer0_23_FILL"><path fill="#808285" stroke="none" d="M 75.4 51.05Q 75.2 50.95 74.8 50.95 74.1 50.95 73.9 51.25 73.5 51.55 73.5 52.5L 73.5 58.7Q 73.3 59.65 74.3 60.35 74.5 60.45 74.9 60.35 75.4 60.45 75.9 59.85 76.2 59.35 76.2 58.7L 76.2 52.5Q 76.4 51.65 75.4 51.05M 74.9 47.35Q 73.6 47.45 73.5 48.75 73.6 49.9 74.9 50 76.1 49.9 76.2 48.75 76 47.45 74.9 47.35 Z"/></g><g id="Layer0_24_FILL"><path fill="#808285" stroke="none" d="M 83 50.85Q 81.8 50.85 81.1 51.9 80.8 52.3 80.7 52.7L 80.7 52.5Q 80.9 51.8 80 51.05 79.8 50.95 79.4 50.95 78.8 50.95 78.5 51.25 78 51.9 78.1 52.6L 78.1 58.8Q 77.9 59.75 79 60.35 79.4 60.45 79.5 60.45 80.1 60.45 80.5 60.05 81 59.45 80.9 58.8L 80.9 56Q 80.6 54.05 82.3 53.25 82.7 53.25 83.1 53.25 83.6 53.25 84.1 52.9 84.4 52.6 84.4 52 84.4 50.95 83 50.85 Z"/></g><g id="Layer0_25_FILL"><path fill="#808285" stroke="none" d="M 93.1 58.4L 93.1 54.55Q 93.4 53.1 92.1 51.65 91.4 50.85 89 50.75 84.7 51.15 85 52.8 85.1 53.85 86.2 53.95 87 53.75 87.2 53.45 87.4 52.8 88.8 52.8 89.8 52.6 90.3 53.55 90.4 54.25 89 54.35 86.2 54.7 85.4 55.3 84.9 55.5 84.4 56.35 84.2 56.75 84.2 57.5 84.3 60.35 87.5 60.45 88.8 60.5 90 59.75 90.3 59.55 90.5 59.25 90.6 60.15 91.8 60.35 93.4 59.95 93.1 58.4M 90.4 55.8L 90.4 57.25Q 90.3 57.6 89.3 58.2 88.6 58.5 88.2 58.4 87 58.4 86.9 57.45 87.2 56.25 88.7 56.15 90.2 55.9 90.4 55.8 Z"/></g><g id="Layer0_26_FILL"><path fill="#808285" stroke="none" d="M 101.45 54.25Q 102.55 54.25 102.65 53.1 102.75 52.4 101.95 51.7 100.55 50.65 98.95 50.75 94.55 50.65 94.1 55.7 94 60.15 98.85 60.5 102.75 59.95 102.75 58 102.55 56.75 101.45 56.75 100.55 56.85 100.35 57.5 100.25 58.2 98.95 58.3 96.55 57.9 96.85 55.7 97.05 53.25 97.85 53.15 98.35 52.9 98.85 52.9 100.05 53 100.25 53.55 100.45 53.75 100.65 53.95 100.85 54.25 101.45 54.25 Z"/></g><g id="Layer0_27_FILL"><path fill="#808285" stroke="none" d="M 104.45 47.75Q 103.95 48.35 104.05 49L 104.05 58.8Q 103.65 59.95 105.45 60.45 107.05 59.85 106.75 58.8L 106.75 49Q 106.95 48.15 105.95 47.55 105.55 47.45 105.35 47.45 104.85 47.45 104.45 47.75 Z"/></g><g id="Layer0_28_FILL"><path fill="#808285" stroke="none" d="M 112.85 60.5Q 114.45 60.5 115.75 59.65 116.55 59.05 116.55 58.5 116.45 57.45 115.35 57.35 114.95 57.35 114.55 57.6 114.35 57.8 114.25 58 113.95 58.3 112.85 58.4 112.45 58.6 111.35 57.8 110.85 57.05 110.75 56.35L 116.05 56.35Q 117.05 56.65 117.25 55.1 117.65 51.65 112.85 50.75 108.15 51.15 107.95 55.7 107.65 59.75 112.85 60.5M 114.35 53.45Q 114.65 53.95 114.65 54.45L 110.75 54.45Q 110.85 53.15 112.75 52.8 113.75 52.8 114.35 53.45 Z"/></g><g id="Layer0_29_FILL"><path fill="#808285" stroke="none" d="M 122.3 48.15Q 122 48.65 122.1 49.3L 122.1 58.6Q 122 59.35 122.5 60.05 122.6 60.25 123.5 60.35 125.2 59.85 124.8 58.5L 124.8 53.25Q 124.8 52.5 124.8 51.9L 129.1 58.95Q 129.6 60.35 130.9 60.35 133.1 59.95 132.7 58.6L 132.7 49.1Q 132.8 48.25 132 47.55 131.8 47.45 131.3 47.45 130.6 47.55 130.3 47.85 129.9 48.45 129.9 49.1L 129.9 54.15Q 129.9 54.55 130 54.9 130 55.3 130 55.7L 125.6 48.55Q 125.2 47.45 123.8 47.45 122.8 47.45 122.3 48.15 Z"/></g><g id="Layer0_30_FILL"><path fill="#808285" stroke="none" d="M 138.5 60.5Q 140.1 60.5 141.35 59.65 142.15 59.05 142.15 58.5 142.05 57.45 141 57.35 140.6 57.35 140.2 57.6 140 57.8 139.9 58 139.6 58.3 138.5 58.4 138.1 58.6 137 57.8 136.5 57.05 136.4 56.35L 141.65 56.35Q 142.65 56.65 142.85 55.1 143.25 51.65 138.5 50.75 133.8 51.15 133.6 55.7 133.3 59.75 138.5 60.5M 138.4 52.8Q 139.4 52.8 140 53.45 140.3 53.95 140.3 54.45L 136.4 54.45Q 136.5 53.15 138.4 52.8 Z"/></g><g id="Layer0_31_FILL"><path fill="#808285" stroke="none" d="M 146.25 48.15Q 146.05 48.05 145.75 48.05 144.85 48.25 144.75 48.45 144.35 49 144.45 49.7L 144.45 50.95Q 143.65 50.85 143.15 51.55 143.05 51.7 143.05 52 143.25 52.8 143.55 52.9 143.95 53 144.45 53L 144.45 57.9Q 143.85 59.95 146.95 60.45 148.55 60.6 148.95 59.25 149.05 58.5 148.05 58.3 147.05 58.5 147.15 57.45L 147.15 53Q 148.45 53.1 148.65 52.4 148.85 52.2 148.85 52 148.65 51.25 148.35 51.05 148.15 50.95 147.15 50.95L 147.15 49.7Q 147.25 48.75 146.25 48.15 Z"/></g><g id="Layer0_32_FILL"><path fill="#808285" stroke="none" d="M 162.25 52.8Q 162.35 52.5 162.35 52.2 162.25 51.05 160.95 50.95 159.65 51.25 159.75 52.1L 158.75 56Q 158.65 56.55 158.55 57.35 158.45 56.45 158.25 55.8L 157.35 52Q 157.45 51.15 155.85 50.95 154.35 51.15 154.35 52L 153.55 55.5Q 153.25 56.35 153.15 57.45 152.95 56.05 152.75 55.4L 151.95 52.2Q 151.95 51.25 150.65 50.95 149.45 50.95 149.35 52.1 149.35 52.5 149.45 53L 151.35 59.15Q 151.45 60.35 152.95 60.45 154.55 60.25 154.65 59.05L 155.45 56Q 155.75 54.8 155.85 53.75 155.95 54.8 156.35 56L 157.15 59.25Q 157.15 60.25 158.75 60.45 160.25 60.45 160.45 59.15L 162.25 52.8 Z"/></g><g id="Layer0_33_FILL"><path fill="#808285" stroke="none" d="M 171.1 52.2Q 169.6 50.75 167.5 50.75 162.75 51.05 162.45 55.6 162.35 59.85 167.3 60.45 171.9 60.25 172.3 55.6 172.2 53.35 171.1 52.2M 169.2 53.85Q 169.6 54.6 169.5 55.5 169.6 56.45 169.1 57.35 168.9 58 167.4 58.3 165.2 58.2 165.2 55.6 165 54.7 166 53.25 166.8 52.8 167.4 52.9 168 52.6 169.2 53.85 Z"/></g><g id="Layer0_34_FILL"><path fill="#808285" stroke="none" d="M 179.4 52.9Q 179.7 52.6 179.7 52 179.7 50.95 178.3 50.85 177.1 50.85 176.4 51.9 176.1 52.3 176 52.7L 176 52.5Q 176.2 51.8 175.3 51.05 175.1 50.95 174.7 50.95 174.1 50.95 173.8 51.25 173.3 51.9 173.4 52.6L 173.4 58.8Q 173.2 59.75 174.3 60.35 174.7 60.45 174.8 60.45 175.4 60.45 175.8 60.05 176.3 59.45 176.2 58.8L 176.2 56Q 175.9 54.05 177.6 53.25 178 53.25 178.4 53.25 178.9 53.25 179.4 52.9 Z"/></g><g id="Layer0_35_FILL"><path fill="#808285" stroke="none" d="M 182.8 49Q 182.9 48.25 182.1 47.55 181.8 47.45 181.5 47.45 180.8 47.45 180.5 47.85 180 48.35 180.1 49L 180.1 58.8Q 179.9 59.75 181 60.25 181.3 60.45 181.5 60.35 182.4 60.45 182.7 59.45 182.8 59.15 182.8 58.8L 182.8 57.35 183.7 56.45 185.5 59.35Q 185.8 60.25 186.8 60.35 187.95 60.35 188.25 59.05 188.15 58.4 187.8 57.9L 185.6 54.7 187.4 53.1Q 187.9 52.8 187.95 52.1 187.9 51.05 186.8 50.95 186 50.95 185.6 51.55L 182.8 54.55 182.8 49 Z"/></g><g id="Layer0_36_FILL"><path fill="#808285" stroke="none" d="M 68.45 64.7Q 68.65 64 67.55 63.8 66.85 63.9 66.85 64.2 66.75 64.4 66.75 64.7L 66.75 69.4 59.95 69.4 59.95 64.7Q 60.05 64.2 59.55 63.9 59.35 63.8 59.15 63.8 58.05 64 58.25 64.7L 58.25 75.8Q 58.15 76.3 58.65 76.55 58.85 76.65 59.05 76.65 60.15 76.45 59.95 75.8L 59.95 70.85 66.75 70.85 66.75 75.8Q 66.55 76.45 67.55 76.65 68.25 76.55 68.35 76.3 68.45 76.1 68.45 75.8L 68.45 64.7 Z"/></g><g id="Layer0_37_FILL"><path fill="#808285" stroke="none" d="M 70.85 68.45Q 69.55 70.5 69.75 71.95 69.45 73.3 70.95 75.5 72.6 76.95 74.2 76.75 75.8 76.95 77.6 75.4 79.1 73.3 78.9 71.85 78.6 67.2 74.3 67.1 72.9 66.8 70.85 68.45M 74.3 68.45Q 77.4 68.95 77.1 71.95 77.2 73 76.4 74.45 75.6 75.4 74.3 75.4 72.7 75.3 72.1 74.55 71.4 73.5 71.4 71.95 71.4 70.6 72.1 69.5 73.3 68.25 74.3 68.45 Z"/></g><g id="Layer0_38_FILL"><path fill="#808285" stroke="none" d="M 84.1 71.15L 83 70.85Q 81.6 70.65 81.5 69.5 81.5 68.95 82 68.65 82.6 68.25 83.1 68.35 85.1 68.65 85.2 69.5 85.5 70.3 86 70.2 86.6 70.3 86.8 69.5 87.3 68.05 83.1 67.1 79.1 68.05 79.8 69.8 80.3 72.05 82.4 72.3L 83.4 72.6Q 85 72.8 85.2 74.05 85.1 75.4 83.3 75.4 82.1 75.5 81.3 74.55 81.2 74.45 80.9 73.55 80.9 73.3 80.3 73.2 79.6 73.1 79.4 73.95 79.3 74.65 80.4 75.9 82.1 76.85 83.2 76.75 84.6 76.75 85.7 76.1 86.7 75.6 86.9 73.85 86.3 71.25 84.1 71.15 Z"/></g><g id="Layer0_39_FILL"><path fill="#808285" stroke="none" d="M 89.1 67.2Q 88 67.4 88.2 67.95L 88.2 79.2Q 88.1 79.65 88.6 79.95 88.8 80.05 89.1 80.05 90.1 79.75 89.9 79.2L 89.9 75.5Q 90.9 76.55 93 76.75 97.05 76 96.85 71.95 96.55 67.2 92.8 67.1 91 67.1 89.9 68.35 90 67.6 89.5 67.3 89.2 67.2 89.1 67.2M 89.9 71.85Q 89.9 68.65 92.6 68.45 95.65 69.5 95.05 71.95 95.15 73.3 94.5 74.45 94 75.3 92.5 75.4 89.9 75.1 89.9 71.85 Z"/></g><g id="Layer0_40_FILL"><path fill="#808285" stroke="none" d="M 100.05 64.85Q 99.95 63.8 98.95 63.8 98.05 63.8 97.95 64.85 97.95 65.75 98.95 65.85 99.95 65.75 100.05 64.85M 99.85 67.95Q 100.05 67.4 98.95 67.2 98.05 67.4 98.15 67.95L 98.15 75.9Q 98.15 76.55 99.05 76.65 99.65 76.55 99.75 76.3 99.85 76.1 99.85 75.9L 99.85 67.95 Z"/></g><g id="Layer0_41_FILL"><path fill="#808285" stroke="none" d="M 102.85 67.3L 101.85 67.3Q 101.35 67.1 101.15 67.95 101.35 68.75 101.85 68.65L 102.85 68.65 102.85 73.85Q 102.15 76.3 105.45 76.65 106.35 76.75 106.45 75.9 106.35 75.1 105.55 75.2 104.85 75.3 104.65 74.65 104.55 74.55 104.55 73.2L 104.55 68.65 105.65 68.65Q 106.15 68.75 106.35 67.95 106.25 67.1 105.65 67.3L 104.55 67.3 104.55 65.15Q 104.75 64.6 103.65 64.4 102.65 64.6 102.85 65.15L 102.85 67.3 Z"/></g><g id="Layer0_42_FILL"><path fill="#808285" stroke="none" d="M 108.45 70.3Q 109.25 70.1 109.25 69.7 109.15 68.65 111.25 68.45 112.45 68.05 113.15 69.9 113.25 70.6 112.65 70.65 112.45 70.65 111.55 70.85L 109.95 71.25Q 107.85 71.05 107.15 73.85 107.25 76.55 110.25 76.75 111.65 76.85 113.25 75.4 113.25 76.2 113.35 76.3 113.45 76.65 114.05 76.65 114.85 76.45 114.75 75.9L 114.75 70.6Q 114.95 69.2 114.15 68.05 112.95 67 111.25 67.1 109.15 67 107.95 68.55 107.65 68.95 107.55 69.5 107.45 70.1 108.45 70.3M 110.05 72.5Q 110.45 72.4 110.95 72.3L 111.95 72.1Q 112.85 71.95 113.15 71.75 113.25 73.5 112.65 74.45 112.25 75.1 110.65 75.4 109.05 75.4 108.95 73.85 109.25 72.5 110.05 72.5 Z"/></g><g id="Layer0_43_FILL"><path fill="#808285" stroke="none" d="M 117.55 76.65Q 118.5 76.4 118.3 75.9L 118.3 64.6Q 118.4 64 117.55 63.8 116.55 64 116.65 64.6L 116.65 75.9Q 116.75 76.65 117.55 76.65 Z"/></g><g id="Layer0_44_FILL"><path fill="#808285" stroke="none" d="M 119.8 73.95Q 119.7 74.65 120.8 75.9 122.5 76.85 123.6 76.75 125 76.75 126.1 76.1 127.1 75.6 127.3 73.85 126.7 71.25 124.5 71.15L 123.4 70.85Q 122 70.65 121.9 69.5 121.9 68.95 122.4 68.65 123 68.25 123.5 68.35 125.5 68.65 125.6 69.5 125.9 70.3 126.4 70.2 127 70.3 127.2 69.5 127.7 68.05 123.5 67.1 119.5 68.05 120.2 69.8 120.7 72.05 122.8 72.3L 123.8 72.6Q 125.4 72.8 125.6 74.05 125.5 75.4 123.7 75.4 122.5 75.5 121.7 74.55 121.6 74.45 121.3 73.55 121.3 73.3 120.7 73.2 120 73.1 119.8 73.95 Z"/></g><g id="Layer0_45_FILL"><path fill="#808285" stroke="none" d="M 129.4 67.85Q 130.8 67.7 131 66.3 130.8 64.95 129.4 64.85 128 64.95 127.9 66.3 128 67.7 129.4 67.85M 129.4 65.05Q 130.6 65.15 130.8 66.3 130.7 67.6 129.4 67.7 128.2 67.6 128.1 66.3 128.2 65.15 129.4 65.05M 128.7 65.75L 128.7 67.1Q 128.7 67.3 129 67.3 129.2 67.3 129.2 67.1L 129.2 66.6 129.4 66.6Q 129.6 66.5 129.7 66.9L 129.7 67.1Q 129.8 67.3 130 67.3 130.2 67.3 130.2 67.2 130.2 67.1 130.2 67L 130.1 66.8Q 130 66.5 129.8 66.4 130.2 66.3 130.2 65.95 130.3 65.45 129.5 65.45L 129.1 65.45Q 128.7 65.35 128.7 65.75M 129.4 66.25L 129.2 66.25 129.2 65.75 129.4 65.75Q 129.8 65.75 129.8 66.05 129.8 66.25 129.4 66.25 Z"/></g></defs><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_0_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_1_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_2_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_3_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_4_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_5_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_6_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_7_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_8_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_9_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_10_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_11_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_12_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_13_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_14_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_15_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_16_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_17_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_18_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_19_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_20_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_21_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_22_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_23_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_24_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_25_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_26_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_27_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_28_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_29_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_30_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_31_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_32_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_33_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_34_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_35_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_36_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_37_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_38_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_39_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_40_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_41_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_42_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_43_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_44_FILL"/></g><g transform="matrix( 1, 0, 0, 1, 0,0) "><use xlink:href="#Layer0_45_FILL"/></g></svg>';