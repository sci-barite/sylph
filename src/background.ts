// ASYNC PRELOAD IMAGEDATA: big change: loading all the icons in memory from the start, using OffscreenCanvas to avoid slowdowns. Faster!
const preloadImageData = async (icon: string) : Promise<ImageData> => {
    const response = await fetch(`images/sylph${icon}`), blob = await response.blob(), img = await createImageBitmap(blob);
    const [width, height] = [img.width, img.height], ctx = new OffscreenCanvas(width, height).getContext('2d');
    ctx!.drawImage(img, 0, 0, width, height);
    return ctx!.getImageData(0, 0, width, height);
}

// ASYNC ICONS: an array of ImageData built with one of paths. Even if async, assigning each to its own index in an array ensures a wanted order.
const Icons: ImageData[] = [], IconNames: string[] = ['32.png', '-hurt64.png', ...Array.from({length: 10}, (_element, n) => `-casts${n}.png`)];
IconNames.forEach(async function(iconName, index) {Icons[index] = await preloadImageData(iconName)});   // Going around a Service Worker limit.
const Colors: {[key: string]: chrome.action.ColorArray} = {'👎': [230, 80, 90, 230], '👍': [80, 230, 90, 230], '👌': [80, 230, 230, 230]};

// ASYNC TAB AND BOOKMARK FOLDER GETTERS: Another conceptually big change, allowing to save on indentation and complexity, thanks to promises.
const getTabID = async (URL: string) : Promise<number> => { return (await chrome.tabs.query({ url: URL }))[0].id! }
const getFolder = async (bmParentID: string) : Promise<string> => { return (await chrome.bookmarks.get((bmParentID)))[0].title }

// CACHE OBJECTS: Simpler than Session Storage. Might also start loading data here from the beginning instead of waiting for the first request.
const Stash: {[key: string]: string[]} = {}, Known: {[key: number]: number} = {};

// URL ARRAYS: They rebuild the matches in the manifest in a way that can be used by Bookmark Listener, Declarative Content, and OnUpdated.
const MagicalLands = chrome.runtime.getManifest().content_scripts![0].matches!.map(site => site.split('//')[1].replaceAll('*', ''));
const LandMap = MagicalLands.map(land => ({hostSuffix: land.substring(0, land.indexOf('/')), pathPrefix: land.substring(land.indexOf('/'))}));
const HostMap = LandMap.map(host => host.hostSuffix.slice(0,-3).replaceAll('.', '')), IndexedLands = MagicalLands.slice(0,2);   // Prefs?

// SYLPHANIMATION: An object providing methods to start and stop the icon animation. Handles different animations for different tabs.
const SylphAnimation: {Tabs: {[key: number]: number}, '▶️': (tabID: number, speed: number) => void, '⏹️': (tabID: number) => void} = {
    Tabs: {},
    '▶️': function(tabID: number, speed: number) {             // Play emoji to play the animation!
        Silence(tabID, "🧚‍♀️ Sylph is casting her spell...");    // Stops previous animations and displays a simple message in tooltip.
        this.Tabs[tabID] = 2;                                   // This associates the desired tab to the first frame of the animation.
        Animate(this.Tabs, tabID, speed);                       // Externalized this above.
    },
    '⏹️': function(tabID: number) { delete this.Tabs[tabID]; }  // Stop emoji to stop the animation!
};

// ANIMATE: The animation function, previously contained in SylphAnimation, now separate just to reduce indentation.
function Animate(Tabs: {[key: number]: number}, tabID: number, speed: number) {
    if (!Tabs[tabID]) return;                                               // Avoiding a level of indentation with a negative condition.
    chrome.action.setIcon({tabId: tabID, imageData: Icons[Tabs[tabID]]});   // Much faster than string-building a path to fetch; fluid animation!
    Tabs[tabID] = (Tabs[tabID] + 1) % 12 || 2;                              // In the unified Icons array, the animation is at index 2 to 11.
    setTimeout(() => Animate(Tabs, tabID, speed), speed);                   // Sylph spell-casting animation for the win!!
};

