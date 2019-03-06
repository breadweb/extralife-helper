## Extra Life Helper v3.0
https://github.com/breadweb/extralife-helper

Copyright (c) 2013 - 2019, Adam "Bread" Slesinger http://www.breadweb.net

All rights reserved.

Date: 3/5/2019 17:00:07

<br>

### Introduction

This is an application I created in 2013 for [Extra Life](http://extra-life.org). I wanted something to track the time until Extra Life, track my total time playing on game day, and show my fundraising information. I also wanted to celebrate new donations in real time when streaming during the marathon. The following year I made it available to the community and I was excited to see it adopted by so many participants.

<br>
  
### Download

Right-click the following link and select "Save link as..."

[ExtraLifeHelper-v2.3.zip](https://github.com/breadweb/extralife-helper/releases/download/2.3/ExtraLifeHelper-v2.3.zip) (312 KB)

<br>
  
### Features

* Counts down the days until Extra Life if there are three or more days left.
* Counts down the hours until Extra Life if there are less than four days left.
* Counts the total hours played if the start time has passed.
* Continually displays the total amount raised as it changes.
* Shows new donation alerts as they arrive in real-time.
* Donation messages are read with text-to-speech during donation alerts.
* Custom sound effects can be specified for the donation alert.
* Provides a hook to run custom JavaScript when a new donation arrives.
* Occasionally shows the Extra Life and Children's Miracle Network Hospital logos.
* Works in "participant" mode or "team" mode.
* Supports four color themes and three border styles.
* Works in XSplit, OBS Studio, and any modern browser.
* Runs locally without dependency on any remote service besides the Extra Life API.
* Core functionality and appearance can be modified with little JavaScript exprience.

<br>

![](https://github.com/breadweb/extralife-helper/blob/master/images/helper1.jpg)  
Counts down the days.  

![](https://github.com/breadweb/extralife-helper/blob/master/images/helper2.jpg)  
Counts down the hours.  

![](https://github.com/breadweb/extralife-helper/blob/master/images/helper3.jpg)  
Counts the hours you have played.  

![](https://github.com/breadweb/extralife-helper/blob/master/images/helper4.jpg)  
Shows new donations as they come in.  

![](https://github.com/breadweb/extralife-helper/blob/master/images/helper5.jpg)  
Occasionally shows the Extra Life logo.  

![](https://github.com/breadweb/extralife-helper/blob/master/images/helper6.jpg)  
Occasionally shows the CMNH logo.  

<br>
  
### Screenshots

To see how some Extra Life participants have used the Helper in their live stream presentations, check out the screenshot gallery:

[http://github.com/breadweb/extralife-helper/blob/master/Examples.md](http://github.com/breadweb/extralife-helper/blob/master/Examples.md)

<br>
  
### XSplit Instructions

Requirements:

* Windows 10, XSplit 3.0

Instructions:

1. Extract the content of the zip file you downloaded to a folder on your computer.
1. Personalize the Helper using the instructions below.
1. Open up XSplit.
1. Select a scene.
1. In the scene sources section, click "Add" and then click "Webpage..."  
![](https://github.com/breadweb/extralife-helper/blob/master/images/xsplit1.jpg)  
1. Click the "Browse" button and select **ExtraLifeHelper.html** from the location you extracted the files.  
![](https://github.com/breadweb/extralife-helper/blob/master/images/xsplit2.jpg)  

<br>
  
### OBS Studio Instructions

Requirements:

* Windows 7/8/10, OBS Studio 20.0.1
* OSX Sierra, OBS Studio 20.0.1

Instructions:

1. Extract the contents of the zip file you downloaded to a folder on your computer.
1. Personalize the Helper using the instructions below.
1. Open up OBS Studio.
1. Select a scene in the "Scenes" section.
1. Right-click in the "Sources" section, select "Add" and then select "BrowserSource".   ![](https://github.com/breadweb/extralife-helper/blob/master/images/obs1.jpg)  
1. Select "Create New", type in a name such as "Helper" and click OK.  
![](https://github.com/breadweb/extralife-helper/blob/master/images/obs2.jpg)  
1. In the Properties screen, check the box that says "Local file", click the "Browse" button and select **ExtraLifeHelper.html** from the files you extracted.  
![](https://github.com/breadweb/extralife-helper/blob/master/images/obs3.jpg)  
1. Set the Width and Height to whatever is specified in the HTML file. Delete everything in the CSS field. Click OK. 
![](https://github.com/breadweb/extralife-helper/blob/master/images/obs4.jpg)

<br>
  
### Personalizing the Helper

First, get your participant ID. It can be found in the URL for your fundraising page. Look for the "participantID" in the URL towards the end. For example:

`http://www.extra-life.org/index.cfm?fuseaction=donorDrive.participant&participantID=101425`

If you want to use the Helper in team mode, get your team ID. It can be found in the URL for your team's fundraising page. Look for the "teamID" in the URL towards the end. For example:

`http://www.extra-life.org/index.cfm?fuseaction=donorDrive.team&teamID=16539`

Open the **ExtraLifeHelper.html** file using a text editor such as Notepad and enter in your participant ID, start date, start time, etc.

```
// Extra Life Helper
// ============================================================================================
// For use details and use instructions, visit https://github.com/breadweb/extralife-helper
// For help or feature requests, visit http://bit.ly/helper-forum/
// 
var participantId = "300817";              // Set this to blank to run in team mode
var teamId = "";                           // Set this to blank to run in participant mode
var startDate = "11-03-2018";              // Set to your local Extra Life start date
var startTime = "10:00:00";                // Set to your local Extra Life start time
var helperTheme = "blue1";                 // Color theme: white1, gray1, blue1, or blue2
var helperBorder = "none";                 // Border type: rounded, square, or none
var helperWidth = 540;                     // Width of the Helper, in pixels
var helperHeight = 225;                    // Height of the Helper, in pixels
var showDonationAlerts = "true";           // Set to "false" to suppress donation alerts
var showGoal = "true";                     // Set to "false" to only show amount raised on the
//                                         // main screen and not also your goal
var donationSounds = "cash.mp3,kids.mp3";  // Set this to your custom set of sounds, separated
//                                         // by commas. Or set to "" to play no sounds
var donationMessageVoice = "UK-female";    // Voice style for the reading of donation messages.
//                                         // Set to US-female, UK-male, UK-female or set
//                                         // to "" to not read messages with text-to-speech.      
var yearMode = "false";                    // An alternate display to support fundraising all
//                                         // year round. The count down/up timer is hidden
var testDonationSeconds = 0;               // Number of seconds to show a test donation after
//                                         // the Helper loads. Set to 0 to disable.        
// ============================================================================================

// If you would like additional things to happen when a new donation is 
// received, put them in this function.
function onNewDonation(donorName, donationAmount, message, avatarImageURL, createdOn)
{
    // Your custom logic here.
}
```

Some special notes about editing this file:

* The **startTime** value format is military time. 1:00 PM = 13:00, 2:00 PM = 14:00, etc.
* If specifying multiple sound files for the **donationSounds** value, be sure to separate them with commas.
* If you know JavaScript and have some smart devices in your house (such as programmable lights or displays) or a remote API you want to work with when you receive a new donation, you can add custom code in the **onNewDonation** function.

<br>
  
### Resizing the Helper

The Helper is made with vector art so when stretched, it should always remain sharp no matter what size. The trick to making this work is to be sure that the width and height values for the Helper in XSplit or OBS match what is in the **ExtraLifeHelper.html** file. After you change the values in your streaming software, don't forget to update the html file! 

For OBS Studio, avoid resizing the Helper by dragging it. Open the properties and specify the values there until the size is what you want. This is because resizing by dragging will not update the values in the properties and so you won't know what to set in the html file.

<br>
  
### Color Themes, Borders and Sound

There are a few more options for customizing the Helper to suit your streaming setup.

* **Color Themes**: There are four color themes available that respect the Extra Life brand guidelines.  
![](https://github.com/breadweb/extralife-helper/blob/master/images/themes.jpg)  
The values that can be set are "blue1", "blue2", "white1", and "gray1".
* **Borders**: By default, there is a border with rounded corners. You can change it to have square corners or remove it completely. The values are "rounded", "square", or "none".
* **Sounds**:
  * To use your own donation sounds, place your mp3, wav, or ogg files in the **audio** directory and update the donationSounds value in the ExtraLifeHelper.html file.
  * You can mute the Helper by setting the donationSounds value to "".
        
These options can be changed in the ExtraLifeHelper.html file that you edited during the steps to personalize the Helper. 

<br>
  
### Example Video

The following video is a compilation of donations received during the Extra Life 2017 marathon. I use the donation hook to make a call to my light bridge and make my office lights flash.

[![Alt text for your video](https://img.youtube.com/vi/YUu3rBl8ug0/0.jpg)](https://www.youtube.com/watch?v=YUu3rBl8ug0)

<br>
  
### Troubleshooting

**You see a "X is missing or invalid" message.**

This usually happens due to a typo when editing the **ExtraLifeHelper.html** file. If you can find the typo, try downloading a fresh copy and trying again.  

**You see $0 for your donations received.**

There are a few known reasons for this:
* You are using an old version of the Helper that doesn't work with the current Extra Life API. Download the latest!
* You haven't received any donations yet. Keep up the fundraising efforts!
* You got your first donation, but it hasn't been registered fully by the Extra Life API. Just give it a few minutes to show up.
* The Extra Life API timed out when the Helper was trying to contact it. This can happen if the Extra Life API is under high load. Just be patient and the Helper will get the current total again when the Extra Life API responds.
* You are trying to use the Helper in an unsupported way. Please review the instructions for proper use.

**The Helper looks blurry.**

This is usually because you have stretched the Helper in your presentation but forgot to update the width and height values in the **ExtraLifeHelper.html** file to match.

<br>
  
### Donations

It's been really rewarding to see the Helper being used by so many people who are raising money for a great cause. I do not expect anything in return, but if you are determined, you could always make a donation on my [Extra Life page](https://www.extra-life.org/participant/bread) since this is all **F**or **T**he **K**ids! Thank you!

<br>
  
### Modifying and Contributing Back

Because the source is freely available here, you are welcome to modify the Helper however you see fit. Some modifications that have been done by other participants so far include:

* Adding a third hour digit to the clock to support a 100+ hour long marathon
* Changing the fonts or color themes to match a stream presentation
* Adding a background image to match a steam presentation
* Adding donation alerts while running in team mode

If you make a change that would benefit all users of the Helper, please make a pull request and I would be happy to review it. Thank you!

<br>

### Credits

The Helper would not be possible without the following libraries:

* jQuery - [https://jquery.com/](https://jquery.com/)
* Paper.js - [http://paperjs.org/](http://paperjs.org/)
* TweenJS - [https://www.createjs.com/tweenjs](https://www.createjs.com/tweenjs)
* ResponsiveVoice - [https://responsivevoice.org/](https://responsivevoice.org/)

<br>
  
### Contact

If you see any issues that are not covered in the troubleshooting section, please visit the [Helper forum thread](http://bit.ly/helper-forum) and I'll do my best to fix it quickly.

I'd also love to see the Helper being used on your stream. Let me know your broadcasting URL so I can watch and cheer you on during the marathon. Good luck with your fundraising for Extra Life!

Adam "Bread" Slesinger

* Twitch: [http://www.twitch.tv/bread_man](http://www.twitch.tv/bread_man)
* Discord: [https://discord.gg/aArewEc](https://discord.gg/aArewEc)
* Extra Life: [https://extra-life.org/participant/bread](https://extra-life.org/participant/bread)
* Steam: [https://steamcommunity.com/id/breadweb](https://steamcommunity.com/id/breadweb)
