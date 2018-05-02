/*!
 * Extra Life Helper v2.0
 * https://github.com/breadweb/extralifehelper
 *
 * Copyright (c) 2013 - 2017, Adam "Bread" Slesinger
 * http://www.breadweb.net
 *
 * Distributed under the MIT license.
 *
 * All rights reserved.
 *
 * Date: 9/11/2017 11:24:17
 *
 */

var IS_DEBUG = false;
var WIDTH_ORIGINAL = 264;
var HEIGHT_ORIGINAL = 110;
var ANCHOR_POINT = { x:1, y:1 };      // Point to start drawing which avoids clipping of stroke
var PADDING = 2;                      // Pixels of width and height to reduce to avoid clipping of stroke
var DARK_BLUE = "#1D4C6C";
var LIGHT_BLUE = "#28C0E8";
var GREEN = "#97C93D";
var WHITE = "#FFFFFF";
var GRAY = "#BCBEC0";
var CLOCK_TIMER_INTERVAL = 1000;      // Frequency that the countdown should be refreshed, in ms
var ACTION_TIMER_INTERVAL = 60000;    // Frequency that a new action should be taken, in ms
var DONOR_TIMER_INTERVAL = 60000;     // Length of time a new donation is shown, in ms
var LOGO_PLAY_MARK = 60;              // Number of times the action item ticks before showing logos

var DONOR_AMOUNT_POINT_Y = 40;
var DONOR_AMOUNT_FONT_SIZE = 36;
var DONOR_NAME_POINT_Y = 56;
var DONOR_NAME_FONT_SIZE = 12;
var DONOR_AMOUNT_POINT_Y_ALT = 52;
var DONOR_AMOUNT_FONT_SIZE_ALT = 40;
var DONOR_NAME_POINT_Y_ALT = 76;
var DONOR_NAME_FONT_SIZE_ALT = 14;
var DAYS_UNTIL = "DAYS UNTIL EXTRA LIFE:";
var HOURS_UNTIL = "HOURS UNTIL EXTRA LIFE:";
var HOURS_PLAYED = "TOTAL TIME PLAYED:";
var KEY_TOTAL_RAISED_AMOUNT = "sumDonations";
var KEY_DONOR_NAME = "displayName";
var KEY_DONOR_AMOUNT = "amount";
var KEY_DONOR_MESSAGE = "message";
var KEY_DONOR_AVATAR = "avatarImageUrl";
var KEY_DONOR_CREATED_ON = "createdDateUTC";
var KEY_TIMESTAMP = "timestamp";

var BASE_URL = "https://www.extra-life.org/api/";
var PARTICIPANT_INFO_URL = BASE_URL + "participants/{1}";
var DONOR_INFO_URL = BASE_URL + "participants/{1}/donations";
var TEAM_INFO_URL = BASE_URL + "teams/{1}";
var TEAM_ROSTER_URL = BASE_URL + "teams/{1}/participants";
var TEAM_DONOR_INFO_URL = BASE_URL + "teams/{1}/donations";

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
var logoYearGroup;
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
var newDonors;
var extraLifeLogoItem;
var cmnhLogoItem;
var logoCounter;

$(document).ready(init);

function init()
{
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

    initSound();
    initPage();
    initPaper();
    initScreen();

    if (IS_DEBUG)
    {
        participantInfoUrl = "http://localhost/participant.txt";
        donorInfoUrl = "http://localhost/donors.txt";
        teamInfoUrl = "http://localhost/team.txt";
        teamDonorInfoUrl = "http://localhost/teamDonors.txt";

        CLOCK_TIMER_INTERVAL = 1000;
        ACTION_TIMER_INTERVAL = 10000;
        DONOR_TIMER_INTERVAL = 10000;

        paper.project.activeLayer.onMouseDown = function(event)
        {
//            stopTimer("action");
//            stopTimer("clock");        
//            infoGroup.visible = false;
//            logoYearGroup.visible = false;
//            donorGroup.visible = false;
//
//            logoCounter = 59;
//
//            logoGroup.visible = true;
//            cmnhLogoItem.visible = false;
//
//            donorGroup.visible = true;
//            donorAmountText.content = "A Gift";
//            donorNameText.content = "Adam Slesinger"
//            message = "Awesome job guys! Keep up the hard work! " +
//                      "Go go go go go! w00t! I can't. Believe.";
//            updateDonorGroup(message);
//            updateDonorGroup(null);
//            startTimer("donor");
        }
    }   

    // A small delay helps prevent the jarring visual of the fonts loading
    // in over the temporary fonts in the first screen. A preloader would be
    // the clean way to do this, but hack is enough to work when the files
    // are loaded locally. 
    window.setTimeout(startHelper, 100);
}

