/*!
 * @license Extra Life Helper
 * Visit https://github.com/breadweb/extralifehelper for documentation, updates and examples.
 *
 * Copyright (c) 2013-2021 Adam "Bread" Slesinger http://www.breadweb.net
 *
 * Distributed under the terms of the MIT license.
 * https://github.com/breadweb/extralife-helper/blob/main/LICENSE.txt
 *
 * This notice shall be included in all copies or substantial portions of the Software.
*/

const IS_DEBUG = false;
const IS_1877_ENABLED = true;
const WIDTH_ORIGINAL = 264;
const HEIGHT_ORIGINAL = 110;
const ANCHOR_POINT = { x: 1, y: 1 };    // Point to start drawing which avoids clipping of stroke
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
const KEY_SUM_DONATIONS = "sumDonations";
const KEY_SUM_PLEDGES = "sumPledges";
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
const THEMES = ["blue1", "blue2", "gray1", "white1"];
const BORDERS = ["none", "rounded", "square"];
const VOICES = ["US-male", "US-female", "UK-male", "UK-female", "FR-male", "FR-female", "ES-male", "ES-female"];
const ITEMS_TO_LOAD = 5;
const STRINGS = {
    "en-us": {
        TEXT_DAYS_UNTIL: "DAYS UNTIL EXTRA LIFE:",
        TEXT_HOURS_UNTIL: "TIME UNTIL EXTRA LIFE:",
        TEXT_EXTRA_LIFE: "PLAYING GAMES TO HEAL KIDS!",
        TEXT_MY_AMOUNT_RAISED: "MY AMOUNT RAISED:",
        TEXT_OUR_AMOUNT_RAISED: "OUR AMOUNT RAISED:",
        TEXT_HOURS_PLAYED: "TOTAL TIME PLAYED:",
        TEXT_ANONYMOUS: "Anonymous"
    },
    "fr-ca": {
        TEXT_DAYS_UNTIL: "NOMBRE DE JOURS JUSQU'\xC0 EXTRA LIFE:",
        TEXT_HOURS_UNTIL: "NOMBRE D’HEURES JUSQU'\xC0 EXTRA LIFE:",
        TEXT_EXTRA_LIFE: "JOUER \xC0 DES JEUX POUR SOIGNER LES ENFANTS!",
        TEXT_MY_AMOUNT_RAISED: "LE MONTANT QUE J'AI AMASS\xC9:",
        TEXT_OUR_AMOUNT_RAISED: "LE MONTANT TOTAL AMASS\xC9:",
        TEXT_HOURS_PLAYED: "NOMBRE D'HEURES JOU\xC9ES:",
        TEXT_ANONYMOUS: "Anonyme"
    },
    "es-419": {
        TEXT_DAYS_UNTIL: "D\xCDAS HASTA EXTRA LIFE:",
        TEXT_HOURS_UNTIL: "HORAS HASTA EXTRA LIFE:",
        TEXT_EXTRA_LIFE: "JUGANDO JUEGOS PARA SANAR NI\xD1OS!",
        TEXT_MY_AMOUNT_RAISED: "MI CANTIDAD RECAUDADA:",
        TEXT_OUR_AMOUNT_RAISED: "NUESTRA CANTIDAD RECAUDADA:",
        TEXT_HOURS_PLAYED: "TIEMPO TOTAL JUGADO:",
        TEXT_ANONYMOUS: "A\xF3nimo"
    }
}

var strings;
var participantId;
var teamId;
var startDate;
var startTime;
var helperTheme;
var helperBorder;
var helperWidth;
var showDonationAlerts;
var showGoal;
var showYearMode;
var donationSounds;
var donationMessageVoice;
var testDonationSeconds;
var volume;
var participantInfoUrl;
var donorInfoUrl;
var teamInfoUrl;
var teamRosterUrl;
var teamDonorInfoUrl;
var backgroundRect;
var helperHeight;
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
var lang;
var soundObjects;
var sound1877Object;
var newDonors;
var lastRaised;
var shownDonors;
var extraLifeLogoItem;
var logoCounter;
var selectedVoice;
var loadRemoteScripts = false;
var itemsLoaded = 0;

document.addEventListener('DOMContentLoaded', onReady, false);

function onReady() {
    // When running from the file system, a start date and time in
    // a human-friendly format will be provided and they need to be
    // converted to a timestamp.
    if (startDate && startTime)
    {
        let dateParts = startDate.split("-");
        let timeParts = startTime.split(":");
        dateTimeStart = new Date(
            parseInt(dateParts[2]),
            parseInt(dateParts[0]) - 1,
            parseInt(dateParts[1]),
            parseInt(timeParts[0]),
            parseInt(timeParts[1]),
            parseInt(timeParts[2])).getTime();
    }

    // If running from a remote webserver, settings will be provided
    // in the querystring.
    parseSettings();

    // No matter how settings were provided, they need to be valid.
    if (!validateSettings()) {
        return;
    }

    // Customize the URLs with the provided participant or team IDs.
    participantInfoUrl = PARTICIPANT_INFO_URL.replace("{1}", participantId);
    donorInfoUrl = DONOR_INFO_URL.replace("{1}", participantId);
    teamInfoUrl = TEAM_INFO_URL.replace("{1}", teamId);
    teamRosterUrl = TEAM_ROSTER_URL.replace("{1}", teamId);
    teamDonorInfoUrl = TEAM_DONOR_INFO_URL.replace("{1}", teamId);

    // Set the strings based on selected language.
    strings = STRINGS[lang];

    // Initialize some variables.
    newDonors = [];
    lastRaised = 0;
    logoCounter = 0;

    // Load all script and asset dependencies.
    loadItems();
}

