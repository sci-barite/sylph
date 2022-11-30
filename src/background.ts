// Global objects I couldn't eliminate yet... LancerNumbers could be replaced by localStorage, but can't find an alternative for the animation.
const LancerNumbers : {[key: string]: number} = {};
const SylphSpells : {[key: string]: number} = {};

function SylphCasts(tabID: number, speed: number) {        
    if (SylphSpells[tabID]) {
        chrome.action.setIcon({tabId: tabID, path: 'images/sylph-casts'+SylphSpells[tabID]+'.png'});
        SylphSpells[tabID] = (SylphSpells[tabID] + 1) % 11 || 1; // We avoid a zero so that we can keep a truthy value for the if statement!
        setTimeout(() => SylphCasts(tabID, speed), speed); // Sylph spell-casting animation for the win!!
    }
}

// If we don't do this, it will continue to try to animate the icon in that tab forever. How to manage this without globals?
chrome.tabs.onRemoved.addListener(tabID => { if (SylphSpells[tabID]) delete SylphSpells[tabID]; })

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

// This is the main way the extension works: when a bookmark is created, we send a message to the content script, which will process the page.
chrome.bookmarks.onCreated.addListener((id, bookmark)=> {
    const url = bookmark.url!;  // Bookmarking works independently from the extension, so we have to check again the website.
    if (url.includes("in.com/in") || url.includes("in.com/jobs/view") || url.includes('o.io/?utm') || // We're into the whole brevity thing.
        url.includes("rk.com/ab/applicants") || url.includes("rk.com/free") || url.includes("nni.co/home/inbox") || url.includes('o.io/#')) {
        chrome.bookmarks.get((bookmark.parentId!), folder => {   // chrome.bookmarks.get is async: we need to act in its callback.
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                const tabID = tabs[0].id!;
                SylphSpells[tabID] = 1;
                SylphCasts(tabID, 150); // Starts the animation of the icon!
                const knownID = (LancerNumbers[tabID]) ? LancerNumbers[tabID] : '';
                chrome.tabs.sendMessage(tabID, { name: 'Sylph', tab: tabID, site: url, ex: knownID, position: folder[0].title });
                console.log('🧚‍♀️ Bookmark created in "'+folder[0].title+'", Sylph is casting her spell from '+tabID+'...');
            });
        });
    }
});

// This reacts to the content script's actions; themselves triggered either by this background script's messages, or by the onLoad event.
chrome.runtime.onMessage.addListener(Sylph => {
    if (Sylph.SpellSuccessful) {    // Success!
        delete SylphSpells[Sylph.Tab];
        chrome.action.setIcon({tabId: Sylph.Tab, path: "images/sylph32.png"}); // Stops animation, puts default icon.
        console.log("🧚‍♀️ Sylph has casted her spell successfully!");
        chrome.action.setTitle({tabId: Sylph.Tab, title: "🧜‍♂️ Lancer's response was:\n\n"+Sylph.LancerResponse+'\n'});
    }
    else if (!Sylph.SpellSuccessful && !Sylph.Lancer) { // This is an error.
        delete SylphSpells[Sylph.Tab];
        chrome.action.setIcon({tabId: Sylph.Tab, path: "images/sylph-hurt.png"}); // Stops animation, puts hurt icon.
        console.log("🧚‍♀️ Sylph has miscasted!");
        chrome.action.setTitle({tabId: Sylph.Tab, title: "🧚‍♀️ Sylph has miscasted!\n🧜‍♂️ Lancer's response was:\n\n"+Sylph.LancerResponse+'\n'});
    }
    else if (Sylph.Lancer) {    // This happens when we load a job page: Lancer sends us uniqueIDs, so we know what entry to update.
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {  // This time we need to find the tab here: the content script can't.
            const tabID = tabs[0].id!;
            SylphSpells[tabID] = 1;
            SylphCasts(tabID, 60);
            console.log('🧚‍♀️ Sylph is summoning Lancer...');
            fetch(  'https://script.google.com/macros/s/AKfycbxMDCxoSFoZREabwctL86r1q8Hf5_iylcUxlZtL_4Y_dQrjwL9onaJ6G1SshfgCHqLq/exec?'+
                    'url=GetUniqueJobs')
             .then((response) => response.text())
             .then((data) => {
                const LancerIDs = data.split(',');    // Might be better to cache this in localStorage, but for now I want live changes.
                const JobID = Sylph.Place.split("view/")[1].replace('/', '');
                const JobIndex = LancerIDs.indexOf(JobID);
                if (JobIndex != -1) {
                    LancerNumbers[tabID] = JobIndex;
                    delete SylphSpells[tabID];
                    chrome.action.setIcon({tabId: tabID, path: "images/sylph-hurt.png"});
                    console.log("🧜‍♂️ Lancer knows this place! He wrote it as "+JobID+' in row '+(JobIndex+2));
                    chrome.action.setTitle({tabId: tabID, 
                        title: "🧜‍♂️ Lancer knows this place!\nHe wrote it as "+JobID+' in row '+(JobIndex+2)+'\n'
                                +"Click on the ⭐ to update it.\n"})
                }
                else {
                    delete SylphSpells[tabID];
                    chrome.action.setIcon({tabId: tabID, path: "images/sylph32.png"});
                    console.log("🧜‍♂️ Lancer doesn't know this place. The last he wrote was "+LancerIDs[LancerIDs.length - 1]);
                    chrome.action.setTitle({tabId: tabID, 
                        title: "🧜‍♂️ Lancer doesn't know this place.\nThe last he wrote was "+LancerIDs[LancerIDs.length - 1]
                                +'\n'+"Click on the ⭐ to add this!\n"})
                }
            });
        });
    }
});