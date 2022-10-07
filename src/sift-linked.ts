// It got much, much easier than the first version, but still a bit tricky sometimes.

function SiftLinked(position : string, page: string) {
    if (page.includes("/jobs/")) {
        LINK = document.URL.split('?')[0];
        NAME = document.title.split(' | ')[0];
        if (document.querySelector('span.jobs-poster__name'))
            PERSON = (document.querySelector('span.jobs-poster__name') as HTMLElement).innerText.trim();
        if (document.querySelector('.hirer-card__hirer-information'))
            PERSON_LINK = ((document.querySelector('.hirer-card__hirer-information')!.children[0] as HTMLElement)!.getAttribute('href') as string);
        COMPANY = (document.querySelector('.jobs-unified-top-card__company-name') as HTMLElement)!.innerText;
        COMPANY_LINK = document.URL.split('/jobs')[0]+document.querySelector('.jobs-unified-top-card__company-name')!.children[0].getAttribute('href');
        COMPANY_SIZE = (document.querySelectorAll('.jobs-unified-top-card__job-insight')[1] as HTMLElement).innerText.split(' · ')[0];
        //let time_posted = (document.querySelector('.jobs-unified-top-card__posted-date') as HTMLElement).innerText
        //let today = new Date();
        //if (time_posted.includes('day')) DATE = new Date(today.getDate() - (parseInt(time_posted[0]))).toDateString()
        DATE = (document.querySelector('.jobs-unified-top-card__posted-date') as HTMLElement).innerText;
        let location = (document.querySelector('.jobs-unified-top-card__bullet') as HTMLElement).innerText.split(',');
        LOCATION = location[location.length - 1].trim()
    }
    else {
        var Sifted: Array<string> = [];
        for (var i=0; i<3; i++) {
            Sifted.push(' '+
            (document.querySelectorAll("a[data-field='skill_card_skill_topic']")[i] as HTMLElement).innerText.split("\n")[0]);
        }

        const Hidden = document.querySelectorAll(".visually-hidden");
        var Collated = " · ";
        for (i=0; i < Hidden.length; i++) {
            let String: string = (Hidden[i] as HTMLElement).innerText;
            if (String.includes("Skills:") && String.includes("·")) 
                Collated = Collated+String.substring(8)+" · ";
            else if (String === "English") ENGLISH = (Hidden[i+1] as HTMLElement).innerText;
        }

        var SubSkills = Collated.split(" · ");
        for (i=0; i<SubSkills.length; i++) {
            if (Sifted.indexOf(' '+SubSkills[i]) == -1 && Sifted[i] != '') Sifted.push(' '+SubSkills[i]);
        }

        SKILLS = Sifted.toString().substring(1);
        NAME = (document.querySelector(".text-heading-xlarge") as HTMLElement).innerText
        POSITION = position;
        LINK = document.URL;
    }
}