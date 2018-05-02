package
{
	import com.adobe.serialization.json.JSON;
	
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.TimerEvent;
	import flash.external.ExternalInterface;
	import flash.geom.ColorTransform;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.system.Security;
	import flash.utils.Timer;

	[SWF(width='260', height='111', backgroundColor='#FFFFFF', frameRate='40')]
	public class ExtraLifeHelper extends Sprite
	{
		private const PRIMARY_URL:String = "http://www.extra-life.org/api/";
		// REMOVEME: Testing		
		//private const RELAY_URL:String = "http://www.breadweb.net/files/extralife/fake.php?format=json&cb={0}&fuseaction=";
		private const RELAY_URL:String = "http://www.breadweb.net/files/extralife/extra-life-relay.php?format=json&cb={0}&fuseaction=";
		private const DAYS_UNTIL:String = "DAYS UNTIL EXTRA LIFE:";
		private const HOURS_UNTIL:String = "HOURS UNTIL EXTRA LIFE:";
		private const HOURS_PLAYED:String = "TOTAL HOURS PLAYED:";
		private const ERROR_BAD_URL:String = "CHECK CONFIG";
		private const LOGO_PLAY_MARK:int = 60;
		private const CLOCK_TIMER_INTERVAL:int = 1000; // Interval that the countdown should be refreshed
		private const ACTION_TIMER_INTERVAL:int = 60000; // Interval that a new action should be taken
		private const DONATION_TIMER_INTERVAL:int = 60000; // Timer that fires when a new donation is shown
		private const KEY_TOTAL_RAISED_AMOUNT:String = "sumDonations";
		private const KEY_DONOR_NAME:String = "displayName";
		private const KEY_DONATION_AMOUNT:String = "amount";
		private const KEY_CREATED_ON:String = "createdDateUTC";
		
		private var participantInfoUrl:String = PRIMARY_URL + "participants/{1}";
		private var participantDonationsUrl:String = PRIMARY_URL + "participants/{1}/donations";
		private var teamInfoUrl:String = PRIMARY_URL + "teams/{1}";
		private var teamRosterUrl:String = PRIMARY_URL + "teams/{1}/participants";
		
		private var background:Background;
		private var debug:DebugView;
		private var clock:Clock;
		private var donation:Donation;
		private var logos:Logos;
		private var cheering:Cheering;
		private var cashRegister:CashRegister;
		private var participantId:String;
		private var isDebugEnabled:Boolean;
		private var teamId:String;
		private var isMuted:Boolean;
		private var isRelay:Boolean;
		private var isLightAlertEnabled:Boolean;
		private var startTime:Number;
		private var urlLoader:URLLoader;
		private var clockTimer:Timer;
		private var actionTimer:Timer;
		private var donationTimer:Timer;
		private var logoCounter:int = 0;
		private var lastRaised:Number = 0;
		private var shownDonors:Array;
		private var newDonors:Array;
		
		public function ExtraLifeHelper()
		{
			addEventListener(Event.ADDED_TO_STAGE, OnAddedToStage);
		}
		
		private function OnAddedToStage(evt:Event):void
		{
			removeEventListener(Event.ADDED_TO_STAGE, OnAddedToStage);
			Init();
		}	
		
		private function Init():void
		{
			Security.allowDomain("*");
			
			newDonors = new Array();
			
			urlLoader = new URLLoader();
			urlLoader.addEventListener(Event.COMPLETE, OnInfoLoaded);
			urlLoader.addEventListener(IOErrorEvent.IO_ERROR, OnRequestError);
						
			background = new Background();
			addChild(background);
			background.x = (stage.stageWidth - background.width) / 2;
			background.y = (stage.stageHeight - background.height) / 2;
			clock = new Clock();
			addChild(clock);
			donation = new Donation();
			addChild(donation);
			donation.visible = false;
			logos = new Logos();
			addChild(logos);
			
			cheering = new Cheering();
			cashRegister = new CashRegister();
			
			var params:Object = this.root.loaderInfo.parameters;
			
			participantId = params["participantID"];
			teamId = params["teamID"];
			
			var dateParts:Array = (params["startDate"])
				? (params["startDate"] as String).split("-")
				: ["11", "07", "2015"];
			var timeParts:Array = (params["startTime"])
				? (params["startTime"] as String).split(":")
				: ["10", "00", "00"];
			
			isMuted = params["mute"] == 1;
			isRelay = params["relay"] == "true";
			isLightAlertEnabled = params["lightAlert"] == "true";
			isDebugEnabled = params["debug"] == "true";
			
			var theme:String = params["theme"];
			var border:String = params["border"];
			
			// REMOVEME: Testing
			//participantId = "204962";
			//teamId = "21121";
			//dateParts = ["10", "31", "2016"];
			//timeParts = ["12", "07", "00"];
			//isDebugEnabled = true;
			//isRelay = true;
			//isLightAlertEnabled = true;
			//theme = "blue1";
			//border = "none";
						
			if (isDebugEnabled)
			{
				debug = new DebugView();
				addChild(debug);						
			}
			
			DebugLog(isMuted + ", " + isRelay + ", " + isLightAlertEnabled + ", " + isDebugEnabled);			
			
			CustomizeAppearance(theme, border);			
			
			var startDate:Date = new Date(
				int(dateParts[2]),
				int(dateParts[0]) - 1,
				int(dateParts[1]),
				int(timeParts[0]),
				int(timeParts[1]),
				int(timeParts[2]));
			startTime = startDate.valueOf();	
			
			// If running in a browser using the provided HTML wrapper, the relay paramter will
			// be passed. In that case, the the relay server should be used for requests. This is
			// because the a cross-domain policy file does not exist on the Extra Life website.			
			if (isRelay)
			{
				participantInfoUrl = participantInfoUrl.replace(PRIMARY_URL, RELAY_URL);
				participantDonationsUrl = participantDonationsUrl.replace(PRIMARY_URL, RELAY_URL);
				teamInfoUrl = teamInfoUrl.replace(PRIMARY_URL, RELAY_URL);
				teamRosterUrl = teamRosterUrl.replace(PRIMARY_URL, RELAY_URL);				
			}
			
			// Substitute the participant and team IDs in the URLs.
			participantInfoUrl = participantInfoUrl.replace("{1}", participantId);
			participantDonationsUrl = participantDonationsUrl.replace("{1}", participantId);
			teamInfoUrl = teamInfoUrl.replace("{1}", teamId);
			teamRosterUrl = teamRosterUrl.replace("{1}", teamId);

			clockTimer = new Timer(CLOCK_TIMER_INTERVAL);
			clockTimer.addEventListener(TimerEvent.TIMER, OnClockTimer);
			clockTimer.start();	
			OnClockTimer(null);
			
			actionTimer = new Timer(ACTION_TIMER_INTERVAL);
			actionTimer.addEventListener(TimerEvent.TIMER, OnActionTimer);
			actionTimer.start();
			
			donationTimer = new Timer(DONATION_TIMER_INTERVAL);
			donationTimer.addEventListener(TimerEvent.TIMER, OnDonationTimer);			
			
			// REMOVEME: Testing
			//logoCounter = LOGO_PLAY_MARK - 2;
			
			DebugLog("Initialized!");
			
			OnActionTimer(null);			
		}
		
		// Updates all of the visuals based on the selected theme and border style.
		private function CustomizeAppearance(theme:String, border:String):void
		{
			switch (border)
			{
				case "square":
					background.border.gotoAndStop(2);
					background.fill.gotoAndStop(2);
					break;
				case "none":
					background.border.visible = false;
					background.fill.gotoAndStop(2);
				default:
					// Any other provided value is either rounded or unsupported.
					// No changes need to be made.
					break;
			}
			
			var darkBlue:ColorTransform = new ColorTransform();
			darkBlue.color = 0x1D4C6C;
			var lightBlue:ColorTransform = new ColorTransform();
			lightBlue.color = 0x28C0E8;
			var green:ColorTransform = new ColorTransform();
			green.color = 0x97C93D;
			var white:ColorTransform = new ColorTransform();
			white.color = 0xFFFFFF;			
			var gray:ColorTransform = new ColorTransform();
			gray.color = 0xBCBEC0;
			
			switch (theme)
			{
				case "blue1":
					background.fill.transform.colorTransform = darkBlue;
					background.border.transform.colorTransform = green;
					clock.raised.transform.colorTransform = white;
					clock.money.transform.colorTransform = white;
					clock.title.transform.colorTransform = white;
					clock.days.transform.colorTransform = green;
					clock.face.transform.colorTransform = green;
					donation.title.transform.colorTransform = white;
					donation.doner.transform.colorTransform = white;
					donation.money.transform.colorTransform = green;
					logos.extralife.logo.transform.colorTransform = white;
					logos.cmnh.logo.transform.colorTransform = white;	
					break;
				case "blue2":
					background.fill.transform.colorTransform = lightBlue;
					background.border.transform.colorTransform = darkBlue;
					clock.raised.transform.colorTransform = darkBlue;
					clock.money.transform.colorTransform = darkBlue;
					clock.title.transform.colorTransform = darkBlue;
					clock.days.transform.colorTransform = white;
					clock.face.transform.colorTransform = white;					
					donation.title.transform.colorTransform = darkBlue;
					donation.doner.transform.colorTransform = darkBlue;
					donation.money.transform.colorTransform = white;	
					logos.extralife.logo.transform.colorTransform = white;
					logos.cmnh.logo.transform.colorTransform = white;					
					break;
				case "gray1":
					background.fill.transform.colorTransform = gray;
					background.border.transform.colorTransform = darkBlue;	
					clock.raised.transform.colorTransform = darkBlue;
					clock.money.transform.colorTransform = darkBlue;
					clock.title.transform.colorTransform = darkBlue;
					clock.days.transform.colorTransform = white;
					clock.face.transform.colorTransform = white;	
					donation.title.transform.colorTransform = darkBlue;
					donation.doner.transform.colorTransform = darkBlue;
					donation.money.transform.colorTransform = white;	
					logos.extralife.logo.transform.colorTransform = white;
					logos.cmnh.logo.transform.colorTransform = white;					
					break;
				default:
					// Any other provided value is either whilte1 or unsupported.
					// No changes need to be made.
					break;				
			}
		}
		
		// Updates the clock text fields on every timer tick. There are three different 
		// displays based on comparing the start time of the event to the current time.
		private function OnClockTimer(evt:TimerEvent):void
		{
			var currentTime:Number = new Date().valueOf();
			var diff:Number = currentTime - startTime;
			var countingUp:Boolean;
			
			// If the difference is negative, the start time hasn't been hit or passed yet.
			// The difference is the amount of time left until the start time.
			if (diff < 0)
			{		
				diff *= -1;
				clock.title.text = HOURS_UNTIL;
				countingUp = false;
			}
			else				
			{
				clock.title.text = HOURS_PLAYED;
				countingUp = true;
			}
			
			var days:int = Math.floor(diff / 1000 / 60 / 60 / 24);
			
			// If there are three or more days left, the text will be updated to show how many 
			// days are left before the start time. Otherwise, we will show how the time which could
			// be counting down or up.
			if (days > 3 && !countingUp)
			{
				clock.title.text = DAYS_UNTIL;
				clock.days.text = days.toString();
				
				clock.days.visible = true;
				clock.face.visible = false;				
			}
			else
			{
				var hours:int = Math.floor(diff / 1000 / 60 / 60);
				diff -= hours * 1000 * 60 * 60;
				var minutes:int = Math.floor(diff / 1000 / 60);
				diff -= minutes * 1000 * 60;
				var seconds:int = Math.floor(diff / 1000);			
				
				var hourText:String = ZeroPad(hours);
				var minuteText:String = ZeroPad(minutes);
				var secondText:String = ZeroPad(seconds);
				
				// Special case for streams that might go longer than 99 hours.
				hourText = hourText.substr(hourText.length - 2);
							
				clock.face.clock6.text = hourText.substr(0, 1);
				clock.face.clock5.text = hourText.substr(1);
				clock.face.clock4.text = minuteText.substr(0, 1);
				clock.face.clock3.text = minuteText.substr(1);
				clock.face.clock2.text = secondText.substr(0, 1);
				clock.face.clock1.text = secondText.substr(1);	
				
				clock.days.visible = false;
				clock.face.visible = true;				
			}
		}	
		
		// When called, will trigger the new donation animation, show the logos
		// or poll the participant / team data for new information.
		private function OnActionTimer(evt:TimerEvent):void
		{
			// First check to see if we should be showing any new donations. This
			// has the highest priority over any other action.
			if (newDonors.length > 0)
			{				
				ShowNewDonor();
				if (isLightAlertEnabled)
				{
					ExternalInterface.call("flashLights");
				}
				return;
			}
			
			donation.visible = false;
			logos.visible = false;
			
			// Then check to see if we should be showing the logo animations
			// instead of requesting information from the Extra Life website.
			logoCounter++;
			DebugLog("Counter = " + logoCounter);
			if (logoCounter == LOGO_PLAY_MARK)
			{
				actionTimer.stop();				
				logoCounter = 0;
				clock.visible = false;
				logos.visible = true;
				logos.gotoAndPlay(2);
				addEventListener(Event.ENTER_FRAME, OnCheckForLogoEnd);
				return;
			}	
			
			clock.visible = true;
			
			// Otherwise, poll general info for player or team to see if total
			// amount raised has changed
			RequestGeneralInfo();		
		}
		
		private function ShowNewDonor():void
		{		
			actionTimer.stop();				
			donationTimer.start();			
			
			// Remove the item from the array since it won't be new after we show
			// it and add it to the current list of shown donators.
			var donorEntry:Object = newDonors.shift();
			shownDonors.push(donorEntry);
			
			var donationAmount:Number = donorEntry[KEY_DONATION_AMOUNT];
			var donorName:String = donorEntry[KEY_DONOR_NAME];
			
			donation.money.text = donationAmount > 0
				? FormatAmount(donationAmount)
				: "";
			donation.doner.text = donorName == null
				? "Anonymous"
				: donorName;
			donation.visible = true;
			clock.visible = false;
			if (!isMuted)
			{
				cheering.play();
				cashRegister.play();	
			}
			donation.play();
		}
		
		private function OnDonationTimer(evt:TimerEvent):void
		{
			DebugLog("End donation alert!");
			donationTimer.stop();
			actionTimer.start();
			OnActionTimer(null);
		}
		
		private function RequestGeneralInfo():void
		{
			var url:String = participantId
				? participantInfoUrl
				: teamInfoUrl;
			
			if (url != "")
			{
				// Add the time to the query string with a uniquely incrementing number so
				// it will bust the caching system for most browsers and the Extra Life
				// website will ignore it.
				url = url.replace("{0}", new Date().valueOf());
				
				DebugLog(url);
				
				var request:URLRequest = new URLRequest(url);
				urlLoader.load(request);	
			}
			else
			{
				clock.money.text = ERROR_BAD_URL;
			}			
		}
		
		private function OnInfoLoaded(evt:Event):void
		{	
			// If not showing the logos, we need to update the display based on the 
			// results from the web request.
			if (participantId)
			{
				ProcessParticipant(evt.target.data);
			}
			else
			{
				ProcessTeam(evt.target.data);
			}
		}		
		
		private function ProcessParticipant(json:String):void
		{		
			var data:Object;
			try 
			{
				data = com.adobe.serialization.json.JSON.decode(json);
			}
			catch (e:Error)
			{
				// A failure to parse the response is most likely because a bad
				// response was returned. That's likely due to a temporary network
				// problem so ignore it and try again later.
				return;
			}
			var raised:Number = data["totalRaisedAmount"];
			
			// REMOVEME: Testing
			//if (shownDonors == null)
			//{
			//	raised = 898.00;
			//}
					
			// If the amount raised is more than the last recorded value, then one or
			// more donations have come in since the last time the page was polled. This
			// is always true at startup, but the processing of donations will ensure
			// we don't treat all donations as new the first time.
			if (raised > lastRaised)
			{	
				clock.money.text = FormatAmount(raised);
				RequestDonationInfo();
				lastRaised = raised;
			}
		}
		
		private function RequestDonationInfo():void
		{
			var url:String = participantDonationsUrl;				
			url = url.replace("{0}", new Date().valueOf());
			
			DebugLog(url);			
			
			var request:URLRequest = new URLRequest(url);
			var loader:URLLoader = new URLLoader();
			loader.addEventListener(Event.COMPLETE, OnDonationsLoaded);
			loader.addEventListener(IOErrorEvent.IO_ERROR, OnRequestError);
			loader.load(request);
		}
		
		// This function will only be called if there are new donations
		// since the last time the general info was polled. 
		private function OnDonationsLoaded(evt:Event):void
		{
			var data:Array;
			try 
			{
				data = com.adobe.serialization.json.JSON.decode(evt.target.data) as Array;
			}
			catch (e:Error)
			{
				return;
			}	
			
			// If donators is null, this must be the first time getting the list so just
			// set shown donors to the value and exit instead of treating everything as new.
			if (shownDonors == null)
			{
				shownDonors = data;
				
				// REMOVEME: Testing
				//shownDonors.shift();
				
				return;
			}
			
			// Go through the list and see which ones are new and add them to the new donators list
			// so they can be displayed when the action timer ticks next.			
			for (var i:int = 0; i < data.length; i++)
			{
				var found:Boolean = false;
				for (var j:int = 0; j < shownDonors.length; j++)
				{
					// A unique ID is not provided by Extra Life for donations so the best
					// way to uniquely identify a donation is by who and when
					if (data[i][KEY_DONOR_NAME] == shownDonors[j][KEY_DONOR_NAME] &&
						data[i][KEY_CREATED_ON] == shownDonors[j][KEY_CREATED_ON])
					{
						found = true;
						break;
					}
				}
				
				if (!found)
				{
					newDonors.unshift(data[i]);
				}
			}
			
			// Assuming that we have new donators, show the first new one right away.
			ShowNewDonor();
		}			
		
		private function ProcessTeam(json:String):void
		{
			var data:Object;
			try 
			{
				data = com.adobe.serialization.json.JSON.decode(json);
			}
			catch (e:Error)
			{
				return;
			}			
			
			var raised:Number = data[KEY_TOTAL_RAISED_AMOUNT];
			if (raised > lastRaised)
			{
				clock.money.text = FormatAmount(raised);
				lastRaised = raised;
			}
		}
		
		private function OnRequestError(evt:IOErrorEvent):void
		{
			DebugLog("Page load error!");
		}		
		
		private function OnCheckForLogoEnd(evt:Event):void
		{
			if (logos.currentFrame >= logos.totalFrames)
			{
				logos.visible = false;
				clock.visible = true;
				removeEventListener(Event.ENTER_FRAME, OnCheckForLogoEnd);
				actionTimer.start();
				OnActionTimer(null);
			}
		}		
		
		private function FormatAmount(input:Number):String
		{
			return "$" + input.toFixed(2).toString().replace(/\d{1,3}(?=(\d{3})+(?!\d))/g , "$&,");
		}
			
		private function ZeroPad(value:int, length:int = 2):String	
		{
			var text:String = value.toString();
			while (text.length < length)
			{
				text = "0" + text;
			}
			return text;
		}	
		
		private function DebugLog(output:String):void
		{
			if (isDebugEnabled)
			{
				debug.debugText.text = output + "\n" + debug.debugText.text;
			}
			else
			{
				trace(output);
			}
		}		
	}
}