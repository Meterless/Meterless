# FAQ

The questions people actually ask, before downloading and in the first week of using the app.

## What does this thing do, in one sentence?

It takes one prompt, runs it as many different ways as you ask for, side by side, on your computer, using whichever AI service you already have an account with.

## Why would I want many answers to the same prompt?

Because the first answer an AI gives you is rarely the best one. Running the same prompt ten times in a chat window means rephrasing the same idea ten times. Running it once here gives you ten meaningfully different angles to pick from. You read them, keep what works, and throw the rest away. Most people end up with a better final answer in less total time.

## Do I have to pay for this?

The app is free to download and use. You will need an API key from an AI provider, and most providers charge for usage. Google has a free tier that works for casual use. Some smaller providers and OpenRouter have free models too. You can use the app productively without spending a cent if you stay on those.

If you start running fifty variants of long prompts on premium models all day, you will spend money. That money goes to the provider, not to us. We do not see it.

## Web version or desktop version?

There are two ways to use the app. The web version runs at a URL in your browser. The desktop version is a Windows app you install (.msi or .exe installer). Both do the same things, and your data stays on the same machine in both cases. The desktop version is a little faster to launch, survives clearing your browser data, and adds two desktop-only features: agent web search/fetch tools and the mobile remote. Mac and Linux desktop installers are planned but not available yet.

You can use both, but they do not share data with each other. Skills can be exported from one install and imported into the other; artifacts can be downloaded and carried across by hand.

## Does it work offline?

The desktop version opens fully offline — the app is embedded in the installed binary, and your saved work lives in a local database, so you can browse and re-read everything you have done without a connection. The web version needs the network to load the page, but your saved work is stored locally in the browser, not on a server.

You cannot run new prompts offline in either version, because the models live in the cloud. This build reserves a slot for local WebLLM inference, but it is disabled, so there is no offline generation today.

## Is my data safe?

Your data does not leave your computer except as part of the prompts you actively send to your chosen AI provider. We do not have a database of your prompts. We do not have a copy of your files. There is no account system, so we do not even know who you are. The full breakdown is in [privacy](privacy.md).

The honest caveat: the AI provider you send a prompt to sees that prompt. Their privacy practices apply to whatever you send them. Pick providers whose terms you are comfortable with.

## What is the difference between this and just using ChatGPT or Claude directly?

A few things, depending on what matters to you.

The provider's web app gives you one answer per prompt. This app gives you many at the same time, with the angles already varied for you.

The provider's web app loses context the moment you start a new chat. This app remembers across sessions and quietly carries forward whatever is relevant.

The provider's web app shows you what they want to show you. This app is local software, so your prompts and results never sit on someone else's server in the way they do when you use a web app.

The provider's web app is hard to script or schedule. This app lets you set up runs to repeat on a schedule.

The provider's web app is locked to that provider. This app lets you switch between providers per run, or use a different one for each kind of work.

If you only ever need to ask one question at a time, you might not need this app. If you find yourself running the same kind of prompt over and over, or wanting to compare what different models say, or wanting your AI work to live on your own computer, this app exists for that.

## Can I use it for work things?

You can. The thing to think about is what your AI provider's terms say about the kind of content you are sending them. We do not see your prompts, so the question is really between you and them. The major providers' API terms (Google, OpenAI, Anthropic) usually allow business use and do not train on your inputs by default, but read their current terms to be sure for your case.

If you work in a regulated industry (healthcare, finance, legal), check with whoever handles compliance at your job before sending anything sensitive through any AI service, including this one.

## What happens if I delete the app?

For the desktop version, your data folder stays behind when you uninstall. Reinstalling later picks up where you left off. If you want everything gone, delete the data folder yourself. The path is in [privacy](privacy.md).

For the web version, closing the tab does nothing to your data. Clearing your browser's site data for our URL is what removes it. Doing that is permanent.

## Why is the first launch so slow?

The app sets up its local database, registers itself, and pre-loads things it needs. Up to about a minute on a slow machine. After that, subsequent launches are fast (usually under five seconds). If your second launch is still slow, see [troubleshooting](troubleshooting.md).

## Can I share my history with someone else?

Not as one bundle. Individual artifacts can be downloaded (HTML artifacts come as a self-contained zip) and sent to anyone, and your skills can be exported as a file that someone else can import into their own copy. Anything you share is a copy, not a link, so what they do with it does not affect your install.

## How do I report a bug?

Open an issue at [github.com/meterless/swarms/issues](https://github.com/meterless/swarms/issues). Tell us what you tried to do, what happened instead, your operating system, and the app version. A screenshot helps a lot.

## How do I report a security problem?

Do not open a public issue. Report it privately through the Security tab on the [GitHub repository](https://github.com/meterless/swarms) (a private vulnerability report / security advisory). We take these seriously.

## Is there a mobile app?

There is no standalone mobile app. What ships today is a mobile remote built into the desktop version: the desktop shows a QR code, your phone scans it, and the two connect directly over your local network (WebRTC, no cloud relay). From the phone you can submit and enhance prompts and watch live run state mirrored from the desktop. The desktop app does the actual work.
