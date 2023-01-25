type ApolloContact = {
    Name: string, Name_linkedin: string, Name_apollo: string, Title: string, Location: string, Company: string, 
    Employees: number | string, Company_linkedin: string, Company_web: string, More: string, Phone: string, Email: string, Jobs: number
};

// The only tricky thing here is it uses the same parameters for different things. Now that we return the params, we could make this better.
function apolloSift(Msg: {[key: string]: any}) : {Failed:boolean, String:string} {
    const apolloContactSetup = {    // Conditions, error messages, alternative parsing function. These might become modular one day.
        condition1: '#location_detail_card', condition1a: 'tr.zp_cWbgJ', condition2: '.zp_I1ps2',
        error1: '❌ She sees no human here!', error2: "❌ This human's account has been exiled!", alternativeSift: 'apolloListSift'
    }
    const apolloClasses = { // All these plus the conditions above will be converted into NodeListOf<HTMLElement> for convenience.
        signalsPanelEntries: '.zp_KqZzF', company_links: '.zp_I1ps2', allLinks: 'a.zp-link.zp_OotKe',
        email: "a.zp-link.zp_OotKe.zp_dAPkM.zp_Iu6Pf", company: '.zp_lMvaV.zp_JKOw3', phone: 'a.zp-link.zp_3_fnL.zp_1AaQP',
        title: '.zp_LkFHT', location: '.zp_hYCdb.zp_CZF_z', employees: '.zp_nowuD.zp_a_Jcv', name: '.zp__iJHP'
    }
    const positions = ['ngineer', 'eveloper', 'esigner', 'ester', 'rogrammer'];
    const elements : {[key: string]: NodeListOf<HTMLElement>} = {};

    Object.entries(apolloContactSetup).filter(tuple => tuple[0].startsWith('condition')).concat(Object.entries(apolloClasses))
    .forEach(tuple => (elements[tuple[0]] = document.querySelectorAll(tuple[1])));  // Not to have to do this manually for all.

    if (!elements.condition1[0]) {  // Check if it's not a page with a contact's profile
        if (!elements.condition1a[0]) return {Failed: true, String: apolloContactSetup.error1};   // If no table either, page is not supported.
        else return window[apolloContactSetup.alternativeSift](apolloContactSetup.condition1a);   // This calls the table parser function.
    }
    if (!elements.condition2[0]) return {Failed: true, String: apolloContactSetup.error2};   // Means there is no company info associated.

    Array.from(elements.signalsPanelEntries).forEach(signal => { if (signal.innerText.includes('Job')) signal!.click()});   // Displays jobs.
    
    const company_link = elements.company_links[0].childNodes[0] as HTMLElement;
    const allLinks : HTMLElement[] = Array.from(document.querySelectorAll(apolloClasses.allLinks));
    const linkedIn = allLinks.filter(ahref => {if (ahref.attributes[1]) return ahref.attributes[1].value.includes("linkedin")});
    const jobs = allLinks.filter(elem => positions.some(position => elem.innerText.includes(position)));

    const Sifted : ApolloContact = {
        Name: elements.name[0].innerText, 
        Name_apollo: document.URL.includes('?') ? document.URL.split('?')[0] + document.URL.split('=cio')[1] : document.URL, 
        Name_linkedin: linkedIn[0] ? linkedIn[0].attributes[1].value : 'NA',
        Location: elements.location[0] ? elements.location[0].innerText : 'NA', 
        Jobs: jobs.length,
        More: jobs.length > 0 ? jobs.map(job => job.attributes[1].value).toString() : '',
        Title: elements.title[0].innerText.trim(),
        Company: elements.company[0].innerText.trim(),
        Employees: elements.employees[0] ? elements.employees[0].innerText : 'NA',
        Company_web: company_link ? company_link.attributes[1].value : 'NA',
        Company_linkedin: linkedIn[1] ? linkedIn[1].attributes[1].value : 'NA',
        Phone: elements.phone[0] ? elements.phone[0].innerText : '',
        Email: elements.email[0] ? elements.email[0].innerText : ''
    }
    return {Failed: true, String: JSON.stringify([Sifted])};  
}

function apolloListSift(rowIdent: string) : {Failed:boolean, String:string} {
    const Sifted : {[key: string]: string}[] = [];
    const Header = Array.from(document.querySelectorAll("th"))?.map(th => (th as HTMLElement).innerText);
    if (!Header.includes('Title')) return {Failed: true, String: '❌ She sees no humans in this list!'};
    const Columns = Header.map(column => column.includes(' ') ? column.split(' ')[1] : column);
    
    document.querySelectorAll(rowIdent).forEach((tr, Row) => {
        Sifted.push({}); // An empty row is pushed first, to have an index to refer to, via Row.
        tr.childNodes.forEach((td, col) => {
            Sifted[Row][Columns[col]] = (td as HTMLElement).innerText;
            if (Columns[col] != 'Name' && Columns[col] != 'Company') return;    // No point in checking anything other than these two.
            const hrefs = (td as HTMLElement).innerHTML.match(/href="(.+?)"/g)?.map(str => str.split("\"")[1]) ?? [];
            hrefs.forEach(link => {
                if (link.includes('#')) Sifted[Row][Columns[col]+'_apollo'] = link;
                else if (link.includes('linkedin')) Sifted[Row][Columns[col]+'_linkedin'] = link;
                else if (!link.includes('facebook') && !link.includes('twitter')) Sifted[Row][Columns[col]+'_web'] = link;
            });
        });
    });
    return {Failed: true, String: JSON.stringify(Sifted)}
}