const LancerCache : {Ready: string, Data: string[], [key: number]: number} = {Ready: '🚫', Data: []}; // Could use SessionStorage?
const LandMap: {[key: string]: string[]} = {   // We are "into the whole brevity thing". Used by both PageStateMatchers and bookmark listener.
    '.linkedin.com' : ['/in', '/jobs/view'], 
    '.upwork.com'   : ['/ab/applicants','/freelancers'], 
    'djinni.co'     : ['/home/inbox'], 
    '.apollo.io'    : ['/']
};
const MagicalLands : string[] = Object.values(LandMap).flatMap((lands, i) => lands.map(prefix => Object.keys(LandMap)[i]+prefix)); // Whoa!

// A new way of doing the animation, slightly more verbose, but providing clear methods to start and stop. Not sure how much better this is.
const SylphAnimation : {Tabs: {[key: number]: number}, '▶️': (tabID: number, speed: number) => void, '◼️': (tabID: number) => void} = {
    Tabs : {},
    '▶️' : function(tabID: number, speed: number) {
        this.Tabs[tabID] = 1;
        const Animate = (tabID: number, speed: number) => {             // Arrow declaration was needed to use 'this', to access Tabs.
            if (this.Tabs[tabID]) {
                chrome.action.setIcon({tabId: tabID, path: 'images/sylph-casts'+this.Tabs[tabID]+'.png'});
                this.Tabs[tabID] = (this.Tabs[tabID] + 1) % 11 || 1;    // We avoid a zero to keep a truthy value for the if!
                setTimeout(() => Animate(tabID, speed), speed);         // Sylph spell-casting animation for the win!!
            }
        };
        Animate(tabID, speed);
    },
    '◼️' : function (tabID: number) { delete this.Tabs[tabID]; },
};

// Needed for SylphAnimation, or it will keep trying to animate the icons of closed tabs forever.
chrome.tabs.onRemoved.addListener(tabID => { SylphAnimation['◼️'](tabID); delete LancerCache[tabID]; });

// This is not very useful, because it doesn't allow for changes in the title, only in the icon and only through canvas.
chrome.runtime.onInstalled.addListener(()=> {
    chrome.action.disable();
    const AwakeSylph : {conditions: chrome.declarativeContent.PageStateMatcher[], actions: any[]} = {
        conditions: MagicalLands.map(land => new chrome.declarativeContent.PageStateMatcher({ 
            pageUrl: { hostSuffix: land.substring(0,land.indexOf('/')), pathPrefix: land.substring(land.indexOf('/')) } 
        })),
        actions: [ new chrome.declarativeContent.ShowAction() ]
    };
    chrome.declarativeContent.onPageChanged.removeRules(undefined, ()=> { chrome.declarativeContent.onPageChanged.addRules([AwakeSylph]); });
    console.log('🧚‍♀️ Sylph can visit the following lands today... Awaiting orders!', AwakeSylph.conditions);
});

// This is where the work happens: when a bookmark is created, we send a message to the content script, which will process the page.
chrome.bookmarks.onCreated.addListener((id, bookmark)=> {   // Bookmarking works independently, so we have to check again the website.
    if (!MagicalLands.some(site => bookmark.url!.includes(site))) return;
    chrome.bookmarks.get((bookmark.parentId!), folder => {  // chrome.bookmarks.get is async: we need to act in its callback.
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            const tabID = tabs[0].id!;
            SylphAnimation['▶️'](tabID, 150);
            const knownID = (LancerCache[tabID]) ? LancerCache[tabID] : '';
            chrome.tabs.sendMessage(tabID, { '🧚‍♀️': 'SiftSpell', '🗃️': tabID, '🌍': bookmark.url, '💌': knownID, '📁': folder[0].title });
            console.log('🧚‍♀️ Bookmark created in "'+folder[0].title+'", Sylph is casting her spell from '+tabID+'...');
        });
    });
});

// I found myself repeating this pattern, so I made a utility function. The emojis might well be too many...
function Status(success: boolean, tabID: number, message: string, additional?: string) {
    chrome.action.setIcon({tabId: tabID, path: (success ? "images/sylph32.png" : "images/sylph-hurt.png")});
    console.log(message);
    chrome.action.setTitle({tabId: tabID, title: message + (additional ? additional : '\n')});
}

// This used to be inside the listener below, but caused too much indentation to be comfortable.
function checkID(data: string | string[], url: string, tabID: number) {
    if (!Array.isArray(data)) [LancerCache.Data, LancerCache.Ready] = [data.split(','), '✅'];
    const JobID = url.split("view/")[1].replace('/', '');
    const [JobIndex, LastJob] = [LancerCache.Data.indexOf(JobID), LancerCache.Data[LancerCache.Data.length - 1]];
    SylphAnimation['◼️'](tabID);
    if (JobIndex != -1) {
        LancerCache[tabID] = JobIndex;    // We record what will become the sheet row number to update. Might use lcoal storage later.
        Status(true, tabID, "🧜‍♂️ Lancer knows this place! He wrote it as "+JobID+" in row "+(JobIndex+2), "\nClick on the ⭐ to update it.\n");
        return;
    }
    Status(false, tabID, "🧜‍♂️ Lancer doesn't know this place. The last he wrote was "+LastJob, "\nClick on the ⭐ to add this!\n");
}

// This reacts to the content script's actions; themselves triggered either by this background script's messages, or by the onLoad event.
chrome.runtime.onMessage.addListener(Msg => {
    switch(Msg['🧚‍♀️']) {
        case 'SpellSuccessful':    // Success!
            SylphAnimation['◼️'](Msg['🗃️']);
            Status(true, Msg['🗃️'], "🧚‍♀️ Sylph has casted her spell successfully!", "\n🧜‍♂️ Lancer's response was:\n\n"+Msg['🧜‍♂️']+"\n");
            break;
        case 'SpellFailed': // This is an error.
            SylphAnimation['◼️'](Msg['🗃️']);
            Status(false, Msg['🗃️'], "🧚‍♀️ Sylph has miscasted!\n🧜‍♂️ Lancer's response was:\n\n"+Msg['🧜‍♂️']);
            break;
        case 'LancerSummon':   // This happens when we load a job page: Lancer sends us uniqueIDs, so we know what entry to update.
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {  // This time we need to find the tab: content scripts can't.
                const tabID = tabs[0].id!;
                SylphAnimation['▶️'](tabID, 60);
                console.log('🧚‍♀️ Sylph is summoning 🧜‍♂️ Lancer...');
                if (LancerCache.Ready === '✅') { checkID(LancerCache.Data, Msg['🌍'], tabID); return; }    // Implementing some caching!
                fetch(Msg['🧜‍♂️']+'url=GetUniqueJobs').then((response) => response.text()).then((data) => { checkID(data, Msg['🌍'], tabID); });
            });
            break;
    }
});
