const SylphState = {Casting : false, Tab : 999, Spell : 1};
const LancerState = {ExistingID : '', UniqueIDs: ['']};
// I wonder if this is a better way to handle things than using vars, or the same. Ideally I should have one state per tab..?

function SylphCasts(speed : number) {               
    if (SylphState.Casting) {
        chrome.action.setIcon({tabId: SylphState.Tab, path: 'images/sylph-casts'+SylphState.Spell+'.png'});
        SylphState.Spell = (SylphState.Spell + 1) % 10;
        setTimeout(() => SylphCasts(speed), speed); // Sylph spell-casting animation for the win!!
    }
}

// If we don't do this, it will continue to try to animate the icon in that tab forever. How to manage this without globals?
// Do we need a new function just to check if a tab is "casting" or not?
chrome.tabs.onRemoved.addListener(tabID => {
    if (tabID == SylphState.Tab && SylphState.Casting == true) SylphState.Casting = false;
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

// This is the main way the extension works: when a bookmark is created, we send a message to the content script, which will process the page.
chrome.bookmarks.onCreated.addListener((id, bookmark)=> {
    const url = bookmark.url as string;
    if (url.includes("in.com/in") || url.includes("in.com/jobs/view") || url.includes('o.io/?utm') || // We're into the whole brevity thing.
        url.includes("rk.com/ab/applicants") || url.includes("rk.com/free") || url.includes("nni.co/home/inbox") || url.includes('o.io/#')) {
        chrome.bookmarks.get((bookmark.parentId!), folder => {   // chrome.bookmarks.get is async: we need to act in its callback.
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                SylphState.Tab = (tabs[0].id as number);
                SylphState.Casting = true;
                SylphCasts(150); // Starts the animation of the icon!
                chrome.tabs.sendMessage(SylphState.Tab, { name: 'Sylph', site: url, ex: LancerState.ExistingID, position: folder[0].title });
                console.log("🧚‍♀️ Bookmark created in '"+folder[0].title+"', Sylph is casting her spell...");
            });
        });
    }
});

// This reacts to the content script's actions, which are themselves triggered either by this background script's messages, or by the onLoad event.
chrome.runtime.onMessage.addListener(Sylph => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        SylphState.Tab = (tabs[0].id as number);
        if (Sylph.SpellSuccessful) {    // Success!
            SylphState.Casting = false;
            chrome.action.setIcon({tabId: SylphState.Tab, path: "images/sylph32.png"}); // Stops animation, puts default icon.
            console.log("🧚‍♀️ Sylph has casted her spell successfully!");
            chrome.action.setTitle({tabId: SylphState.Tab, title: "🧜‍♂️ Lancer's response was:\n\n"+Sylph.LancerResponse+'\n'});
        }
        else if (!Sylph.SpellSuccessful && !Sylph.Lancer) { // This is an error.
            SylphState.Casting = false;
            chrome.action.setIcon({tabId: SylphState.Tab, path: "images/sylph-hurt.png"}); // Stops animation, puts hurt icon.
            console.log("🧚‍♀️ Sylph has miscasted!");
            chrome.action.setTitle({tabId: SylphState.Tab, title: "🧚‍♀️ Sylph has miscasted!\n🧜‍♂️ Lancer's response was:\n\n"+Sylph.LancerResponse+'\n'});
        }
        else if (Sylph.Lancer) {    // This happens when we load a job page: Lancer sends us uniqueIDs, so we know what entry to update.
            SylphState.Casting = true;
            SylphCasts(60);
            console.log('🧚‍♀️ Sylph is summoning Lancer...');
            fetch(  'https://script.google.com/macros/s/AKfycbxMDCxoSFoZREabwctL86r1q8Hf5_iylcUxlZtL_4Y_dQrjwL9onaJ6G1SshfgCHqLq/exec?'+
                    'url=GetUniqueJobs')
             .then((response) => response.text())
             .then((data) => {
                LancerState.UniqueIDs = data.split(',');    // It overwrites the data everytime, to react to indexing changes on the sheet. Needed?
                const UniqueIDs = LancerState.UniqueIDs.length
                const JobID = Sylph.Place.split("view/")[1].replace('/', '');
                const JobIndex = LancerState.UniqueIDs.indexOf(JobID);
                if (JobIndex != -1) {
                    LancerState.ExistingID = JobIndex.toString();
                    SylphState.Casting = false; 
                    chrome.action.setIcon({tabId: SylphState.Tab, path: "images/sylph-hurt.png"});
                    console.log("🧜‍♂️ Lancer knows this place! He wrote it as "+JobID+' in row '+(parseInt(LancerState.ExistingID)+2));
                    chrome.action.setTitle({tabId: SylphState.Tab, 
                        title: "🧜‍♂️ Lancer knows this place!\nHe wrote it as "+JobID+' in row '+(parseInt(LancerState.ExistingID)+2)+'\n'
                                +"Click on the ⭐ to update it.\n"})
                }
                else {
                    LancerState.ExistingID = '';
                    SylphState.Casting = false;
                    chrome.action.setIcon({tabId: SylphState.Tab, path: "images/sylph32.png"});
                    console.log("🧜‍♂️ Lancer doesn't know this place. The last he wrote was "+LancerState.UniqueIDs[UniqueIDs - 1]);
                    chrome.action.setTitle({tabId: SylphState.Tab, 
                        title: "🧜‍♂️ Lancer doesn't know this place.\nThe last he wrote was "+LancerState.UniqueIDs[UniqueIDs - 1]
                                +'\n'+"Click on the ⭐ to add this!\n"})
                }
            });
        }
    });
});