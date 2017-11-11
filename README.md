## Extra Life Helper v2.0
https://github.com/breadweb/extralifehelper

Copyright (c) 2013 - 2017, Adam "Bread" Slesinger
http://www.breadweb.net

Distributed under the MIT license.

All rights reserved.

Date: 9/11/2017 11:24:17

### Introduction

This is an application I created in 2013 for [Extra Life](http://extra-life.org). I wanted something to track the time until Extra Life, track my total time playing on game day, and show my fundraising information. The following year I made it available to the community and I was excited to see it adopted by many participants.

### Download

[ExtraLifeHelper.zip](https://github.com/username/repository/blob/master/ExtraLife.zip) (312 KB)

### Features

* Counts down the days until Extra Life if there are three or more days left.
* Counts down the hours until Extra Life if there are less than four days left.
* Counts the total hours played if the start time has passed.
* Shows your total amount raised in real-time.
* Shows new donations as they arrive in real-time and plays a happy kids sound effect.
* Allows specifying a custom donation alert sound.
* Occasionally shows the Extra Life and Children's Miracle Network Hospital logos.
* Works in "participant" mode or "team" mode. You can show totals for yourself or your team.
* Supports four color themes and different border styles to compliment your stream setup.
* Works in XSplit and OBS Studio (Windows and OSX)

### Screenshots

![](https://github.com/username/repository/blob/master/images/helper1.jpg)
Counts down the days.
![](https://github.com/username/repository/blob/master/images/helper2.jpg)
Counts down the hours.
![](https://github.com/username/repository/blob/master/images/helper3.jpg)
Counts the hours you have played.
![](https://github.com/username/repository/blob/master/images/helper4.jpg)
Shows new donations as they come in.
![](https://github.com/username/repository/blob/master/images/helper5.jpg)
Occasionally shows the Extra Life logo.
![](https://github.com/username/repository/blob/master/images/helper6.jpg)
Occasionally shows the CMNH logo.

### XSplit Instructions

Requirements:

* Windows 10, XSplit 3.0

Instructions:

1. Extract the content of the zip file you downloaded to a folder on your computer.
1. Personalize the Helper using the instructions below.
1. Open up XSplit.
1. Select a scene.
1. In the scene sources section, click "Add" and then click "Webpage..." ![](https://github.com/username/repository/blob/master/images/xsplit1.jpg)
1. Click the "Browse" button and select **ExtraLifeHelper.html** from the location you extracted the files. ![](https://github.com/username/repository/blob/master/images/xsplit2.jpg)

### OBS Studio Instructions

Requirements:

* Windows 7/8/10, OBS Studio 20.0.1
* OSX Sierra, OBS Studio 20.0.1

Instructions:

1. Extract the contents of the zip file you downloaded to a folder on your computer.
1. Personalize the Helper using the instructions below.
1. Open up OBS Studio.
1. Select a scene in the "Scenes" section.
1. Right-click in the "Sources" section, select "Add" and then select "BrowserSource". ![](https://github.com/username/repository/blob/master/images/obs1.jpg)
1. Select "Create New", type in a name such as "Helper" and click OK. ![](https://github.com/username/repository/blob/master/images/obs2.jpg)
1. In the Properties screen, check the box that says "Local file", click the "Browse" button and select **ExtraLifeHelper.html** from the files you extracted. ![](https://github.com/username/repository/blob/master/images/obs3.jpg)
1. Set the Width and Height to whatever is specified in the HTML file. Delete everything in the CSS field. Click OK. ![](https://github.com/username/repository/blob/master/images/obs4.jpg)

### Personalizing the Helper

First, get your participant ID. It can be found in the URL for your fundraising page. Look for the "participantID" in the URL towards the end. For example:

`http://www.extra-life.org/index.cfm?fuseaction=donorDrive.participant&participantID=101425`

If you want to use the Helper in team mode, get your team ID. It can be found in the URL for your team's fundraising page. Look for the "teamID" in the URL towards the end. For example:

`http://www.extra-life.org/index.cfm?fuseaction=donorDrive.team&teamID=16539`

Open the **ExtraLifeHelper.html** file using a text editor such as Notepad and enter in your participant ID, start date, start time, etc.

![](https://github.com/username/repository/blob/master/images/config-obs.jpg)]

Some special notes about editing this file:

* The **startTime** value format is military time. 1:00 PM = 13:00, 2:00 PM = 14:00, etc.
* If specifying multiple sound files for the **donationSounds** value, be sure to separate them with commas.
* If you know JavaScript and have some smart devices in your house (such as programmable lights or displays) or a remote API you want to work with when you receive a new donation, you can add custom code in the **onNewDonation** function.

### Resizing the Helper

The Helper is made with vector art so when stretched, it should always remain sharp no matter what size. The trick to making this work is to be sure that the width and height values for the Helper in XSplit or OBS match what is in the **ExtraLifeHelper.html** file. After you change the values in your streaming software, don't forget to update the html file! 

For OBS Studio, avoid resizing the Helper by dragging it. Open the properties and specify the values there until the size is what you want. This is because resizing by dragging will not update the values in the properties and so you won't know what to set in the html file.

### Color Themes, Borders and Sound

There are a few more options for customizing the Helper to suit your streaming setup.

* **Color Themes**: There are four color themes available that respect the Extra Life brand guidelines.
![](https://github.com/username/repository/blob/master/images/themes.jpg)
The values that can be set are "blue1", "blue2", "white1", and "gray1".
* **Borders**: By default, there is a border with rounded corners. You can change it to have square corners or remove it completely. The values are "rounded", "square", or "none".
* **Sounds**:
  * You can mute the Helper by removing references to sound files in the html file.
  * To use your own donation sounds, place your mp3, wav, or ogg files in the **audio** directory and update the html file.
        
These options can be changed in the ExtraLifeHelper.html file that you edited during the steps to personalize the Helper. 

### Example Videos

Coming soon...

### Troubleshooting

**You see a "CHECK CONFIG" message instead of your donation total.**

There are two common reasons for this:
* Your participant ID is not correct or you made an accidental typo.
* You are trying to use the Helper in an unsupported way. Please see the OBS Studio instructions for proper use.

**You see $0 for your donations received.**

There are a few known reasons for this:
* You haven't actually received any donations yet. Keep up the fundraising efforts!
* You got your first donation, but it hasn't registered fully on the Extra Life site. Just give it a few minutes to show up.
* The Extra Life website timed out when the Helper was trying to contact it. This can happen if the Extra Life website is under high load. Just be patient and the Helper will get the current total again when the Extra Life website responds.
* You are trying to use the Helper in an unsupported way. Please see the OBS Studio instructions for proper use.

**The Helper looks blurry.**

This is usually because you have streched the Helper in your presentation but forgot to update the width and height values in the **ExtraLifeHelper.html** file to match.

### Donations

It's been really rewarding to see the Helper being used by so many people who are raising money for a great cause. I do not expect anything in return, but if you are determined, you could always make a donation on my [Extra Life page](https://www.extra-life.org/participant/bread) since this is all For The Kids! Thank you!

### Modifying and Contributing Back

Because the source is freely available here, you are welcome to modify the Helper however you see fit. Some modifications that have been done by other participants so far include:

* Adding a third hour digit to the clock to support a 100+ hour long marathon
* Changing the fonts or color themes to match a stream presentation
* Adding a background image to match a steam presentation

If you make a change that you think would benefit all users of the Helper, please make a pull request and I would be happy to review it. Thank you!

### Contact

If you see any issues that are not covered in the troubleshooting section, please visit the [Helper forum thread](http://bit.ly/helper-forum) and I'll do my best to fix it quickly.

I'd also love to see the Helper being used on your stream. Let me know your broadcasting URL so I can watch and cheer you on during the marathon. Thanks, enjoy, and good luck with your fundraising for Extra Life!

Adam "Bread" Slesinger

Twitch: [http://www.twitch.tv/bread_man](http://www.twitch.tv/bread_man)
Extra Life: [https://extra-life.org/participant/bread](https://extra-life.org/participant/bread)
Steam: [https://steamcommunity.com/id/breadweb](https://steamcommunity.com/id/breadweb)
