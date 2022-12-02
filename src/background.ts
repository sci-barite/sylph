// Global objects I couldn't eliminate yet. LancerNumbers can be replaced by localStorage, but can't find an alternative for the animation.
const LancerNumbers : {[key: string]: number} = {};
const SylphAnimation : {[key: string]: number} = {};

// Quite a neat and simple animation function, although using a global object for state. I'd like to understand why it's a problem.
function SylphCasts(tabID: number, speed: number) {        
    if (SylphAnimation[tabID]) {
        chrome.action.setIcon({tabId: tabID, path: 'images/sylph-casts'+SylphAnimation[tabID]+'.png'});
        SylphAnimation[tabID] = (SylphAnimation[tabID] + 1) % 11 || 1; // We avoid a zero to keep a truthy value for the if statement!
        setTimeout(() => SylphCasts(tabID, speed), speed); // Sylph spell-casting animation for the win!!
    }
}

// Needed for SylphSpells, or it will keep trying to animate the icon in the tab forever. Maybe there's a way to do this without globals?
chrome.tabs.onRemoved.addListener(tabID => { 
    if (SylphAnimation[tabID]) delete SylphAnimation[tabID];
    if (LancerNumbers[tabID]) delete LancerNumbers[tabID];
})

// This is not very useful, because it doesn't allow for changes in the title, only in the icon and only through canvas.
chrome.runtime.onInstalled.addListener(()=> {
    console.log('🧚‍♀️ Sylph awaits your orders!');
    chrome.action.disable();
    const AwakeSylph = {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({ pageUrl: { hostSuffix: '.linkedin.com', pathPrefix: '/in' } }),
          new chrome.declarativeContent.PageStateMatcher({ pageUrl: { hostSuffix: '.linkedin.com', pathPrefix: '/jobs/view' } }),
          new chrome.declarativeContent.PageStateMatcher({ pageUrl: { hostSuffix: 'djinni.co', pathPrefix: '/home/inbox' } }),
          new chrome.declarativeContent.PageStateMatcher({ pageUrl: { hostSuffix: '.upwork.com', pathPrefix: '/ab/applicants' } }),
          new chrome.declarativeContent.PageStateMatcher({ pageUrl: { hostSuffix: '.upwork.com', pathPrefix: '/freelancers' } }),
          new chrome.declarativeContent.PageStateMatcher({ pageUrl: { hostSuffix: '.apollo.io', pathPrefix: '/' } }),
        ],
        actions: [ new chrome.declarativeContent.ShowAction() ]
    };
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () { 
        chrome.declarativeContent.onPageChanged.addRules([AwakeSylph]); 
    });
});

// This is where the work happens: when a bookmark is created, we send a message to the content script, which will process the page.
chrome.bookmarks.onCreated.addListener((id, bookmark)=> {
    const url = bookmark.url!;  // Bookmarking works independently from the extension, so we have to check again the website.
    if (url.includes("in.com/in") || url.includes("in.com/jobs/view") || url.includes('o.io/?utm') || // We're into the whole brevity thing.
        url.includes("rk.com/ab/applicant") || url.includes("rk.com/free") || url.includes("ni.co/home/inbox") || url.includes('o.io/#')) {
        chrome.bookmarks.get((bookmark.parentId!), folder => {   // chrome.bookmarks.get is async: we need to act in its callback.
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                const tabID = tabs[0].id!;
                SylphAnimation[tabID] = 1; // Setup the animation for this tab only!
                SylphCasts(tabID, 150); // Starts the animation of the icon!
                const knownID = (LancerNumbers[tabID]) ? LancerNumbers[tabID] : '';
                chrome.tabs.sendMessage(tabID, { '🧚‍♀️': 'SiftSpell', '🗃️': tabID, '🌍': url, '💌': knownID, '📁': folder[0].title });
                console.log('🧚‍♀️ Bookmark created in "'+folder[0].title+'", Sylph is casting her spell from '+tabID+'...');
            });
        });
    }
});

// This used to be inside the listener below, but caused too much indentation to be comfortable.
function checkID(data: string, url: string, tabID: number) {
    const LancerIDs = data.split(',');    // Might be better to cache this in localStorage, but for now I want live changes.
    const JobID = url.split("view/")[1].replace('/', '');
    const JobIndex = LancerIDs.indexOf(JobID);
    delete SylphAnimation[tabID];   // Stops the animation
    if (JobIndex != -1) {
        LancerNumbers[tabID] = JobIndex;    // We record what will become the sheet row number to update. Might use lcoal storage later.
        chrome.action.setIcon({tabId: tabID, path: "images/sylph-hurt.png"});   // Would need a better icon for this!
        console.log("🧜‍♂️ Lancer knows this place! He wrote it as "+JobID+' in row '+(JobIndex+2));
        chrome.action.setTitle({tabId: tabID, title: "🧜‍♂️ Lancer knows this place!\nHe wrote it as "+JobID+' in row '+(JobIndex+2)+'\n'
            +"Click on the ⭐ to update it.\n"})
        return;
    }
    chrome.action.setIcon({tabId: tabID, path: "images/sylph32.png"});
    console.log("🧜‍♂️ Lancer doesn't know this place. The last he wrote was "+LancerIDs[LancerIDs.length - 1]);
    chrome.action.setTitle({tabId: tabID, title: "🧜‍♂️ Lancer doesn't know this place.\nThe last he wrote was "+LancerIDs[LancerIDs.length - 1]
        +'\n'+"Click on the ⭐ to add this!\n"})
}

// This reacts to the content script's actions; themselves triggered either by this background script's messages, or by the onLoad event.
chrome.runtime.onMessage.addListener(Msg => {
    switch(Msg['🧚‍♀️']) {
        case 'SpellSuccessful':    // Success!
            delete SylphAnimation[Msg['🗃️']];  // This stops the animation!
            chrome.action.setIcon({tabId: Msg['🗃️'], path: "images/sylph32.png"}); // Change back to default icon.
            console.log("🧚‍♀️ Sylph has casted her spell successfully!");
            chrome.action.setTitle({tabId: Msg['🗃️'], title: "🧜‍♂️ Lancer's response was:\n\n"+Msg['🧜‍♂️']+'\n'});
            break;
        case 'SpellFailed': // This is an error.
            delete SylphAnimation[Msg['🗃️']];  // This stops the animation!
            chrome.action.setIcon({tabId: Msg['🗃️'], path: "images/sylph-hurt.png"}); // Stops animation, puts hurt icon.
            console.log("🧚‍♀️ Sylph has miscasted!");
            if (Msg['🧜‍♂️'])
                chrome.action.setTitle({tabId: Msg['🗃️'], title: "🧚‍♀️ Sylph has miscasted!\n🧜‍♂️ Lancer's response was:\n\n"+Msg['🧜‍♂️']+'\n'});
            else chrome.action.setTitle({tabId: Msg['🗃️'], title: "🧚‍♀️ Sylph has miscasted!\nLancer could not be summoned!\n"});
            break;
        case 'LancerSummon':   // This happens when we load a job page: Lancer sends us uniqueIDs, so we know what entry to update.
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {  // This time we need to find the tab: content scripts can't.
                const tabID = tabs[0].id!;
                SylphAnimation[tabID] = 1; // Setup the animation for this tab only!
                SylphCasts(tabID, 60);  // Starts the animation of the icon!
                console.log('🧚‍♀️ Sylph is summoning 🧜‍♂️ Lancer...');
                fetch(Msg['🧜‍♂️']+'url=GetUniqueJobs').then((response) => response.text()).then((data) => { checkID(data, Msg['🌍'], tabID); });
            });
            break;
    }
});
