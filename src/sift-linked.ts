// It got much, much easier than the first version, but still a bit tricky sometimes. It also manages both jobs and people, so it's long.
function linkedinSift(Msg: {[key: string]: any}) : {Failed: boolean, String: string} {
    if (Msg['🌍'].includes("/jobs/")) return SiftLinkedJob();
    else if (Msg['🌍'].includes('invitation-manager')) return WithdrawInvitations();
    else if (Msg['📁'] == 'Lead') return SiftLinkedLead();
    else return SiftLinkedPerson(Msg['📁']);
}

function WithdrawInvitations() {
    const Withdrawn : {[key: string]: string}[] = [];

    return {Failed: true, String: JSON.stringify(Withdrawn)};
}

function SiftLinkedJob() : {Failed: boolean, String: string} {
    const link = document.URL.includes('?') ? 
        document.URL.split('?')[0] : document.URL;
    const LINK = link.charAt(link.length - 1) == '/' ? link.slice(0, -1) : link;
    const NAME = document.title.split(' | ')[0].startsWith("(") ? 
        document.title.split(' | ')[0].substring(4) : document.title.split(' | ')[0];
    const PERSON = document.querySelector('span.jobs-poster__name') ? 
        (document.querySelector('span.jobs-poster__name') as HTMLElement).innerText.trim() : 'NA';
    const PERSON_LINK = document.querySelector('.hirer-card__hirer-information') ?
        ((document.querySelector('.hirer-card__hirer-information')!.children[0] as HTMLElement)!.getAttribute('href') as string) : 'NA';
    const compSection = (document.querySelector('.jobs-unified-top-card__primary-description') as HTMLElement)!.children[0] as HTMLElement;
    const COMPANY = (compSection.children[0] as HTMLElement).innerText
    const COMPANY_LINK = compSection.children[0].getAttribute('href');
    let COMPANY_SIZE = (document.querySelectorAll('.jobs-unified-top-card__job-insight')[1] as HTMLElement).innerText.split(' · ')[0];
    switch (COMPANY_SIZE.split('-')[0]) {
        case '1': COMPANY_SIZE = '2'; break;
        case '11': COMPANY_SIZE = '4'; break;
        case '51': COMPANY_SIZE = '5'; break;
        case '201': COMPANY_SIZE = '3'; break;
        case '501': COMPANY_SIZE = '2'; break;
        default: COMPANY_SIZE = '1'; break;
    }
    const time_frame = (document.querySelector('span.tvm__text.tvm__text--neutral') as HTMLElement) ? 
        (document.querySelector('span.tvm__text.tvm__text--neutral') as HTMLElement).innerText.split(' ')[3] : null;
    let DATE = (document.querySelector('span.artdeco-inline-feedback__message') as HTMLElement)?.innerText === 'No longer accepting applications'
        ? 'Closed'
        : '';
    if (time_frame && !DATE) {
        let time = parseInt((document.querySelector('span.tvm__text.tvm__text--neutral') as HTMLElement).innerText.split(' ')[2]);
        let today = new Date();
        switch (time_frame.substring(0,3)) {
            case 'day': DATE = new Date(today.getTime()-(time*86400000)).toDateString(); break;
            case 'wee': DATE = new Date(today.getTime()-(time*604800000)).toDateString(); break;
            case 'mon': DATE = new Date(today.getTime()-(time*2419200000)).toDateString(); break;
            default: DATE = (document.querySelector('span.tvm__text.tvm__text--neutral') as HTMLElement).innerText; break;
        }
    }
    let location = compSection.innerText.split(',');
    const LOCATION = location[location.length - 1].split('  ')[0];
    let APPLICANTS = 'NA';
    if (compSection.innerText.includes('applicants'))
        APPLICANTS = compSection.innerText.split('· ')[2].split('applicants')[0].trim();
    
    const PARAM_STRING = 
        'name='+encodeURIComponent(NAME)+'&url='+LINK+'&loc='+LOCATION+'&date='+DATE+'&person='+PERSON+
        '&app='+APPLICANTS+'&personlink='+PERSON_LINK+'&comp='+COMPANY+'&complink='+COMPANY_LINK+'&compsize='+COMPANY_SIZE
    return {Failed: false, String: PARAM_STRING};
}