// INSTALL LISTENER: This handles the "rules" for icon deactivation and activation depending on website. Might include more in the future.
chrome.runtime.onInstalled.addListener(()=> {
    chrome.action.disable();
    const AwakeSylph: {conditions: chrome.declarativeContent.PageStateMatcher[], actions: any[]} = {
        conditions: LandMap.map(hostAndPrefix => new chrome.declarativeContent.PageStateMatcher({pageUrl: hostAndPrefix})),
        actions: [new chrome.declarativeContent.ShowAction()]
    };
    chrome.declarativeContent.onPageChanged.removeRules(undefined, ()=> {chrome.declarativeContent.onPageChanged.addRules([AwakeSylph])});
    console.log(`🧚‍♀️ Sylph can visit the following lands today... Awaiting orders!`, AwakeSylph.conditions);
});

// TAB REMOVED LISTENER: Needed for SylphAnimation, or it will keep trying to animate the icons of closed tabs forever, logging error each try.
chrome.tabs.onRemoved.addListener(tabID => SylphAnimation['⏹️'](tabID));

// TAB UPDATE LISTENER: handles when a page changes to another without loading, common on LinkedIn, or to a non-indexed page. Avoids UI errors.
chrome.tabs.onUpdated.addListener((tabID, change) => {
    if (!change.url) return;    // There can be changes due to pressing of buttons and stuff. We don't need those, so we exit early.
    if (!IndexedLands.some(indexed => change.url!.includes(indexed))) { Silence(tabID); delete Known[tabID]; } // Resets and rechecks if needed.
    else { delete Known[tabID]; setTimeout(() => Known[tabID] == undefined ? chrome.tabs.sendMessage(tabID, {'✨': true}) : false, 1200)};
})

// BOOKMARK LISTENER: the main interaction! When a bookmark is created, we send a message to the content script, which will process the page.
chrome.bookmarks.onCreated.addListener(async (_id, bm)=> {   // Bookmarking works independently, so we have to check again the website.
    if (!MagicalLands.some(site => bm.url!.includes(site))) return;   // Aborts on negative rather than executing conditionally.
    const tabID = await getTabID(bm.url!), folder = await getFolder(bm.parentId!), host = HostMap.find((url: string) => bm.url!.includes(url));
    SylphAnimation['▶️'](tabID, 90);
    (Known[tabID] < 0) ? (SylphBadge(tabID, `${Math.abs(Known[tabID])}`, Colors['👎']), setTimeout(() => Silence(tabID), 3600))
        : (chrome.tabs.sendMessage(tabID, {'🧚‍♀️': true, '🗃️': tabID, '🗺️': host, '🌍': bm.url, '💌': Known[tabID], '📁': folder}),
           console.log(`🧚‍♀️ Bookmark created in ${folder}, Sylph is casting her spell from ${tabID}...`));
});

// SYLPHBADGE: Utility function to save repetition and characters, since all the time we specify a badge text, we also want to set a color.
function SylphBadge(tabID: number, text: string, color?: chrome.action.ColorArray, ) {
    if (color) chrome.action.setBadgeBackgroundColor({color: color, tabId: tabID}); 
    chrome.action.setBadgeText({text: text, tabId: tabID});
}

// SHOUT: I found myself repeating a similar pattern, so I made a utility function. Now it's expanded to cover all the "UI" displays.
function Shout(Msg: {[key: string]: any}, text: string, additional?: string) {
    const tabID = Msg['🗃️'], How = Msg['✔️'] ^ Msg['🧜‍♂️']; // Chat-GPT suggested XOR for this, then I got crazy with it!
    How ? (console.warn(text, Msg), SylphBadge(tabID, (Msg['✔️'] ? `${Known[tabID]+2}` : 'ERR!'), Colors[Msg['✔️'] ? '👌' : '👎'])) 
        : (console.log(text, Msg), SylphBadge(tabID, (Msg['📝'] || 'NEW!'), Colors['👍']), setTimeout(() => Silence(tabID), 3600)); 
    chrome.action.setTitle({tabId: tabID, title: `${text}${(additional || '\n')}`});
    setTimeout(() => SylphAnimation['⏹️'](tabID), 1080);     // Delayed to make it visible when Stash values are retrieved too quickly.
    setTimeout(() => chrome.action.setIcon({tabId: tabID, imageData: Icons[How]}), 1170);   // Another crazy use of XOR: replacing an index!
    if (Msg['📝']) Known[Msg['🗃️']] = -parseInt(Msg['📝']); // Distinguishing to avoid multiple calls on pages that were added but not indexed.
}

