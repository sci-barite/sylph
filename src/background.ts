const Icon = ['images/sylph32.png', 'images/sylph-hurt.png'];
// Simpler than Session Storage...
const Stash: {[key: string]: string[]} = {};
const Known: {[key: number]: number} = {}; 

// The array below rebuilds the matches in the manifest in a way that can be used by both the bookmark listener and the PageStateMatcher!
const MagicalLands: string[] = chrome.runtime.getManifest().content_scripts![0].matches!.map(site => site.split('//')[1].replaceAll('*', ''));

// A new way of doing the animation, slightly more verbose, but providing clear methods to start and stop. Not sure how much better this is.
const SylphAnimation: {Tabs: {[key: number]: number}, '▶️': (tabID: number, speed: number) => void, '⏹️': (tabID: number) => void} = {
    Tabs: {},
    '▶️': function(tabID: number, speed: number) {                    // Play emoji to play the animation!
        this.Tabs[tabID] = 1;
        const Animate = (tabID: number, speed: number) => {             // Arrow declaration was needed to have the right scope for "this".
            if (!this.Tabs[tabID]) return;                              // Avoiding a level of indentation with a negative condition.
            chrome.action.setIcon({tabId: tabID, path: 'images/sylph-casts'+this.Tabs[tabID]+'.png'});
            this.Tabs[tabID] = (this.Tabs[tabID] + 1) % 11 || 1;        // We avoid a zero to keep a truthy value for the if!
            setTimeout(() => Animate(tabID, speed), speed);             // Sylph spell-casting animation for the win!!
        };
        Animate(tabID, speed);
    },
    '⏹️': function (tabID: number) { delete this.Tabs[tabID]; }        // Stop emoji to stop the animation!
};

// Needed for SylphAnimation, or it will keep trying to animate the icons of closed tabs forever.
chrome.tabs.onRemoved.addListener(tabID => SylphAnimation['⏹️'](tabID));

// This is not very useful, because it doesn't allow for changes in the title, only in the icon and only through canvas.
chrome.runtime.onInstalled.addListener(()=> {
    chrome.action.disable();
    const AwakeSylph: {conditions: chrome.declarativeContent.PageStateMatcher[], actions: any[]} = {
        conditions: MagicalLands.map(land => new chrome.declarativeContent.PageStateMatcher(
            {pageUrl: { hostSuffix: land.substring(0, land.indexOf('/')), pathPrefix: land.substring(land.indexOf('/')) }}
        )),
        actions: [ new chrome.declarativeContent.ShowAction() ]
    };
    chrome.declarativeContent.onPageChanged.removeRules(undefined, ()=> { chrome.declarativeContent.onPageChanged.addRules([AwakeSylph]); });
    console.log('🧚‍♀️ Sylph can visit the following lands today... Awaiting orders!', AwakeSylph.conditions);
});

// This is where the work happens: when a bookmark is created, we send a message to the content script, which will process the page.
chrome.bookmarks.onCreated.addListener((id, bookmark)=> {   // Bookmarking works independently, so we have to check again the website.
    if (!MagicalLands.some(site => bookmark.url!.includes(site))) return;   // Aborts on negative rather than executing conditionally.
    chrome.bookmarks.get((bookmark.parentId!), folder => {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            const tabID = tabs[0].id!;
            SylphAnimation['▶️'](tabID, 120);
            chrome.tabs.sendMessage(tabID, {'🧚‍♀️': 'SiftSpell', '🗃️': tabID, '🌍': bookmark.url, '💌': Known[tabID], '📁': folder[0].title});
            console.log('🧚‍♀️ Bookmark created in "'+folder[0].title+'", Sylph is casting her spell from '+tabID+'...');
        });
    });
});

// I found myself repeating this pattern, so I made a utility function.
function Shout(Msg: {[key: string]: any}, text: string, additional?: string) {
    Msg['✔️'] ^ Msg['🧜‍♂️'] ? console.warn(text, Msg) : console.log(text, Msg);
    chrome.action.setTitle({tabId: Msg['🗃️'], title: text + (additional ? additional : '\n')});
    setTimeout(() => SylphAnimation['⏹️'](Msg['🗃️']), 1080); //  Delayed to make it visible when Stash values are retrieved too quickly.
    setTimeout(() => chrome.action.setIcon({tabId: Msg['🗃️'], path: Icon[Msg['✔️'] ^ Msg['🧜‍♂️']]}), 1200);
}

// This used to be inside the listener below, but caused too much indentation to be comfortable.
function checkID(data: string | string[], Msg: {[key: string]: any}) {
    if (!Array.isArray(data)) Stash['🗄️'+Msg['🗄️']] = JSON.parse(data);
    const ID = Msg['🌍'].includes('jobs/') ? Msg['🌍'].split('/view/')[1].substring(0,10) : 
        (Msg['🌍'].includes('?') ? Msg['🌍'].split('/in/')[1].split('/?')[0] : Msg['🌍'].split('/in/')[1].replace('/', ''));
    const [LastID, Index] = [Stash['🗄️'+Msg['🗄️']][Stash['🗄️'+Msg['🗄️']].length - 1], Stash['🗄️'+Msg['🗄️']].indexOf(ID)];
    if (Index != -1) {
        [Known[Msg['🗃️']], Msg['✔️']] = [Index as number, true];
        Shout(Msg, "🧜‍♂️ Lancer knows this place! He wrote it as "+ID+" in row "+(Index + 2), "\nClick on the ⭐ to update it.\n");
    }
    else Shout(Msg, "🧜‍♂️ Lancer doesn't know this place. The last he wrote was "+LastID, "\nClick on the ⭐ to add this!\n");
}

// This reacts to the content script's actions; themselves triggered either by this background script's messages, or by the onLoad event.
chrome.runtime.onMessage.addListener(Msg => {
    if      (Msg['✔️']) Shout(Msg, "🧚‍♀️ Sylph has casted her spell successfully!", "\n🧜‍♂️ Lancer's response was:\n\n"+Msg['✔️']+'\n');
    else if (Msg['❓']) Shout(Msg, "🧚‍♀️ Sylph has lost Lancer!\n🧜‍♂️ He's left a clue:\n\n"+Msg['❓']);
    else if (Msg['❌']) Shout(Msg, "🧚‍♀️ Sylph has miscasted!\n\n"+Msg['❌']);
    if      (Msg['🧚‍♀️']) return; // It's an extra check, but it saves us from an extra indentation...
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {  // This time we need to find the tab: content scripts can't.
        [Msg['🗃️'], Msg['🗄️']] = [tabs[0].id!, Msg['🌍'].split('.com/')[1].split('/')[0]];
        const param = 'url=GetUnique'+(Msg['🗄️'] == 'jobs' ? 'Jobs' : 'Cands');
        SylphAnimation['▶️'](Msg['🗃️'], 60); // Double time animation, to represent a quick lookup.
        console.log('🧚‍♀️ Sylph is summoning 🧜‍♂️ Lancer...');
        (Stash['🗄️'+Msg['🗄️']]) ? checkID(Stash['🗄️'+Msg['🗄️']], Msg) :
            fetch(Msg['🧜‍♂️']+param).then((response) => response.text()).then((data) => { checkID(data, Msg); });
    });
});
