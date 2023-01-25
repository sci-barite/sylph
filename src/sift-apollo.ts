type ApolloContact = {
    Name: string, Name_linkedin: string, Name_apollo: string, Title: string, Location: string, Company: string, 
    Employees: number | string, Company_linkedin: string, Company_web: string, More: string, Phone: string, Email: string, Jobs: number
};

// The only tricky thing here is it uses the same parameters for different things. Now that we return the params, we could make this better.
function apolloSift(Msg: {[key: string]: any}) : {Failed:boolean, String:string} {
    const apolloContactSetup  : {[key: string]: string}  = {
        condition1: '#location_detail_card', condition1a: 'tr.zp_cWbgJ', condition2: '.zp_I1ps2',
        error1: '❌ She sees no human!', error2: '❌ She sees no account!', alternativeSift: 'apolloListSift',
        outputURL1: 'apollo/contacts/', outputURL2: 'apollo/people/', uniqueIDstringLength: '24'
    }
    const apolloClasses = { signalsPanelEntries: '.zp_KqZzF', company_links: '.zp_I1ps2', allLinks: 'a.zp-link.zp_OotKe',
        email: "a.zp-link.zp_OotKe.zp_dAPkM.zp_Iu6Pf", company: '.zp_lMvaV.zp_JKOw3', phone: 'a.zp-link.zp_3_fnL.zp_1AaQP',
        title: '.zp_LkFHT', location: '.zp_hYCdb.zp_CZF_z', employees: '.zp_nowuD.zp_a_Jcv', name: '.zp__iJHP', 
    }
    const positions = ['ngineer', 'eveloper', 'esigner', 'ester', 'rogrammer'];
    const elements : {[key: string]: NodeListOf<HTMLElement>} = {};

    Object.entries(apolloContactSetup).filter(tuple => tuple[0].startsWith('condition')).concat(Object.entries(apolloClasses))
    .forEach(tuple => (elements[tuple[0]] = document.querySelectorAll(tuple[1])));  // Not to have to do this manually for all.

    if (!elements.condition1[0]) {
        if (!elements.condition1a[0])   // Shows there is a table of (hopefully) contacts.
            return {Failed: true, String: apolloContactSetup.error1};
        else return window[apolloContactSetup.alternativeSift](apolloContactSetup.condition1a[0]);   // Preparing for something big.
    }
    if (!elements.condition2[0])
        return {Failed: true, String: apolloContactSetup.error2};

    Array.from(elements.signalsPanelEntries).forEach(signal => { if (signal.innerText.includes('Job')) signal!.click()});   // Displays jobs

    const URL = (document.URL.includes(apolloContactSetup.outputURL1) ? apolloContactSetup.outputURL1
         : apolloContactSetup.outputURL2)+document.URL.substring(document.URL.length -parseInt(apolloContactSetup.uniqueIDstringLength));
    
    const company_link = elements.company_links[0].childNodes[0] as HTMLElement;
    const allLinks : HTMLElement[] = Array.from(document.querySelectorAll(apolloClasses.allLinks));
    const linkedIn = allLinks.filter(ahref => ahref.attributes[1].value.includes("linkedin"));
    const jobs = allLinks.filter(elem => positions.some(position => elem.innerText.includes(position)));

    const Contact : ApolloContact = {
        Name: elements.name[0].innerText, 
        Name_apollo: URL, 
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
    return {Failed: true, String: JSON.stringify([Contact])};  
}

function apolloListSift(rowIdent: string) : {Failed:boolean, String:string} {
    const Table : {[key: string]: string}[] = [];
    const Header = Array.from(document.querySelectorAll("th"))?.map(th => (th as HTMLElement).innerText);
    if (!Header.includes('Title')) return {Failed: true, String: '❌ She sees no humans in this list!'};
    const Columns = Header.map(column => column.includes(' ') ? column.split(' ')[1] : column);
    
    document.querySelectorAll(rowIdent).forEach((tr, Row) => {
        Table.push({}); // An empty row is pushed first, to have an index to refer to, via Row.
        tr.childNodes.forEach((td, col) => {
            Table[Row][Columns[col]] = (td as HTMLElement).innerText;
            if (Columns[col] != 'Name' && Columns[col] != 'Company') return;    // No point in checking anything other than these two.
            const hrefs = (td as HTMLElement).innerHTML.match(/href="(.+?)"/g)?.map(str => str.split("\"")[1]) ?? [];
            hrefs.forEach(link => {
                if (link.includes('#')) Table[Row][Columns[col]+'_apollo'] = link;
                else if (link.includes('linkedin')) Table[Row][Columns[col]+'_linkedin'] = link;
                else if (!link.includes('facebook') && !link.includes('twitter')) Table[Row][Columns[col]+'_web'] = link;
            });
        });
    });
    return {Failed: true, String: JSON.stringify(Table)}
}