function parseSettings() {
    const urlParms = new URLSearchParams(window.location.search);
    if (urlParms.get("r") == "1") {
        loadRemoteScripts = true;
        // TODO: After adding support for specifying custom sounds when
        // running remote, parse the sound parameter instead of hardcoding
        // these defaults.
        donationSounds = "cash.mp3,kids.mp3";
    }
    if (urlParms.has("pid")) {
        participantId = urlParms.get("pid");
    }
    if (urlParms.has("tid")) {
        teamId = urlParms.get("tid");
    }
    if (urlParms.has("st")) {
        dateTimeStart = urlParms.get("st");
    }
    let index;
    if (urlParms.has("t")) {
        index = urlParms.get("t");
        if (index > -1 && index < THEMES.length) {
            helperTheme = THEMES[index];
        }
    }
    if (urlParms.has("b")) {
        index = urlParms.get("b");
        if (index > -1 && index < BORDERS.length) {
            helperBorder = BORDERS[index];
        }
    }
    if (urlParms.has("v")) {
        index = urlParms.get("v");
        if (index > -1 && index < VOICES.length) {
            donationMessageVoice = VOICES[index];
        }
    }
    if (urlParms.has("w")) {
        helperWidth = parseInt(urlParms.get("w"));
    }
    if (urlParms.has("g")) {
        showGoal = urlParms.get("g") == "1";
    }
    if (urlParms.has("a")) {
        showDonationAlerts = urlParms.get("a") == "1";
    }
    if (urlParms.has("y")) {
        showYearMode = urlParms.get("y") == "1";
    }
    if (urlParms.has("td")) {
        testDonationSeconds = parseInt(urlParms.get("td"));
    }
    if (urlParms.has("vo")) {
        volume = parseInt(urlParms.get("vo"));
    }
    if (urlParms.has("l")) {
        lang = urlParms.get("l");
    } else {
        if (!lang) {
            lang = "en-us";
        }
    }
}

function validateSettings() {
    let message;
    if (isNaN(testDonationSeconds)) {
        message = "Invalid value for test donation seconds.";
    }
    if (isNaN(volume)) {
        message = "Invalid value for volume.";
    }
    if (!helperTheme) {
        message = "A theme was not specified.";
    }
    if (!helperBorder) {
        message = "A border style was not specified.";
    }
    if (!helperWidth || isNaN(helperWidth)) {
        message = "Invalid or missing width value.";
    }
    if (!participantId && !teamId) {
        message = "A participant or team ID was not found.";
    }
    if (participantId && teamId) {
        message = "A participant ID or team ID must be specified, but not both.";
    }
    if (!dateTimeStart || isNaN(dateTimeStart)) {
        message = "The start date or start time is missing or invalid.";
    }
    if (lang != "en-us" && lang != "fr-ca" && lang != "es-419") {
        message = "The selected language is missing or not supported.";
    }
    if (message) {
        document.body.innerHTML = `<div class='error'>${message}<br /><br />Please visit
        <a href="https://discord.gg/aArewEc">https://discord.gg/aArewEc</a> if you need
        support.</div>`;
        return false;
    }
    return true;
}

function loadItems() {
    if (loadRemoteScripts) {
        var scripts = [
            "https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.12.0/paper-core.min.js",
            "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js",
            "https://cdnjs.cloudflare.com/ajax/libs/tweenjs/1.0.2/tweenjs.min.js",
            "https://code.responsivevoice.org/responsivevoice.js?key=yZGVduQT"
        ];
    } else {
        var scripts = [
            "js/paper-core.min.js",
            "js/jquery.min.js",
            "js/tweenjs.min.js",
            "js/responsivevoice.js?key=yZGVduQT"
        ];
    }

    for (let i = 0; i < scripts.length; i++) {
        var element = document.createElement("script");
        element.type = "text/javascript";
        element.src = scripts[i];
        element.onload = onItemsLoaded;
        document.head.append(element);
    }

    document.fonts.ready.then(function() {
        onItemsLoaded();
    });
}

function onItemsLoaded() {
    itemsLoaded++;
    if (itemsLoaded >= ITEMS_TO_LOAD) {
        initHelper();
    }
}

function initHelper() {
    initSound();
    initPage();
    initPaper();
    initScreen();

    if (IS_DEBUG) {
        // participantInfoUrl = "http://localhost:8888/participant.txt";
        // donorInfoUrl = "http://localhost:8888/donations.txt";
        // teamInfoUrl = "http://localhost:8888/team.txt";
        // teamDonorInfoUrl = "http://localhost:8888/teamDonations.txt";

        // CLOCK_TIMER_INTERVAL = 1000;
        // ACTION_TIMER_INTERVAL = 10000;
        // DONOR_TIMER_INTERVAL = 10000;

        // Use this to set states and change views for faster testing
        // of new features and fixes.
        paper.project.activeLayer.onMouseDown = function (event) {
            // Show the logos immediately.
            logoCounter = LOGO_PLAY_MARK - 1;
            onActionTimer();
        }
    }

    // A small delay helps prevent the jarring visual of the fonts loading
    // in over the temporary fonts in the first screen.
    window.setTimeout(startHelper, 100);
}