// SILENCE: The contrary of the above, it cleans up any changes to icon, badge, animation, text etc. when it needs to be reset for any reason.
function Silence(tabID: number, text?: string) {
    SylphAnimation['⏹️'](tabID)  // This is only in case the previous action didn't finish, or there's been an unexpected error.
    chrome.action.setIcon({tabId: tabID, imageData: Icons[0]}); // We keep the default icon at index 0 for several reasons.
    chrome.action.setTitle({tabId: tabID, title: text || ''});  // Adapted this to be able to display a message, optionally.
    SylphBadge(tabID, '');
}

// CHECKID: This used to be inside the listener below, but got too big to be comfortable. Checks based on cached or fetched values from Sheets.
function checkID(data: string | string[], Msg: {[key: string]: any}) {
    if (!Array.isArray(data)) Stash[`🗄️${Msg['🏷️']}`] = JSON.parse(data);
    const ID = Msg['🌍'].includes('jobs/') ? Msg['🌍'].split('/view/')[1].substring(0,10) // Extracting the unique ID.
        : (Msg['🌍'].includes('?') ? Msg['🌍'].split('/in/')[1].split('/?')[0] : Msg['🌍'].split('/in/')[1].replace('/', ''));
    const db = `🗄️${Msg['🏷️']}`, LastID = Stash[db][Stash[db].length - 1], Index= Stash[db].indexOf(ID);
    [Known[Msg['🗃️']], Msg['✔️']] = (Index != -1) ? [Index, true] : [0, false]    // That zero will be changed to an empty string later.
    Msg['✔️'] ? Shout(Msg, `🧜‍♂️ Lancer knows this place! He wrote it as ${ID} in row ${Index + 2}`, '\nClick on the ⭐ to update it.\n')
        : Shout(Msg, `🧜‍♂️ Lancer doesn't know this place. The last he wrote was ${LastID}`, '\nClick on the ⭐ to add this!\n');
}

// MESSAGE LISTENER: reacts to the content script's actions; themselves replies to either this service worker's messages, or the onLoad event.
chrome.runtime.onMessage.addListener(async Msg => {
    if      (Msg['✔️']) Shout(Msg, `🧚‍♀️ Sylph has casted her spell successfully!`, `\n🧜‍♂️ Lancer's response was:\n\n${Msg['✔️']}\n`);
    else if (Msg['❓']) Shout(Msg, `🧚‍♀️ Sylph has lost Lancer!\n🧜‍♂️ He's left a clue:\n\n${Msg['❓']}`);
    else if (Msg['❌']) Shout(Msg, `🧚‍♀️ Sylph has miscasted!\n\n${Msg['❌']}`);
    if      (Msg['🧚‍♀️']) return; // It's an extra check, but it saves us from an extra indentation... Can live with that!
    [Msg['🗃️'], Msg['🏷️']] = [await getTabID(Msg['🌍']), Msg['🌍'].split('.com/')[1].split('/')[0]];
    const get = `url=GetUnique${(Msg['🏷️'] === 'jobs' ? 'Jobs' : 'Cands')}`, db = `🗄️${Msg['🏷️']}`; // NOTE: This needs refactoring soon!
    SylphAnimation['▶️'](Msg['🗃️'], 60); // Double time animation, to represent a quick lookup.
    console.log('🧚‍♀️ Sylph is summoning 🧜‍♂️ Lancer...', Msg, get);
    (Stash[db]) ? checkID(Stash[db], Msg) : fetch(Msg['🧜‍♂️']+get).then((response) => response.text()).then((data) => {checkID(data, Msg)});
}); 