function SiftLinkedPerson(position: string) : {Failed: boolean, String: string} {
    let SKILLS = 'NA';
    let ENGLISH = 'NA';
    const Skills = document.querySelectorAll("a[data-field='skill_card_skill_topic']")
    const SkillN = Skills.length
    if (SkillN) {
        let Sifted: string[] = [];
        for (let i=0; i < SkillN; i++) Sifted.push(' ' + (Skills[i] as HTMLElement).innerText.split("\n")[0]);
        const Hidden = document.querySelectorAll(".visually-hidden");
        let Collated = " · ";
        for (let i=0; i < Hidden.length; i++) {
            let String: string = (Hidden[i] as HTMLElement).innerText;
            if (String.includes("Skills:") && String.includes("·")) 
                Collated = Collated+String.substring(8)+" · ";
            else if (String === "English") ENGLISH = (Hidden[i+1] as HTMLElement).innerText;
        }
        let SubSkills = Collated.split(" · ");
        for (let i=0; i<SubSkills.length; i++) {
            if (Sifted.indexOf(' '+SubSkills[i]) == -1 && Sifted[i] != '') Sifted.push(' '+SubSkills[i]);
        }
        SKILLS = Sifted.toString().substring(1);
    }

    const NAME = (document.querySelector(".text-heading-xlarge") as HTMLElement).innerText
    const STATUS = ((document.querySelector(`.pvs-profile-actions`) as HTMLElement).innerText.includes('Pending')) ? 
        "2.Sent 1st message" : '0.New';
    const POSITION = position;
    const LINK = document.URL.charAt(document.URL.length - 1) == '/' ? document.URL.slice(0, -1) : document.URL;

    const PARAM_STRING = 'name='+NAME+'&pos='+encodeURIComponent(POSITION)+'&status='+STATUS+'&skills='+encodeURIComponent(SKILLS)
    +'&eng='+ENGLISH+'&rate=NA&loc=NA&url='+LINK+'&more=';
    return {Failed: false, String: PARAM_STRING};
}

function SiftLinkedLead() : {Failed: boolean, String: string} {
    const Exp = document.querySelectorAll("div.pvs-list__outer-container > ul > li:nth-child(1)")[0];
    const Comp = (Exp.querySelector('span.t-14.t-normal')?.querySelector('span.visually-hidden') as HTMLElement).innerText.split(' ·')[0];
    const ENGLISH = (Comp.includes(' mos') || Comp.includes(' yrs ') || Comp.includes(' mo') || Comp.includes('Full-time')) ? 
        (Exp.querySelector('.mr1.hoverable-link-text.t-bold')?.querySelector('span.visually-hidden') as HTMLElement).innerText :
        Comp;
    const NAME = (document.querySelector(".text-heading-xlarge") as HTMLElement).innerText
    const STATUS = (Exp.querySelector('a') as HTMLElement).getAttribute('href');
    const POSITION = (Comp.includes(' mos') || Comp.includes(' yrs ') || Comp.includes(' mo') || Comp.includes('Full-time')) ? 
        (Exp.querySelector('div.pvs-entity.pvs-entity--with-path')?.querySelector('.visually-hidden') as HTMLElement).innerText :
        (Exp.querySelector('span.visually-hidden') as HTMLElement).innerText;
    const LOCATION = (document.querySelector('span.text-body-small.inline.t-black--light.break-words') as HTMLElement).innerText.trim()
    const LINK = document.URL.charAt(document.URL.length - 1) == '/' ? document.URL.slice(0, -1) : document.URL;

    const PARAM_STRING = 'name='+NAME+'&pos='+POSITION+'&status='+STATUS+'&skills=LEAD'
    +'&eng='+ENGLISH+'&rate=NA&loc='+LOCATION+'&url='+LINK+'&more=';
    return {Failed: false, String: PARAM_STRING};
}
