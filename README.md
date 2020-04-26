# The Schedul-o-matic-9000

*Not your mother's Salesforce scheduler*

Always wanted to schedule jobs in Salesforce but without all the pain and heartache? Now you can schedule with a :smile: with the Schedul-o-matic 9000!

Schedule any global class that implements either the `Schedulable` or `Batchable` interface, or select a class that implements both interfaces and be given the option of which job you'd like to run!

You can also schedule flows and... wait for it... wait for it... you can also schedule blocks of anonymous code! *(WAT?!)*

Watch the highlights on the Youtube. The pickle is your friend (unless you make him angry. You won't like him when he's angry.)

[![Youtube link to Schedul-o-matic 9000](http://img.youtube.com/vi/fX3KiqsyT6k/0.jpg)](http://www.youtube.com/watch?v=c_KeluilBcs)

## Installation ##

**Install from the AppExchange**

Install the Schedul-o-matic 9000 from the Salesforce AppExchange to take advantage of spiffy (yes, spiffy) package upgrades!

https://appexchange.salesforce.com/appxListingDetail?listingId=a0N3A00000FZ981UAD



**Install from this repository**

Push the code from this repository directly into your Salesforce org and gain the ability to schedule not only global schedulable and batchable classes, but public ones as well!


## Setup ##

### Permissions ###

A user must be assigned the Schedul-o-matic 9000 User permission set to use the Schedul-o-matic 9000. Any user who tries to use the Schedul-o-matic 9000 without the required permission risks facing off against a dancing Mexican pickle. You have been forewarned.

![Screenshot of dancing Mexican pickle removed to avoid trauma](/readme-extras/removed-pickle.png)

### Visibility Options ###

The Schedul-o-matic 9000 can be accessed via the App Launcher.

![Get to the Schedul-o-matic 9000 from the App Launcher](/readme-extras/app-launcher.gif)

It can also be added to the Lightning page of your choice using the Lightning App Builder.

![Add the Schedul-o-matic 9000 with the App Builder](/readme-extras/app-builder.gif)

Or even added as a tab to one or your existing apps.

![Add the Schedul-o-matic 9000 tab to an existing app](/readme-extras/new-tab.gif)

Finally, the Schedul-o-matic 9000 can be added to an app's Utility Bar and be accessed from anywhere.

![Add the Schedul-o-matic 9000 tab to the Utility Bar](/readme-extras/utility-bar.gif)

## Usage ##

### Scheduling classes ang general scheduling configuration ###

Typing in the class lookup box will return any matching global (or public if you've installed the package from the Git repo) classes that implement the `Batchable` and/or `Schedulable` interfaces. You must then configure when and how often you wish the code in that class to run.

You can choose to run a job on an interval, say, every hour. If you do input a repeat interval, you can specify an end date and time, or you can leave that field empty and the job will repeat on your specified interval until the sun explodes. (It's been fun.)

If you choose to run a job just once, you can select the *Run daily?* checkbox to run the job at the same time every day.

If you *do* select a repeat interval, you can also choose the end date and time to be later that same day. If you do that, you will again have the option to run the job daily, so for example, you can configure a job to run every 30 minutes, every day between 2 pm and 5 pm, until next Thursday.

If you have selected a batch class, you will have the option to override the standard Salesforce batch size—2000 at the time of publishing.

For batch jobs, you can input a *reschedule interval*, which determines when the job will be re-attempted if the batch queue is full or if the previous iteration of the job has yet to complete.

### Scheduling flows ###

The flow picker allows you to select from any “autolaunchable” flow. The remainder of the scheduling functionality works as specified in the previous section on scheduling classes.

**NOTE:** System Admininstrators have the ability to deny acccess to individual flows to specific profiles, albeit with autolaunched flows, this is a rare use case. There is no way at present to programmatically determine whether a profile has been denied access to a flow, therefore, all autolaunched flows are available in the flow picker. If the scheduling user does not have access to the selected flow, the job will fail upon execution.

### Scheduling anonymous code ###

Enter whatever code you desire to run into the text box. The remainder of the scheduling functionality works as specified in the previous section on scheduling classes.

**NOTE:** Anonymous code executes under the permissions of the current user. Any attempt to execute code that the user does not have permission to run will fail upon execution.

### Editing a scheduled job ###

Every job scheduled in the Schedul-o-matic 9000 creates a Schedul-o-matic Entry record. You can edit the details of a scheduled job either before its initial run or inbetween runs if you have set a repeat interval.

Visit the Schedul-o-matric Entries tab via the link in the component (*Desktop only*) or directly by clicking on the tab itself, visible in the Schedul-o-matic 9000 app or if you added the Schedul-o-matric Entries tab to one of your other applications.

Editing a Schedul-o-matic Entry record allows you to change the configuration of your job for the next run, like the repeat interval, the end date and time, or even the anonymous code block.

![Reconfigure your scheduled job by editing a Schedul-o-matic entry record](/readme-extras/edit-entry.gif)

Each Schedul-o-matic Entry record also stores how many times that particular job has run in the *Number of Executions* field.

### The Schedul-o-matic 9000 on your phone ###

Visit the *Mobile Navigation* menu in Setup to configure the Schedul-o-matic 9000 to be accessible on mobile devices.

### Translating the Schedul-o-matic 9000 ###

Every iota of text visible in the Schedul-o-matic 9000 is available for translation. Enable the Translation Workbench and then go to *Custom Labels* in Setup. You can translate everything from form field labels to the Schedule button.

## Final thoughts ##

I hope you enjoy using the Schedul-o-matic 9000 as much as I enjoyed making it. Which shouldn't be too difficult. Heh. I'm kidding. (I'm half-kidding.)

<br>

***
**Overheard on the internet**

*“My mother could never schedule like this!”*