function startHelper()
{
    startTimer("action");
    startTimer("clock");
}

function startTimer(timerType)
{
    switch (timerType)
    {
        case "action":
            actionTimerId = setInterval(onActionTimer, ACTION_TIMER_INTERVAL);
            onActionTimer();
            break;
        case "clock":
            if (!yearMode)
            {
                clockTimerId = setInterval(onClockTimer, CLOCK_TIMER_INTERVAL);
                onClockTimer();
            }
            break;
        case "donor":
            donorTimerId = setInterval(onDonorTimer, DONOR_TIMER_INTERVAL);
            break;
    }
}

function stopTimer(timerType)
{
    switch (timerType)
    {
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

function initSound()
{
    soundObjects = donationSounds.split(",");
    for (i = 0; i < soundObjects.length; i++)
    {
        soundObjects[i] = new Audio("audio/" + soundObjects[i].trim());
    }
}

function initPage()
{
    // Determine how much we've scaled up or down. Use that scale to change the width
    // and height. Note that the custom height values are ignored to keep the scale uniform.
    helperScale = helperWidth / WIDTH_ORIGINAL;    
    helperHeight = HEIGHT_ORIGINAL * helperScale;

    if (!$('#myCanvas').length)
    {
        $(document.body).append(
            '<canvas id="myCanvas" display="block" width="' + 
            helperWidth + 
            '" height="' + 
            helperHeight + 
            '"></canvas>');

        // Haven't figured out why custom styles for body are being ignored in chromium when
        // including in a standard way so explicitly setting them here.
        $("body").css("margin", "0px");
        $("body").css("overflow", "hidden");
    }

    // Force some fonts to load before they're used in the paper text items.
    $("body").append("<div style='font-family:Cantarell-Regular'> </div>");
    $("body").append("<div style='font-family:Cantarell-Bold'> </div>");
    $("body").append("<div style='font-family:LetsGoDigital'> </div>");
    $("body").append("<div style='font-family:Furore'> </div>");
}

function initPaper()
{
    var canvas = $('#myCanvas')[0];
    paper.setup(canvas);
}

function initScreen()
{       
    // Set up background used for all display groups and apply different style properties
    // based on user settings.

    backgroundRect = new paper.Rectangle({
        point: ANCHOR_POINT,
        size: [helperWidth - PADDING, helperHeight - PADDING]
    });

    switch (helperBorder)
    {
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
        content: DAYS_UNTIL,
        fontFamily: "Furore",
        fontSize: 12,
        justification: 'center',
        visible: !yearMode
    });    

    daysText = new paper.PointText({
        point: [centerX, 60],
        content: '0',
        fontFamily: "LetsGoDigital",
        fontSize: 50,
        justification: 'center',
        visible: !yearMode
    });    

    // The clock face is set up with indvidual text items in order to
    // keep all numbers fixed with. Otherwise the entire clock face 
    // will shift in minor increments when the value changes, looking weird.
    clockNumbers = [6];
    clockGroup = new paper.Group();
    var xPos = 0;
    for (i = 0; i < 6; i++)
    {
        // A colon separator is needed after every two clock digits.
        doesNeedSep = i > 0 && i % 2 == 0;
        
        if (doesNeedSep)
        {
            // Add a colon separator.
            var colonSep = new paper.PointText({
                point: [xPos - 8, 0],
                content: ':',
                fontFamily: "LetsGoDigital",
                fontSize: 50,
                justification: 'center',
                visible: !yearMode
            });
            clockGroup.addChild(colonSep);
            xPos += 10;
        }

        clockNumbers[i] = new paper.PointText({
            point: [xPos, 0],
            content: '0',
            fontFamily: "LetsGoDigital",
            fontSize: 50,
            justification: 'center',
            visible: !yearMode
        });
        clockGroup.addChild(clockNumbers[i]);

        xPos += 28;
    }
    
    clockGroup.position = [centerX, 45];
    clockGroup.visible = false;
    
    raisedText = new paper.PointText({
        point: [centerX, 78],
        content: 'AMOUNT RAISED:',
        fontFamily: "Furore",
        fontSize: 12,
        justification: 'center'
    });        

    // Year mode is for those who want to fundraise all year long and so a 
    // count down timer does not make sense. Instead, we show the logos.
    if (yearMode)
    {
        raisedText.content = new Date().getFullYear() + " " + raisedText.content;
    }
    
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

    // Logos for year mode
    var extraLifeLogoYearItem;
    var cmnhLogoYearItem;

    paper.project.importSVG(extraLifeLogo, function(item) {        
        extraLifeLogoYearItem = item;            
        extraLifeLogoYearItem.position = [155, 71];
        extraLifeLogoYearItem.scale(0.52, [0, 0]);
        extraLifeLogoYearItem.visible = yearMode;
    });

    paper.project.importSVG(cmnhLogo, function(item) {
        cmnhLogoYearItem = item;
        cmnhLogoYearItem.position = [417, 79];
        cmnhLogoYearItem.scale(0.52, [0, 0]);
        cmnhLogoYearItem.visible = yearMode;
    });

    logoYearGroup = new paper.Group();    
    logoYearGroup.addChild(extraLifeLogoYearItem);
    logoYearGroup.addChild(cmnhLogoYearItem);
    

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
        content: 'Anonymous',
        fontFamily: "Furore",
        fontSize: DONOR_NAME_FONT_SIZE,
        justification: 'center'
    });    

    donorMessageText1 = new paper.PointText({
        point: [centerX, 76],
        fontFamily: "Cantarell-Regular",
        fontSize: 12,
        justification: 'center'
    });   
    
    donorMessageText2 = new paper.PointText({
        point: [centerX, 88],
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

    paper.project.importSVG(extraLifeLogo, function(item) {        
        extraLifeLogoItem = item;            
        extraLifeLogoItem.position = [142, 62];  
        extraLifeLogoItem.opacity = 0;
    });

    paper.project.importSVG(cmnhLogo, function(item) {
        cmnhLogoItem = item;
        cmnhLogoItem.position = [164, 70];
        cmnhLogoItem.opacity = 0;
    });

    logoGroup = new paper.Group();    
    logoGroup.addChild(extraLifeLogoItem);
    logoGroup.addChild(cmnhLogoItem);
    logoGroup.visible = false;

    // Apply scale to all groups.

    setScale(infoGroup, helperScale);
    setScale(donorGroup, helperScale);
    setScale(logoGroup, helperScale, "topLeft");
    setScale(logoYearGroup, helperScale, "topLeft");

    // Apply the selected color theme to all items.

    switch (helperTheme)
    {
        case "blue1":
            backgroundPath.strokeColor = GREEN;
            backgroundPath.fillColor = DARK_BLUE;
            titleText.fillColor = WHITE;
            daysText.fillColor = GREEN;
            clockGroup.fillColor = GREEN;
            raisedText.fillColor = yearMode ? GREEN : WHITE;
            moneyText.fillColor = WHITE;
            donorAmountText.fillColor = GREEN;
            donorNameText.fillColor = WHITE;
            donorMessageText1.fillColor = WHITE;
            donorMessageText2.fillColor = WHITE;
            logoGroup.fillColor = WHITE;
            logoYearGroup.fillColor = WHITE;
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
            logoYearGroup.fillColor = WHITE;
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
            logoYearGroup.fillColor = WHITE;
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

function onClockTimer()
{
    var timeDiff = new Date().getTime() - dateTimeStart.getTime();
    var isCountingUp;

    // If the difference is negative, the start time hasn't been hit or passed yet
    // and the difference is the amount of time left until the start time. Otherwise,
    // the difference is the amount of time played.
    if (timeDiff < 0)
    {        
        timeDiff = timeDiff * -1;
        titleText.content = HOURS_UNTIL;
        isCuntingUp = false;
    }
    else                
    {
        titleText.content = HOURS_PLAYED;
        isCountingUp = true;
    }
    
    var days = Math.floor(timeDiff / 1000 / 60 / 60 / 24);
    
    // If there are three or more days left, the text will be updated to show how many 
    // days are left before the start time. Otherwise, we will show how the time which 
    // could be counting down or up.
    if (days > 3 && !isCountingUp)
    {
        titleText.content = DAYS_UNTIL;
        daysText.content = days;
        daysText.visible = true;
        clockGroup.visible = false;                
    }
    else
    {
        var hours = Math.floor(timeDiff / 1000 / 60 / 60);
        timeDiff -= hours * 1000 * 60 * 60;
        var minutes = Math.floor(timeDiff / 1000 / 60);
        timeDiff -= minutes * 1000 * 60;
        var seconds = Math.floor(timeDiff / 1000);            
        
        var hourText = zeroPad(String(hours));
        var minuteText = zeroPad(String(minutes));
        var secondText = zeroPad(String(seconds));
        
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

function onActionTimer()
{
    // First check to see if we should be showing any new donations. This
    // has the highest priority over any other action.
    if (newDonors.length > 0)
    {                
         showNewDonor();
         return;
    }
   
    // Then check to see if we should be showing the logo animations
    // instead of requesting information from the Extra Life website.
    logoCounter++;
    if (logoCounter >= LOGO_PLAY_MARK)
    {
        logoCounter = 0;
        animateLogos();
        return;
    }   
    
    infoGroup.visible = true;
    logoYearGroup.visible = true;
    donorGroup.visible = false;
    logoGroup.visible = false;
    
    // Otherwise, poll general info for player or team to see if total
    // amount raised has changed.
    requestGeneralInfo();        
}

function animateLogos()
{
    stopTimer("action");
    stopTimer("clock");

    infoGroup.visible = false;
    logoYearGroup.visible = false;
    donorGroup.visible = false;
    logoGroup.visible = true;
    
    createjs.Tween.get(extraLifeLogoItem)
        .wait(200)
        .to({opacity:1}, 1500)
        .wait(5000)
        .to({opacity:0}, 1000);
    createjs.Tween.get(cmnhLogoItem)
        .wait(7700)
        .to({opacity:1}, 1500)
        .wait(5000)
        .to({opacity:0}, 1000)
        .wait(300)
        .call(onAnimateLogosComplete);
}

function onAnimateLogosComplete()
{
    startTimer("action");
    startTimer("clock");
}

function onDonorTimer()
{
    stopTimer("donor");
    startTimer("action");
    startTimer("clock");
}

function showNewDonor()
{
    if (newDonors.length < 1)
    {
        console.log("A new donation was expected but NOT found...");
        return;
    }

    stopTimer("action");
    stopTimer("clock");
    startTimer("donor");

    var donorEntry = newDonors.shift(); 
    shownDonors.push(donorEntry);

    // TODO: We got a undefined donorEntry once. Need to protect against it.
    // TypeError: Cannot read property 'donationAmount' of undefined
    var donorAmount = donorEntry[KEY_DONOR_AMOUNT];
    var donorName = donorEntry[KEY_DONOR_NAME];
    var donorMessage = donorEntry[KEY_DONOR_MESSAGE];
    var donorAvatar = donorEntry[KEY_DONOR_AVATAR];
    var donorCreatedOn = donorEntry[KEY_DONOR_CREATED_ON];
    var donorTimestamp = donorEntry[KEY_TIMESTAMP];

    donorAmountText.content = donorAmount == null
         ? "A Gift"
         : formatMoney(donorAmount, true);
    donorNameText.content = donorName == null
         ? "Anonymous"
         : donorName;

    updateDonorGroup(donorMessage);

    infoGroup.visible = false;
    logoYearGroup.visible = false;
    donorGroup.visible = true;
    logoGroup.visible = false;

    playSounds();

    // Call the function that participants can use to run their own code when
    // a new donation arrives.
    onNewDonation(donorName, donorAmount, donorMessage, donorAvatar, donorCreatedOn, donorTimestamp);
}

function updateDonorGroup(message)
{
    // Reset scaling first before making changes. There is a better
    // way of doing this but this works for now.
    setScale(infoGroup, 1 / helperScale);
    setScale(donorGroup, 1 / helperScale);

    var isVisible = true;
    var donorAmountPointY = DONOR_AMOUNT_POINT_Y;
    var donorAmountFontSize = DONOR_AMOUNT_FONT_SIZE;
    var donorNamePointY = DONOR_NAME_POINT_Y;
    var donorNameFontSize = DONOR_NAME_FONT_SIZE;

    donorMessageText1.content = "";
    donorMessageText2.content = "";

    // If there is a message, add it. Otherwise, we'll rescale the
    // donor amount and name so it is bigger and fills the area more. 
    if (message != null)
    {
        // Remove some characters that make things look weird.
        message = message.split("\r\n").join(" ");

        // Paper doesn't support text areas yet so we'll manually fill in 
        // up to two lines of the message and support a max number of 
        // charcters per line.
        var words = message.split(' ');
        var totalChars = 0;
        var maxCharsPerLine = 25;
        for (i = 0; i < words.length; i++)
        {
            word = words[i];
            if (totalChars > maxCharsPerLine * 2)
            {
                var textContent = donorMessageText2.content;
                if (textContent.endsWith(".") ||
                    textContent.endsWith("?") ||
                    textContent.endsWith("!"))
                {
                    textContent = textContent.slice(0, -1);
                }
                donorMessageText2.content += "...";
                break;
            }    
            else if (totalChars > maxCharsPerLine)
            {
                donorMessageText2.content += " " + word;
            }
            else
            {
                donorMessageText1.content += " " + word;
            }
            totalChars += word.length;
        }
    }
    else
    {
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

function requestGeneralInfo()
{
    var url = participantId ? participantInfoUrl : teamInfoUrl;
    makeRequest(url, onGeneralInfoSuccess, onRequestError);          
}

function requestDonorInfo()
{
    var url = participantId ? donorInfoUrl : teamDonorInfoUrl;
    makeRequest(url, onDonorInfoSuccess, onRequestError);
}

function makeRequest(url, onSuccess, onError)
{
    url = addCacheBusting(url);
    log(url);

    // Using post request method is an additional way to help
    // prevent getting a cached response. But setting to GET
    // is required for my local webserver.
    requestType = IS_DEBUG ? 'GET' : 'GET';
        
    $.ajax({
        url: url,
        type: requestType,
        data: '',
        dataType: 'json',
		cache: false,
        success: function(res) {
            onSuccess(res);
        },
        error: function(res) {
            onError(res);    
        }
    });
}

function onGeneralInfoSuccess(res)
{
    log(res);
    var raised = res['sumDonations'];
    var goal = res['fundraisingGoal'];

    moneyText.content = formatMoney(raised, false);

    if (showGoal == "true")
    {
        moneyText.content += " / " + formatMoney(goal, false);
    }

    // If the amount raised is more than the last recorded value, then one or
    // more donations have come in since the last time general info was polled.
    // This is always true at startup, but the processing of donations will 
    // ensure we don't treat all donations as new the first time.
    if (raised > lastRaised)
    {
        if (showDonationAlerts == "true")
        {
            requestDonorInfo();
        }
    }    

    lastRaised = raised;
}

function onRequestError(res)
{
    // Errors are usually due to transient network failures so ignore and try 
    // again at the next timer tick.
    log(res);
}

function onDonorInfoSuccess(res)
{
    log(res);

    // If donators is null, this must be the first time getting the list so just
    // set shown donors to the value and exit instead of treating everything as new.
    if (!shownDonors)
    {
        shownDonors = res;
        return;
    }
    
    // Go through the list and find the new ones.            
    for (i = 0; i < res.length; i++)
    {
        var wasFound = false;
        for (j = 0; j < shownDonors.length; j++)
        {
            // A unique ID is provided by Extra Life for donations (timestamp) but for 
            // some reason, jquery ajax response objects sometimes show the wrong timestamp
            // value and this can cause donation alerts to now show. Until we can figure
            // out why, resort to the old method of uniquely identifying a donation by a
            // combination of who and when.
            if (res[i][KEY_DONOR_NAME] == shownDonors[j][KEY_DONOR_NAME] &&
                res[i][KEY_DONOR_CREATED_ON] == shownDonors[j][KEY_DONOR_CREATED_ON])
            {
                wasFound = true;
                break;
            }
        }
        
        if (!wasFound)
        {
            newDonors.unshift(res[i]);
        }
    }
   
    // Since this is not the first time getting donors, we have at least one new 
    // donation. Show it immediately.
    showNewDonor();
}

function playSounds()
{
    for (i = 0; i < soundObjects.length; i++)
    {
        soundObject = soundObjects[i];
        soundObject.load();
        soundObject.play();
    }    
}

function setScale(group, amount, anchorPoint = "topCenter")
{
    var xPos = anchorPoint == "topCenter"
        ? group.bounds.topLeft.x + group.bounds.width / 2
        : 0; // "topLeft"

    group.scale(amount, [xPos, 0]);
}

function addCacheBusting(url)
{
    if (IS_DEBUG)
    {
        return url;
    }

    // Add a timestamp parameter to the query string with a uniquely incrementing
    // number so it will bust caching. The Extra Life website will ignore it.
    return url + "&cb=" + new Date().getTime();
}

function zeroPad(value, length = 2)
{
    while (value.length < length)
    {
        value = "0" + value;
    }
    return value;
}

function formatMoney(amount, showCents)
{
    amount = showCents ? amount.toFixed(2) : amount.toFixed(0);
    return '$' + String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function log(message)
{
    console.log(message);
}