function startHelper() {
    startTimer("action");
    startTimer("clock");

    if (testDonationSeconds != 0) {
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
            if (showYearMode !== true) {
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
        soundObjects[i].volume = volume / 100;
    }
    // Special case for Extra-Life-A-Thon.
    if (IS_1877_ENABLED) {
        sound1877Object = new Audio("audio/1877.mp3");
        sound1877Object.volume = volume / 100;
    }

    // Initialize text-to-speech.
    var mapping =
    {
        "US-male": "US English Male",
        "US-female": "US English Female",
        "UK-male": "UK English Male",
        "UK-female": "UK English Female",
        "FR-male" : "French Canadian Male",
        "FR-female" : "French Canadian Female",
        "ES-male" : "Spanish Latin American Male",
        "ES-female" : "Spanish Latin American Female",
    };
    if (donationMessageVoice in mapping) {
        selectedVoice = mapping[donationMessageVoice];
    }
}

function initPage() {
    // Determine how much we should scale up or down. Use that scale to change
    // the width and height.
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
    // Set up background used for all display groups and apply different style
    // properties based on user settings.

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
        content: showYearMode === true ? strings["TEXT_EXTRA_LIFE"] : strings["TEXT_DAYS_UNTIL"],
        fontFamily: lang == "en-us" ? "Furore" : "SourceSansPro-Bold",
        fontSize: 12,
        justification: 'center'
    });

    daysText = new paper.PointText({
        point: [centerX, 60],
        content: showYearMode === true ? new Date().getFullYear() : '0',
        fontFamily: "LetsGoDigital",
        fontSize: 50,
        justification: 'center'
    });

    // The clock face is set up with individual text items in order to
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
        content: participantId ? strings["TEXT_MY_AMOUNT_RAISED"] : strings["TEXT_OUR_AMOUNT_RAISED"],
        fontFamily: lang == "en-us" ? "Furore" : "SourceSansPro-Bold",
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
        content: strings["TEXT_ANONYMOUS"],
        fontFamily: lang == "en-us" ? "Furore" : "SourceSansPro-Bold",
        fontSize: DONOR_NAME_FONT_SIZE,
        justification: 'center'
    });

    donorMessageText1 = new paper.PointText({
        point: [centerX, 76],
        content: "[Message]",
        fontFamily: "Nunito-Regular",
        fontSize: 12,
        justification: 'center'
    });

    donorMessageText2 = new paper.PointText({
        point: [centerX, 88],
        content: "[Message]",
        fontFamily: "Nunito-Regular",
        fontSize: 12,
        justification: 'center'
    });

    donorGroup = new paper.Group();
    donorGroup.addChild(donorAmountText);
    donorGroup.addChild(donorNameText);
    donorGroup.addChild(donorMessageText1);
    donorGroup.addChild(donorMessageText2);
    donorGroup.visible = false;

    // Setup the animating logo.

    paper.project.importSVG(extraLifeLogo, function (item) {
        extraLifeLogoItem = item;
        extraLifeLogoItem.position = [200, 82];
        extraLifeLogoItem.scale(0.65, [0, 0]);
        extraLifeLogoItem.opacity = 0;
    });

    logoGroup = new paper.Group();
    logoGroup.addChild(extraLifeLogoItem);
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
    var timeDiff = new Date().getTime() - dateTimeStart;
    var isCountingUp;

    // If the difference is negative, the start time hasn't been hit or passed yet
    // and the difference is the amount of time left until the start time. Otherwise,
    // the difference is the amount of time played.
    if (timeDiff < 0) {
        timeDiff = timeDiff * -1;
        titleText.content = strings["TEXT_HOURS_UNTIL"];
        isCountingUp = false;
    } else {
        titleText.content = strings["TEXT_HOURS_PLAYED"];
        isCountingUp = true;
    }

    var days = Math.floor(timeDiff / 86400000);

    // If there are three or more days left, the text will be updated to show how many
    // days are left before the start time. Otherwise, we will show how the time which
    // could be counting down or up.
    if (days > 3 && !isCountingUp) {
        titleText.content = strings["TEXT_DAYS_UNTIL"];
        daysText.content = days;
        daysText.visible = true;
        clockGroup.visible = false;
    } else {
        var hours = Math.floor(timeDiff / 3600000);
        timeDiff -= hours * 3600000;
        var minutes = Math.floor(timeDiff / 60000);
        timeDiff -= minutes * 60000;
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
    console.log(logoCounter, LOGO_PLAY_MARK);
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
        ? strings["TEXT_ANONYMOUS"]
        : donorName;

    updateDonorGroup(donorMessage);

    infoGroup.visible = false;
    donorGroup.visible = true;
    logoGroup.visible = false;

    const is1877 = 
        IS_1877_ENABLED && 
        (donorAmount == 18.77 || donorAmount == 187.70 || donorAmount == 1877.00 || donorAmount == 18770.00)

    playSounds(is1877);

    if (selectedVoice) {
        setTimeout(function () {
            speakText(donorMessage);
        }, 5000);
    }

    // Call the function that participants can use to run their own code when
    // a new donation arrives.
    if (typeof onNewDonation === "function") {
        onNewDonation(donorName, donorAmount, donorMessage, donorAvatar, donorCreatedOn);
    }
}

