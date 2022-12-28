// This is a big change: loading all the icons in memory from the start, using OffscreenCanvas to avoid slowdowns. It should be faster.
const preloadImageData = async (icon: string) => {
    const response = await fetch(`images/sylph${icon}`), blob = await response.blob(), img = await createImageBitmap(blob);
    const [width, height] = [img.width, img.height], ctx = new OffscreenCanvas(width, height).getContext('2d');
    ctx!.drawImage(img, 0, 0, width, height);
    return ctx!.getImageData(0, 0, width, height);
}

// Keeping an array of icon names, and one of ImageData. Even if async, attributing each to its own index in the array ensures the wanted order.
const Icons: ImageData[] = [], IconNames: string[] = ['32.png', '-hurt64.png', ...Array.from({length: 10}, (_elem, n) => `-casts${n}.png`)];
IconNames.forEach(async function(iconName, index) {Icons[index] = await preloadImageData(iconName)});   // Going around a Service Worker limit.

// Simpler than Session Storage... Might also start loading data here from the beginning instead of waiting for the first request.
const Stash: {[key: string]: string[]} = {}, Known: {[key: number]: number} = {};

// The arrays below rebuild the matches in the manifest in a way that can be used by both the bookmark listener and the PageStateMatcher!
const MagicalLands: string[] = chrome.runtime.getManifest().content_scripts![0].matches!.map(site => site.split('//')[1].replaceAll('*', ''));
const IndexedLands: string[] = MagicalLands.slice(0,2); // Selecting here the ones we have indexes for. Might combine with Stash/Known above.
const LandMap = MagicalLands.map(land => ({hostSuffix: land.substring(0, land.indexOf('/')), pathPrefix: land.substring(land.indexOf('/'))}));
const HostMap = LandMap.map(host => host.hostSuffix.slice(0,-3).replaceAll('.', ''));

// A new way of doing the animation, slightly more verbose, but providing clear methods to start and stop. Not sure how much better this is.
const SylphAnimation: {Tabs: {[key: number]: number}, '▶️': (tabID: number, speed: number) => void, '⏹️': (tabID: number) => void} = {
    Tabs: {},
    '▶️': function(tabID: number, speed: number) {                     // Play emoji to play the animation!
        this.Tabs[tabID] = 2;                                           // To have the icons all together, the animation 
        const Animate = (tabID: number, speed: number) => {             // Arrow declaration was needed to have the right scope for "this".
            if (!this.Tabs[tabID]) return;                              // Avoiding a level of indentation with a negative condition.
            chrome.action.setIcon({tabId: tabID, imageData: Icons[this.Tabs[tabID]]}); // Much faster than string-building a path to fetch.
            this.Tabs[tabID] = (this.Tabs[tabID] + 1) % 12 || 2;        // To have only one array of icons, we keep frames from index 2 to 11.
            setTimeout(() => Animate(tabID, speed), speed);             // Sylph spell-casting animation for the win!!
        };
        Animate(tabID, speed);
    },
    '⏹️': function(tabID: number) { delete this.Tabs[tabID]; }        // Stop emoji to stop the animation!
};

// This is not very useful, because it doesn't allow for changes in the title, only in the icon and only through canvas.
chrome.runtime.onInstalled.addListener(()=> {
    chrome.action.disable();
    const AwakeSylph: {conditions: chrome.declarativeContent.PageStateMatcher[], actions: any[]} = {
        conditions: LandMap.map(hostAndPrefix => new chrome.declarativeContent.PageStateMatcher({pageUrl: hostAndPrefix})),
        actions: [new chrome.declarativeContent.ShowAction()]
    };
    chrome.declarativeContent.onPageChanged.removeRules(undefined, ()=> {chrome.declarativeContent.onPageChanged.addRules([AwakeSylph])});
    console.log(`🧚‍♀️ Sylph can visit the following lands today... Awaiting orders!`, AwakeSylph.conditions);
});

// Needed for SylphAnimation, or it will keep trying to animate the icons of closed tabs forever.
chrome.tabs.onRemoved.addListener(tabID => SylphAnimation['⏹️'](tabID));

// A shortcut to reset a tab's icon and text to default.
function Silence(tabID: number) {
    SylphAnimation['⏹️'](tabID)  // This is only in case the previous action didn't finish, or there's been an unexpected error.
    chrome.action.setIcon({tabId: tabID, imageData: Icons[0]}); // We keep the default icon at index 0 for several reasons.
    chrome.action.setBadgeText({tabId: tabID, text: ''});
    chrome.action.setTitle({tabId: tabID, title: ''});
}

// Now it checks when URL changes without an actual page reload, which happens a lot on LinkedIn. Either resets the UI or makes a new search.
chrome.tabs.onUpdated.addListener((tabID, changeInfo) => {
    if (!changeInfo.url) return;
    if (!IndexedLands.some(indexed => changeInfo.url!.includes(indexed))) Silence(tabID);   // If page is not a type we got a DB for, Silence.
    else {
        SylphAnimation['⏹️'](tabID);     // Not strictly necessary, but good if we navigate out of a page before finishing the previous action.
        chrome.tabs.sendMessage(tabID, {'✨': true, '🗃️': tabID});  // Messaging content script just to get back a URL from the secret file...
    }
})

