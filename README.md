<h1 align=center>Slackli</h1>
<h3 align=center>Slack + CLI = Slackli</h3>

**Note: Slackli is currently a work in progress!**

Slackli is a basic Slack API library you can run from the command line. Use it to

-   send messages (in channels or DMs)
-   set your status
-   update your active/away presence
-   update profile data:
    -   title

## Installation

Note: Installation is a bit of a pain at the moment, but Slack has some beta API endpoints that should make the process much smoother in the future.

**Step 1:** Clone the repo

`git clone https://github.com/chad1008/slackli.git`

**Step 2:** Create your Slack app  
Slackli needs to interact with Slack as an app, so you'll want to set one up! First, open your new `slackli` directory, and copy the contents of `manifest.json`.

Next, visit https://api.slack.com/apps and click the button to create a new app. Select the option to create the app _from an app manifest_. Choose your workspace/team and then you should be presented with a basic starter manifest.

Switch to the JSON tab and replace the demo content by pasting in your `manifest.json` content. Review the summary, click 'Create,' and you'll have a brand new Slack app ready to install.

**Step 3:** Install and authenticate your app  
Slackli will need two pieces of authentication data. First, after creating your app, scroll down and copy the **Signing Secret**. Save that secret as an environment variable in your local shell:

`export SLACK_SIGNING_SECRET='abcdefghij1234567890'`

Next, go ahead and install your app. Back on the page where you grabbed the signing secret, look for the option to Install App in the left hand sidebar. Proceed through the installation flow, and then copy the **User OAuth Token** that's presented.

Set this key as another environment variable in your local shell:

`export SLACK_USER_TOKEN='xoxp-xxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'`

To avoid having to re-export these whenever you launch a new shell, you can add the two export commands to `~/.bashrc` or `~/.zshrc`, or any other file your shell sources upon launch.

## Usage

To initialize Slackli, you'll run commands beginning with `slackli` followed by the task you want to perform, plus any additional arguments/details.

### Update presence

`slackli active` or `slackli away` (note: setting yourself to 'active' actually uses Slack's 'auto' presence. Slack will auto-detect idle periods just like normal even if you set yourself as 'active' from the command line).

You can also set your presence within any of the other commands below by adding the `--active` or `--away` flag. This way you can easily send a message/status/etc. and update your presence all in a single command.

### Sending Messages

`slackli send [recipient] [text]`

`recipient` can be any channel or user. `text` will be your message text. Remember to wrap messages longer than one word in quotes!

### Set Status

`slackli status [:emoji:] [status text] [expiration (optional)]`

-   `emoji` should be wrapped in `:` characters (don't worry if you forget, Slackli has your back!)
-   `status text` will be your status text. Remember to wrap statuses longer than one word in quotes!
-   `expiration` this optional argument sets your status' expiration date/time. You can enter things like 'Tomorrow' or '45 minutes.' Most common date strings should work. As always, remember to wrap strings longer than a single word in quotes.

### Update Profile Title

`slackli title [title text]`

This one is fairly self explanatory, and is included if (like me) you like to append additional info to your title on your profile. As always, longer strings need quotation.

### Tips

**Alternate command names**  
Some commands have alternate names. `send` can also be invoked with `message` or `m`.

`slackli active` can also be called as `slackli auto` if that's more familiar to you.

**Nested commands**  
Because Slackli runs in the command line, you can pair it with other commands to implement their functionality. For example, let's say you have a local function named `randomTeammate` that generates a random name from a list of your teammates. You could use that command within a Slackli command using a subshell:

`slackli send team-channel "Hey $(randomTeammate), are you up for taking notes in today's meeting?"`

**Channel & User names**  
Don't prepend channels and users with `#` or `@` as you would if you were actually in Slack. For one thing, Slack's API doesn't use them, it just wants the name itself. For another... this is a command line tool. `#` characters will just lead to your input being ignored as a comment.

I'll update in the future so Slackli knows to automatically strip those for you in case you forget, but for now try to remember to leave them off.

**Aliases**  
In the future, I plan to build in functionality to make commands you run regularly easier to access, but for now you can leverage local shell aliases to really streamline Slackli commands you run a lot.

### Coming Soon™

Some additional plans for the future:

-   Clear your status
-   Nicknames for users/channels (so they're easier to remember/type)
-   Multiple workspace support
-   Routines (chain multiple commonly used commands together)
-   Scheduled/recurring tasks
-   More streamlined/automated app creation (dependent on API developments)