function updateDonorGroup(message) {
    // Reset scaling first before making changes. There is a better
    // way of doing this but this works for now.
    setScale(infoGroup, 1 / helperScale, "topLeft");
    setScale(donorGroup, 1 / helperScale, "topLeft");

    var isVisible = true;
    var donorAmountPointY = DONOR_AMOUNT_POINT_Y;
    var donorAmountFontSize = DONOR_AMOUNT_FONT_SIZE;
    var donorNamePointY = DONOR_NAME_POINT_Y;
    var donorNameFontSize = DONOR_NAME_FONT_SIZE;

    donorMessageText1.content = "";
    donorMessageText2.content = "";

    // If there is a message, add it. Otherwise, we'll scale the
    // donor amount and name so it is bigger and fills the area more.
    if (message) {
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
            } else if (totalChars > maxCharsPerLine) {
                donorMessageText2.content += " " + word;
            } else {
                donorMessageText1.content += " " + word;
            }
            totalChars += word.length;
        }
    } else {
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
    var raised = res[KEY_SUM_DONATIONS] + (res[KEY_SUM_PLEDGES] || 0);
    var goal = res[KEY_FUNDRAISING_GOAL];

    moneyText.content = formatMoney(raised, false);

    if (showGoal === true) {
        moneyText.content += " / " + formatMoney(goal, false);
    }

    // If the amount raised is more than the last recorded value, then one or
    // more donations have come in since the last time general info was polled.
    // This is always true at startup, but the processing of donations will
    // ensure we don't treat all donations as new the first time.
    if (raised > lastRaised) {
        if (showDonationAlerts === true) {
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

function playSounds(is1877) {
    if (IS_1877_ENABLED && is1877) {
        sound1877Object.load();
        sound1877Object.play()
           .then(result => {})
           .catch(error => {});        
    } else {
        for (i = 0; i < soundObjects.length; i++) {
            soundObject = soundObjects[i];
            soundObject.load();
            soundObject.play()
            .then(result => {})
            .catch(error => {});
        }
    }
}

function speakText(text) {
    responsiveVoice.speak(text, selectedVoice, {volume: volume / 100});
}

function setScale(group, amount, anchorPoint) {
    var xPos = anchorPoint == "topCenter"
        ? group.bounds.topLeft.x + group.bounds.width / 2
        : 0; // "topLeft"

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

// Extra Life vector logo.
const extraLifeLogo = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 370.12 188.65" style="enable-background:new 0 0 370.12 188.65;" xml:space="preserve"><style type="text/css">.st0{fill:#FFFFFF;}</style><g><path class="st0" d="M96.73,110.15c2.55-1.47,4.15-3.72,4.6-5.8l9.93-0.02c-0.61,5.98-3.95,10.81-9.85,14.22 c-10.62,6.13-21.34,2.79-26.68-6.47c-5.34-9.26-2.76-20.28,7.06-25.94c9.07-5.24,19.83-2.09,25.25,7.29 c0.75,1.3,1.35,2.62,1.78,3.94L86.76,110.1C89.81,112.65,93.31,112.12,96.73,110.15z M95.92,95.54c-3.07-3.03-6.62-2.72-9.42-1.11 c-3.54,2.04-4.9,5.15-3.94,8.82L95.92,95.54z"/><path class="st0" d="M133.01,120.69l-6.67-9.47l-6.67,9.47h-12.34l12.84-18.22l-12.41-17.65h12.34l6.24,8.9l6.24-8.9h12.34 l-12.41,17.65l12.84,18.22H133.01z"/><path class="st0" d="M165.47,95.15V84.81h-7.39V74.77L147.32,78v29.85c0,10.04,4.09,14.28,18.15,12.84v-9.76 c-4.74,0.29-7.39,0-7.39-3.08v-12.7H165.47z"/><path class="st0" d="M192.38,84.1v12.2c-4.45-0.72-10.76,1.08-10.76,8.18v16.21h-10.76V84.81h10.76v6.39 C183.05,86.39,187.86,84.1,192.38,84.1z"/><path class="st0" d="M232.29,84.81v35.87h-10.76v-3.37c-2.37,2.73-5.88,4.38-10.69,4.38c-9.4,0-17.15-8.25-17.15-18.94 c0-10.69,7.75-18.94,17.15-18.94c4.81,0,8.32,1.65,10.69,4.38v-3.37H232.29z M221.53,102.75c0-5.38-3.59-8.75-8.54-8.75 c-4.95,0-8.54,3.37-8.54,8.75c0,5.38,3.59,8.75,8.54,8.75C217.94,111.5,221.53,108.13,221.53,102.75z"/><path class="st0" d="M244.29,68.31h10.76v52.37h-10.76V68.31z"/><path class="st0" d="M259.36,75.2c0-3.52,2.94-6.46,6.46-6.46c3.52,0,6.46,2.94,6.46,6.46c0,3.52-2.94,6.46-6.46,6.46 C262.3,81.66,259.36,78.72,259.36,75.2z M260.43,84.81h10.76v35.87h-10.76V84.81z"/><path class="st0" d="M294.01,79.79V69.46c-11.91-0.72-17.43,5.31-17.43,15.35v35.87h10.76V95.15h6.67V84.81h-6.67 C287.34,80.65,289.99,79.43,294.01,79.79z"/><path class="st0" d="M319.58,110.15c2.55-1.47,4.15-3.72,4.6-5.8l9.93-0.02c-0.6,5.98-3.95,10.81-9.85,14.22 c-10.62,6.13-21.34,2.79-26.68-6.47c-5.34-9.26-2.76-20.28,7.06-25.94c9.07-5.24,19.83-2.09,25.25,7.29 c0.75,1.3,1.35,2.62,1.78,3.94l-22.06,12.73C312.66,112.65,316.17,112.12,319.58,110.15z M318.77,95.54 c-3.07-3.03-6.62-2.72-9.42-1.11c-3.54,2.04-4.9,5.15-3.94,8.82L318.77,95.54z"/></g><g><path class="st0" d="M78.35,132.74v5.86h-0.77v-1.15c-0.49,0.79-1.32,1.29-2.37,1.29c-1.65,0-3.02-1.34-3.02-3.07 s1.37-3.07,3.02-3.07c1.04,0,1.88,0.5,2.37,1.29v-1.15H78.35z M77.57,135.67c0-1.3-1.01-2.32-2.31-2.32s-2.31,1.02-2.31,2.32 s1.01,2.32,2.31,2.32S77.57,136.97,77.57,135.67z"/><path class="st0" d="M89.08,135.67c0,1.73-1.37,3.07-3.02,3.07c-1.04,0-1.88-0.5-2.37-1.29v3.49h-0.77v-8.2h0.77v1.15 c0.49-0.79,1.32-1.29,2.37-1.29C87.71,132.6,89.08,133.94,89.08,135.67z M88.31,135.67c0-1.3-1.01-2.32-2.31-2.32 s-2.31,1.02-2.31,2.32s1.01,2.32,2.31,2.32S88.31,136.97,88.31,135.67z"/><path class="st0" d="M92.99,132.65v0.75c-0.94,0-1.85,0.49-1.85,1.95v3.26h-0.77v-5.86h0.77v0.97 C91.55,132.89,92.24,132.65,92.99,132.65z"/><path class="st0" d="M93.35,135.67c0-1.73,1.37-3.07,3.08-3.07s3.08,1.34,3.08,3.07s-1.37,3.07-3.08,3.07 S93.35,137.41,93.35,135.67z M98.74,135.67c0-1.3-1.01-2.32-2.31-2.32s-2.31,1.02-2.31,2.32s1.01,2.32,2.31,2.32 S98.74,136.97,98.74,135.67z"/><path class="st0" d="M106.61,132.74v5.62c0,1.78-1.43,2.72-2.94,2.72c-1.35,0-2.32-0.52-2.78-1.43l0.68-0.39 c0.29,0.6,0.83,1.07,2.1,1.07c1.36,0,2.17-0.77,2.17-1.97v-0.91c-0.49,0.79-1.32,1.29-2.37,1.29c-1.65,0-3.02-1.34-3.02-3.07 s1.37-3.07,3.02-3.07c1.04,0,1.88,0.5,2.37,1.29v-1.15H106.61z M105.84,135.67c0-1.3-1.01-2.32-2.31-2.32s-2.31,1.02-2.31,2.32 s1.01,2.32,2.31,2.32S105.84,136.97,105.84,135.67z"/><path class="st0" d="M110.88,132.65v0.75c-0.94,0-1.85,0.49-1.85,1.95v3.26h-0.77v-5.86h0.77v0.97 C109.43,132.89,110.13,132.65,110.88,132.65z"/><path class="st0" d="M117.39,132.74v5.86h-0.77v-1.15c-0.49,0.79-1.32,1.29-2.37,1.29c-1.65,0-3.02-1.34-3.02-3.07 s1.37-3.07,3.02-3.07c1.04,0,1.88,0.5,2.37,1.29v-1.15H117.39z M116.62,135.67c0-1.3-1.01-2.32-2.31-2.32s-2.31,1.02-2.31,2.32 s1.01,2.32,2.31,2.32S116.62,136.97,116.62,135.67z"/><path class="st0" d="M127.47,134.95v3.66h-0.77v-3.66c0-1.04-0.6-1.59-1.43-1.59c-0.9,0-1.63,0.55-1.63,2v3.25h-0.77v-3.66 c0-1.04-0.54-1.59-1.37-1.59c-0.84,0-1.69,0.55-1.69,2v3.25h-0.77v-5.86h0.77v0.86c0.46-0.71,1.09-1,1.79-1 c0.82,0,1.45,0.39,1.78,1.07c0.43-0.73,1.15-1.07,1.9-1.07C126.57,132.6,127.47,133.48,127.47,134.95z"/><path class="st0" d="M131.55,135.67c0-1.73,1.37-3.07,3.08-3.07s3.08,1.34,3.08,3.07s-1.37,3.07-3.08,3.07 S131.55,137.41,131.55,135.67z M136.94,135.67c0-1.3-1.01-2.32-2.31-2.32s-2.31,1.02-2.31,2.32s1.01,2.32,2.31,2.32 S136.94,136.97,136.94,135.67z"/><path class="st0" d="M140.01,132.51v0.23h1.69v0.75h-1.69v5.11h-0.77v-5.11h-1v-0.75h1v-0.23c0-1.52,0.88-2.37,2.46-2.25v0.75 C140.56,130.91,140.01,131.38,140.01,132.51z"/><path class="st0" d="M72.06,148.47c0-2.41,1.79-4.27,4.27-4.27c1.49,0,2.8,0.74,3.52,1.9l-1.62,0.94c-0.36-0.63-1.07-1.01-1.9-1.01 c-1.45,0-2.39,0.97-2.39,2.44s0.94,2.44,2.39,2.44c0.83,0,1.55-0.38,1.9-1.01l1.62,0.94c-0.7,1.16-2.02,1.9-3.52,1.9 C73.86,152.73,72.06,150.88,72.06,148.47z"/><path class="st0" d="M86.41,148.97v3.6h-1.76v-3.34c0-0.73-0.46-1.07-1.02-1.07c-0.64,0-1.09,0.38-1.09,1.21v3.2h-1.76v-8.2h1.76 v2.89c0.32-0.43,0.9-0.71,1.68-0.71C85.4,146.54,86.41,147.39,86.41,148.97z"/><path class="st0" d="M87.44,145.14c0-0.57,0.48-1.05,1.05-1.05s1.05,0.48,1.05,1.05s-0.48,1.05-1.05,1.05 S87.44,145.71,87.44,145.14z M87.61,146.71h1.76v5.86h-1.76V146.71z"/><path class="st0" d="M90.66,144.01h1.76v8.55h-1.76V144.01z"/><path class="st0" d="M99.72,144.37v8.2h-1.76v-0.55c-0.39,0.45-0.96,0.71-1.75,0.71c-1.54,0-2.8-1.35-2.8-3.09s1.27-3.09,2.8-3.09 c0.79,0,1.36,0.27,1.75,0.71v-2.89H99.72z M97.96,149.64c0-0.88-0.59-1.43-1.39-1.43s-1.39,0.55-1.39,1.43s0.59,1.43,1.39,1.43 S97.96,150.52,97.96,149.64z"/><path class="st0" d="M104.52,146.59v1.99c-0.73-0.12-1.76,0.18-1.76,1.34v2.65h-1.76v-5.86h1.76v1.04 C103,146.97,103.79,146.59,104.52,146.59z"/><path class="st0" d="M108.15,151.16c0.48,0,0.89-0.19,1.12-0.45l1.41,0.81c-0.57,0.8-1.44,1.21-2.55,1.21c-2,0-3.25-1.35-3.25-3.09 s1.27-3.09,3.12-3.09c1.71,0,2.98,1.32,2.98,3.09c0,0.25-0.02,0.48-0.07,0.7h-4.16C106.96,150.95,107.5,151.16,108.15,151.16z  M109.22,149.03c-0.19-0.68-0.71-0.93-1.24-0.93c-0.67,0-1.11,0.33-1.28,0.93H109.22z"/><path class="st0" d="M117.59,148.97v3.6h-1.76v-3.34c0-0.73-0.46-1.07-1.02-1.07c-0.64,0-1.09,0.38-1.09,1.21v3.2h-1.76v-5.86h1.76 v0.55c0.32-0.43,0.9-0.71,1.68-0.71C116.58,146.54,117.59,147.39,117.59,148.97z"/><path class="st0" d="M119.5,147.82h-1.41l0.47-3.46h1.88L119.5,147.82z"/><path class="st0" d="M124.98,150.81c0,1.35-1.17,1.92-2.44,1.92c-1.17,0-2.06-0.45-2.52-1.39l1.52-0.87c0.15,0.45,0.48,0.69,1,0.69 c0.42,0,0.63-0.13,0.63-0.36c0-0.64-2.88-0.3-2.88-2.33c0-1.28,1.08-1.92,2.3-1.92c0.95,0,1.79,0.42,2.29,1.25l-1.5,0.81 c-0.16-0.3-0.4-0.52-0.79-0.52c-0.3,0-0.49,0.12-0.49,0.33C122.1,149.09,124.98,148.64,124.98,150.81z"/><path class="st0" d="M137.11,152.57h-1.88v-4.77l-2.12,3.48h-0.21l-2.12-3.48v4.77h-1.88v-8.2h1.88l2.23,3.64l2.23-3.64h1.88 V152.57z"/><path class="st0" d="M138.28,145.14c0-0.57,0.48-1.05,1.05-1.05s1.05,0.48,1.05,1.05s-0.48,1.05-1.05,1.05 S138.28,145.71,138.28,145.14z M138.46,146.71h1.76v5.86h-1.76V146.71z"/><path class="st0" d="M145.02,146.59v1.99c-0.73-0.12-1.76,0.18-1.76,1.34v2.65h-1.76v-5.86h1.76v1.04 C143.5,146.97,144.28,146.59,145.02,146.59z"/><path class="st0" d="M151.68,146.71v5.86h-1.76v-0.55c-0.39,0.45-0.96,0.71-1.75,0.71c-1.54,0-2.8-1.35-2.8-3.09 s1.27-3.09,2.8-3.09c0.79,0,1.36,0.27,1.75,0.71v-0.55H151.68z M149.92,149.64c0-0.88-0.59-1.43-1.39-1.43s-1.39,0.55-1.39,1.43 s0.59,1.43,1.39,1.43S149.92,150.52,149.92,149.64z"/><path class="st0" d="M152.67,149.64c0-1.75,1.32-3.09,3.11-3.09c1.14,0,2.14,0.6,2.65,1.5l-1.54,0.89 c-0.2-0.41-0.62-0.66-1.14-0.66c-0.76,0-1.32,0.55-1.32,1.36s0.56,1.36,1.32,1.36c0.52,0,0.95-0.25,1.14-0.66l1.54,0.88 c-0.5,0.91-1.5,1.51-2.65,1.51C154,152.73,152.67,151.38,152.67,149.64z"/><path class="st0" d="M159.13,144.01h1.76v8.55h-1.76V144.01z"/><path class="st0" d="M165.15,151.16c0.48,0,0.89-0.19,1.12-0.45l1.41,0.81c-0.57,0.8-1.44,1.21-2.55,1.21c-2,0-3.25-1.35-3.25-3.09 s1.27-3.09,3.12-3.09c1.71,0,2.98,1.32,2.98,3.09c0,0.25-0.02,0.48-0.07,0.7h-4.16C163.97,150.95,164.51,151.16,165.15,151.16z  M166.23,149.03c-0.19-0.68-0.71-0.93-1.24-0.93c-0.67,0-1.11,0.33-1.28,0.93H166.23z"/><path class="st0" d="M178.41,144.37v8.2H177l-3.16-4.45v4.45h-1.88v-8.2h1.41l3.16,4.45v-4.45H178.41z"/><path class="st0" d="M182.73,151.16c0.48,0,0.89-0.19,1.12-0.45l1.41,0.81c-0.57,0.8-1.44,1.21-2.55,1.21c-2,0-3.25-1.35-3.25-3.09 s1.27-3.09,3.12-3.09c1.71,0,2.98,1.32,2.98,3.09c0,0.25-0.02,0.48-0.07,0.7h-4.16C181.55,150.95,182.09,151.16,182.73,151.16z  M183.81,149.03c-0.19-0.68-0.71-0.93-1.24-0.93c-0.67,0-1.11,0.33-1.28,0.93H183.81z"/><path class="st0" d="M188.6,148.4v2.07c0,0.5,0.43,0.55,1.21,0.5v1.59c-2.3,0.23-2.96-0.46-2.96-2.1v-2.07h-0.94v-1.69h0.94v-1.11 l1.76-0.53v1.64h1.21v1.69H188.6z"/><path class="st0" d="M199.24,146.71l-1.88,5.86h-1.64l-0.94-3.13l-0.94,3.13h-1.64l-1.88-5.86h1.88l0.84,3.14l0.91-3.14h1.64 l0.91,3.14l0.84-3.14H199.24z"/><path class="st0" d="M199.42,149.64c0-1.75,1.38-3.09,3.11-3.09s3.11,1.35,3.11,3.09s-1.38,3.09-3.11,3.09 S199.42,151.38,199.42,149.64z M203.87,149.64c0-0.83-0.59-1.38-1.35-1.38s-1.35,0.55-1.35,1.38s0.59,1.38,1.35,1.38 S203.87,150.47,203.87,149.64z"/><path class="st0" d="M210.14,146.59v1.99c-0.73-0.12-1.76,0.18-1.76,1.34v2.65h-1.76v-5.86h1.76v1.04 C208.62,146.97,209.4,146.59,210.14,146.59z"/><path class="st0" d="M214.59,152.57l-1.88-2.59v2.59h-1.76v-8.2h1.76v4.91l1.76-2.57h2.05l-2.13,2.93l2.19,2.93H214.59z"/><path class="st0" d="M226.55,144.37v8.2h-1.88v-3.26h-2.58v3.26h-1.88v-8.2h1.88v3.14h2.58v-3.14H226.55z"/><path class="st0" d="M227.6,149.64c0-1.75,1.38-3.09,3.11-3.09s3.11,1.35,3.11,3.09s-1.38,3.09-3.11,3.09 S227.6,151.38,227.6,149.64z M232.05,149.64c0-0.83-0.59-1.38-1.35-1.38s-1.35,0.55-1.35,1.38s0.59,1.38,1.35,1.38 S232.05,150.47,232.05,149.64z"/><path class="st0" d="M239.24,150.81c0,1.35-1.17,1.92-2.44,1.92c-1.17,0-2.06-0.45-2.52-1.39l1.52-0.87c0.15,0.45,0.48,0.69,1,0.69 c0.42,0,0.63-0.13,0.63-0.36c0-0.64-2.88-0.3-2.88-2.33c0-1.28,1.08-1.92,2.3-1.92c0.95,0,1.79,0.42,2.29,1.25l-1.5,0.81 c-0.16-0.3-0.4-0.52-0.79-0.52c-0.3,0-0.49,0.12-0.49,0.33C236.35,149.09,239.24,148.64,239.24,150.81z"/><path class="st0" d="M246.48,149.64c0,1.75-1.27,3.09-2.8,3.09c-0.79,0-1.36-0.27-1.75-0.71v2.89h-1.76v-8.2h1.76v0.55 c0.39-0.45,0.96-0.71,1.75-0.71C245.21,146.54,246.48,147.89,246.48,149.64z M244.72,149.64c0-0.88-0.59-1.43-1.39-1.43 s-1.39,0.55-1.39,1.43s0.59,1.43,1.39,1.43S244.72,150.52,244.72,149.64z"/><path class="st0" d="M247.3,145.14c0-0.57,0.48-1.05,1.05-1.05s1.05,0.48,1.05,1.05s-0.48,1.05-1.05,1.05 S247.3,145.71,247.3,145.14z M247.47,146.71h1.76v5.86h-1.76V146.71z"/><path class="st0" d="M252.75,148.4v2.07c0,0.5,0.43,0.55,1.21,0.5v1.59c-2.3,0.23-2.96-0.46-2.96-2.1v-2.07h-0.94v-1.69h0.94v-1.11 l1.76-0.53v1.64h1.21v1.69H252.75z"/><path class="st0" d="M260.85,146.71v5.86h-1.76v-0.55c-0.39,0.45-0.96,0.71-1.75,0.71c-1.54,0-2.8-1.35-2.8-3.09 s1.27-3.09,2.8-3.09c0.79,0,1.36,0.27,1.75,0.71v-0.55H260.85z M259.09,149.64c0-0.88-0.59-1.43-1.39-1.43s-1.39,0.55-1.39,1.43 s0.59,1.43,1.39,1.43S259.09,150.52,259.09,149.64z"/><path class="st0" d="M262.13,144.01h1.76v8.55h-1.76V144.01z"/><path class="st0" d="M269.67,150.81c0,1.35-1.17,1.92-2.44,1.92c-1.17,0-2.06-0.45-2.52-1.39l1.52-0.87c0.15,0.45,0.48,0.69,1,0.69 c0.42,0,0.63-0.13,0.63-0.36c0-0.64-2.88-0.3-2.88-2.33c0-1.28,1.08-1.92,2.3-1.92c0.95,0,1.79,0.42,2.29,1.25l-1.5,0.81 c-0.16-0.3-0.4-0.52-0.79-0.52c-0.3,0-0.49,0.12-0.49,0.33C266.79,149.09,269.67,148.64,269.67,150.81z"/></g><g><g><path class="st0" d="M124.2,58.39l-0.81-9.31c-0.18-2.06-2-3.59-4.06-3.41l-9.31,0.81c-2.06,0.18-3.59,2-3.41,4.06l0.4,4.61 c-0.06,0.04-0.12,0.09-0.18,0.14l-7.16,6c-0.76,0.64-1.23,1.54-1.32,2.54c-0.09,1,0.22,1.97,0.86,2.73l6,7.16 c1.04,1.24,2.72,1.63,4.15,1.11c0.4-0.15,0.78-0.36,1.12-0.65l7.16-6.01c1.58-1.33,1.79-3.7,0.46-5.28l-0.19-0.22l2.86-0.25 c0.33-0.03,0.65-0.1,0.95-0.21C123.3,61.68,124.35,60.12,124.2,58.39z M115.27,52.92c0.86-0.07,1.61,0.56,1.69,1.42 c0.07,0.86-0.56,1.61-1.42,1.69c-0.86,0.07-1.61-0.56-1.69-1.42C113.78,53.75,114.42,53,115.27,52.92z M111.06,49.39 c0.86-0.07,1.61,0.56,1.69,1.42c0.07,0.86-0.56,1.61-1.42,1.69c-0.86,0.07-1.61-0.56-1.69-1.42 C109.57,50.22,110.2,49.46,111.06,49.39z M116.85,67.23l-7.16,6.01c-1.05,0.88-2.62,0.74-3.5-0.31l-6-7.16 c-0.42-0.51-0.63-1.15-0.57-1.81c0.06-0.66,0.37-1.26,0.87-1.69l7.16-6.01c0.23-0.19,0.48-0.33,0.74-0.43 c0.95-0.35,2.06-0.08,2.75,0.74l6,7.16C118.03,64.79,117.9,66.35,116.85,67.23z M119.76,59.56c-0.86,0.07-1.61-0.56-1.69-1.42 c-0.07-0.86,0.56-1.61,1.42-1.69c0.86-0.07,1.61,0.56,1.69,1.42C121.25,58.73,120.62,59.49,119.76,59.56z"/></g><g><path class="st0" d="M104.38,63.28c-0.55-0.66-1.53-0.74-2.19-0.19c-0.66,0.55-0.74,1.53-0.19,2.19c0.55,0.66,1.53,0.74,2.19,0.19 C104.85,64.92,104.93,63.93,104.38,63.28z"/></g><g><path class="st0" d="M106.88,66.26c-0.55-0.66-1.53-0.74-2.19-0.19c-0.66,0.55-0.74,1.53-0.19,2.19c0.55,0.66,1.53,0.74,2.19,0.19 C107.35,67.9,107.44,66.92,106.88,66.26z"/></g><g><path class="st0" d="M107.19,69.05c-0.66,0.55-0.74,1.53-0.19,2.19c0.55,0.66,1.53,0.74,2.19,0.19c0.66-0.55,0.74-1.53,0.19-2.19 C108.83,68.58,107.85,68.49,107.19,69.05z"/></g><g><path class="st0" d="M110.15,60.47c0.66-0.55,0.74-1.53,0.19-2.19c-0.55-0.66-1.53-0.74-2.19-0.19c-0.66,0.55-0.74,1.53-0.19,2.19 C108.51,60.93,109.49,61.02,110.15,60.47z"/></g><g><path class="st0" d="M112.85,61.25c-0.55-0.66-1.53-0.74-2.19-0.19c-0.66,0.55-0.74,1.53-0.19,2.19c0.55,0.66,1.53,0.74,2.19,0.19 C113.31,62.89,113.4,61.91,112.85,61.25z"/></g><g><path class="st0" d="M113.16,64.04c-0.66,0.55-0.74,1.53-0.19,2.19c0.55,0.66,1.53,0.74,2.19,0.19c0.66-0.55,0.74-1.53,0.19-2.19 C114.8,63.58,113.81,63.49,113.16,64.04z"/></g><g><path class="st0" d="M93.11,61.95c6.1-4.37,11.12-11.39,8.93-12.47c-0.82,1.01-3.63,4.26-7.08,6.31c0,0,4.14-3.61,6.27-6.45 c1.85-2.47,3.09-6.05,1.31-6.38c-1.53,1.86-5.11,6.02-7.99,7.81c0,0,3.19-3.26,6.84-7.69c1.67-1.89,5.14-8.67,1.56-6.73 c-8.39,4.49-16.96,14.09-14.67,15.32c1.83,0.98,4.75,4.81,3.75,8.87c-2.92-3.61-5.57-5.37-7.89-5.2 c-0.96,0.07-1.82,0.25-2.65,0.55c-1.49,0.54-2.57,1.39-3.62,2.21c-1.05,0.82-2.03,1.59-3.47,2.12c-1.44,0.52-2.69,0.57-4.02,0.61 c-1.32,0.04-2.69,0.09-4.19,0.63c-0.82,0.3-1.6,0.72-2.38,1.28c-1.88,1.36-2.78,4.4-2.7,9.05c-3.37-2.47-3.6-7.27-2.83-9.2 c0.97-2.42-11.77-4.26-21.09-2.31c-3.98,0.82,3.03,3.78,5.53,4.15c5.64,1.05,10.18,1.49,10.18,1.49 c-3.36,0.48-8.77-0.4-11.14-0.84c-1.15,1.4,2.1,3.35,5.1,4.05c3.46,0.81,8.95,0.91,8.95,0.91c-3.96,0.65-8.21-0.04-9.48-0.28 c-0.99,2.24,7.38,4.39,14.85,3.82c0.25,3.89,1.09,7.94,1.77,9.87c0.79,2.48,2.11,3.57,3.08,4.05c1.11,0.55,2.34,0.6,3.56,0.16 c1.54-0.56,2.94-1.89,3.95-3.76c1.95-3.12,3.71-5.6,7-6.79c3.29-1.2,6.23-0.43,9.73,0.71c1.97,0.78,3.91,0.9,5.44,0.34 c1.22-0.44,2.13-1.28,2.63-2.41c0.44-0.99,0.75-2.67-0.25-5.08C97.39,68.73,95.42,65.09,93.11,61.95z M95.29,76.96 c-1.21,0.44-2.82,0.36-4.58-0.34c-3.34-1.09-6.78-2.09-10.59-0.7c-3.81,1.39-5.8,4.37-7.66,7.35c-0.9,1.68-2.08,2.77-3.29,3.21 c-1.98,0.72-4.03-0.32-5.01-3.42c-1.3-3.66-3.45-16.49,0.4-19.29c0.72-0.52,1.41-0.88,2.07-1.12c2.71-0.99,5.07-0.1,8.21-1.24 c3.14-1.14,4.38-3.34,7.09-4.32c0.66-0.24,1.42-0.41,2.31-0.47c4.74-0.33,11.35,10.88,12.7,14.52 C98.17,74.13,97.27,76.24,95.29,76.96z"/></g><g><path class="st0" d="M85.55,67.21C85.54,67.21,85.54,67.21,85.55,67.21c-0.77,0.29-1.17,1.14-0.89,1.91 c0.28,0.77,1.13,1.17,1.9,0.89c0,0,0,0,0.01,0c0.77-0.28,1.17-1.14,0.89-1.91C87.17,67.33,86.32,66.93,85.55,67.21z"/></g><g><path class="st0" d="M84.6,64.61c0.77-0.28,1.17-1.14,0.89-1.91c-0.28-0.77-1.14-1.17-1.91-0.89c0,0,0,0-0.01,0 c-0.77,0.28-1.17,1.14-0.88,1.91C82.97,64.49,83.82,64.89,84.6,64.61C84.6,64.61,84.6,64.61,84.6,64.61z"/></g><g><path class="st0" d="M81.87,65.5C81.86,65.5,81.86,65.5,81.87,65.5c-0.77,0.29-1.17,1.14-0.89,1.91c0.28,0.77,1.13,1.17,1.9,0.89 c0,0,0,0,0.01,0c0.77-0.28,1.17-1.14,0.89-1.91C83.49,65.61,82.64,65.21,81.87,65.5z"/></g><g><path class="st0" d="M87.26,63.53C87.26,63.53,87.26,63.53,87.26,63.53c-0.77,0.29-1.17,1.14-0.89,1.91 c0.28,0.77,1.13,1.17,1.9,0.89c0,0,0,0,0.01,0c0.77-0.28,1.17-1.14,0.89-1.91C88.89,63.65,88.04,63.25,87.26,63.53z"/></g><g><path class="st0" d="M73.02,69.39c-0.03-0.08-0.09-0.15-0.17-0.18c-0.08-0.04-0.17-0.04-0.25-0.01l-2,0.73l-0.73-2 c-0.03-0.08-0.09-0.15-0.17-0.18c-0.08-0.04-0.17-0.04-0.25-0.01l-0.8,0.29l-0.82,0.3c-0.08,0.03-0.15,0.09-0.18,0.17 c-0.04,0.08-0.04,0.17-0.01,0.25l0.73,2l-2,0.73c-0.08,0.03-0.15,0.09-0.18,0.17c-0.04,0.08-0.04,0.17-0.01,0.25l0.59,1.62 c0.03,0.08,0.09,0.15,0.17,0.18c0.08,0.04,0.17,0.04,0.25,0.01l2-0.73l0.73,2c0.03,0.08,0.09,0.15,0.17,0.18 c0.08,0.04,0.17,0.04,0.25,0.01l0.82-0.3l0.8-0.29c0.08-0.03,0.15-0.09,0.18-0.17c0.04-0.08,0.04-0.17,0.01-0.25l-0.73-2l2-0.73 c0.08-0.03,0.15-0.09,0.18-0.17c0.04-0.08,0.04-0.17,0.01-0.25L73.02,69.39z"/></g><g><path class="st0" d="M64.44,57.85c2.37-0.21,5.34-0.93,8.36-2.03c3.02-1.1,5.76-2.45,7.71-3.82c2.45-1.71,3.43-3.29,2.92-4.69 c-0.51-1.41-2.28-1.99-5.25-1.72c-2.37,0.21-5.34,0.93-8.36,2.03c-3.02,1.1-5.76,2.45-7.71,3.82c-2.45,1.71-3.43,3.29-2.92,4.69 C59.71,57.53,61.47,58.11,64.44,57.85z M70.25,48.8c6.04-2.2,11.4-2.67,11.99-1.06c0.59,1.61-3.83,4.69-9.87,6.89 c-6.04,2.2-11.4,2.67-11.99,1.07C59.8,54.08,64.21,51,70.25,48.8z"/></g></g></svg> ';