// This is where the work happens: when a bookmark is created, we send a message to the content script, which will process the page.
chrome.bookmarks.onCreated.addListener((_id, bookmark)=> {   // Bookmarking works independently, so we have to check again the website.
    if (!MagicalLands.some(site => bookmark.url!.includes(site))) return;   // Aborts on negative rather than executing conditionally.
    chrome.bookmarks.get((bookmark.parentId!), parent => {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            const tabID = tabs[0].id!, folder = parent[0].title, host = HostMap.find((host: string) => bookmark.url!.includes(host))!;
            Silence(tabID); // Precaution, so we don't get double time animations in case one was still going on, or old messages sticking.
            SylphAnimation['▶️'](tabID, 120);
            chrome.tabs.sendMessage(tabID, {'🧚‍♀️': true, '🗃️': tabID, '🗺️': host, '🌍': bookmark.url, '💌': Known[tabID], '📁': folder});
            console.log(`🧚‍♀️ Bookmark created in ${folder}, Sylph is casting her spell from ${tabID}...`);
        });
    });
});

// I found myself repeating this pattern, so I made a utility function.
function Shout(Msg: {[key: string]: any}, text: string, additional?: string) {
    Msg['✔️'] ^ Msg['🧜‍♂️'] ?     // Chat-GPT suggested XOR for this case; I would have never thought it myself!
        (console.warn(text, Msg), chrome.action.setBadgeText({text: (Known[Msg['🗃️']] ? (Known[Msg['🗃️']]+2)+'' : 'ERR!'), tabId: Msg['🗃️']})) 
        : (console.log(text, Msg), chrome.action.setBadgeText({text: (Msg['📝'] || ''), tabId: Msg['🗃️']}));    // The +'' is a type shortcut.
    chrome.action.setTitle({tabId: Msg['🗃️'], title: text + (additional || '\n')});
    setTimeout(() => SylphAnimation['⏹️'](Msg['🗃️']), 1080); //  Delayed to make it visible when Stash values are retrieved too quickly.
    setTimeout(() => chrome.action.setIcon({tabId: Msg['🗃️'], imageData: Icons[Msg['✔️'] ^ Msg['🧜‍♂️']]}), 1200); // Crazy use of XOR here.
    if (Msg['📝']) setTimeout(() => chrome.action.setBadgeText({text: '', tabId: Msg['🗃️']}), 3000); // So the badge doesn't cover the icon.
}

// This used to be inside the listener below, but caused too much indentation to be comfortable.
function checkID(data: string | string[], Msg: {[key: string]: any}) {
    if (!Array.isArray(data)) Stash['🗄️'+Msg['🗄️']] = JSON.parse(data);
    const ID = Msg['🌍'].includes('jobs/') ? Msg['🌍'].split('/view/')[1].substring(0,10) // Extracting the unique ID.
        : (Msg['🌍'].includes('?') ? Msg['🌍'].split('/in/')[1].split('/?')[0] : Msg['🌍'].split('/in/')[1].replace('/', ''));
    const [LastID, Index] = [Stash['🗄️'+Msg['🗄️']][Stash['🗄️'+Msg['🗄️']].length - 1], Stash['🗄️'+Msg['🗄️']].indexOf(ID)];
    [Known[Msg['🗃️']], Msg['✔️']] = (Index != -1) ? [Index, true] : [0, false]    // That zero will be changed to an empty string later.
    Msg['✔️'] ? Shout(Msg, `🧜‍♂️ Lancer knows this place! He wrote it as ${ID} in row ${Index + 2}`, '\nClick on the ⭐ to update it.\n')
        : Shout(Msg, `🧜‍♂️ Lancer doesn't know this place. The last he wrote was ${LastID}`, '\nClick on the ⭐ to add this!\n');
}

// This reacts to the content script's actions; themselves triggered either by this background script's messages, or by the onLoad event.
chrome.runtime.onMessage.addListener(Msg => {
    if      (Msg['✔️']) Shout(Msg, `🧚‍♀️ Sylph has casted her spell successfully!`, `\n🧜‍♂️ Lancer's response was:\n\n${Msg['✔️']}\n`);
    else if (Msg['❓']) Shout(Msg, `🧚‍♀️ Sylph has lost Lancer!\n🧜‍♂️ He's left a clue:\n\n${Msg['❓']}`);
    else if (Msg['❌']) Shout(Msg, `🧚‍♀️ Sylph has miscasted!\n\n${Msg['❌']}`);
    if      (Msg['🧚‍♀️']) return; // It's an extra check, but it saves us from an extra indentation...
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {  // This time we need to find the tab: content scripts can't.
        [Msg['🗃️'], Msg['🗄️']] = [tabs[0].id!, Msg['🌍'].split('.com/')[1].split('/')[0]];
        const get = 'url=GetUnique'+(Msg['🗄️'] == 'jobs' ? 'Jobs' : 'Cands');
        SylphAnimation['▶️'](Msg['🗃️'], 60); // Double time animation, to represent a quick lookup.
        console.log('🧚‍♀️ Sylph is summoning 🧜‍♂️ Lancer...', Msg, get);
        (Stash['🗄️'+Msg['🗄️']]) ? checkID(Stash['🗄️'+Msg['🗄️']], Msg)
            : fetch(Msg['🧜‍♂️']+get).then((response) => response.text()).then((data) => {checkID(data, Msg)});
    });
}); 
