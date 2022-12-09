// Longer than it should be, because there are two different kinds of pages I want to be able to sift through.
function SiftUpwork(pos: string, url : string) : {Failed: boolean, String: string} {
    if (url.includes("proposal")) return SiftUpworkProposal(url);
    else return SiftUpworkProfile(pos, url);
}

// The proposal version ists inside an overlay container.
function SiftUpworkProposal(url: string) : {Failed: boolean, String: string} {
    const Container = document.querySelector(".up-slider");

    const NAME = (Container?.querySelectorAll(".d-inline")[0] as HTMLElement).innerText.trim();
    const LOCATION = (Container?.querySelectorAll(".d-inline-block")[3] as HTMLElement).innerText;
    const RATE = (Container?.querySelectorAll(".d-inline")[0] as HTMLElement).innerText.trim();
    const LINK = url;
    const Skills = (Container?.querySelectorAll(".skills") as NodeList)
    const Sifted: string[] = [];
    if (Skills[0]) { // It's inconsistent: sometimes it's 0, sometimes 1. Length is key.
        let SubSkills = (Skills[0] as HTMLElement).innerText.split("\n");
        if (SubSkills.length > 20 && Container?.querySelectorAll(".skills")[1]) 
            SubSkills = (Skills[1] as HTMLElement).innerText.split("\n");
        for (let i=0; i<SubSkills.length; i++) if (!SubSkills[i].includes("Skills")) Sifted.push(' '+SubSkills[i]);
    }
    else if (Container?.querySelectorAll("div[data-test='ontology-attribute-group-tree-viewer-wrapper'")[1]) {
        let SubSkills = 
        (Container.querySelectorAll("div[data-test='ontology-attribute-group-tree-viewer-wrapper'")[1] as HTMLElement)
            .innerText.split("\n")
        for (let i=0; i<SubSkills.length; i++) 
            if (!SubSkills[i].includes("Skills") && !SubSkills[i].includes("Development") && !SubSkills[i].includes("Business"))
                Sifted.push(' '+SubSkills[i]);
    }
    else Sifted.push(' ERR: Could not parse any skill!');
    const SKILLS = Sifted.toString().substring(1);
    
    const POSITION = (Container?.querySelectorAll(".break")[0] as HTMLElement).innerText.trim();
    const ENGLISH = (Container?.querySelectorAll("div[data-test='language'")[0] as HTMLElement).innerText.split(":")[1].trim()
    const MORE = (Container?.querySelector("a.d-block") as HTMLElement).toString().substring(12) // Trying to avoid GET limits...

    const PARAM_STRING = 'name='+NAME+'&pos='+encodeURIComponent(POSITION)+'&status=0.New&skills='+encodeURIComponent(SKILLS)
    +'&eng='+ENGLISH+'&rate='+RATE+'&loc='+LOCATION+'&url='+LINK+'&more='+MORE;
    return {Failed: false, String: PARAM_STRING};
}

function SiftUpworkProfile(pos: string, url: string) : {Failed: boolean, String: string} {
    const NAME = (document.querySelectorAll(".d-inline")[0] as HTMLElement).innerText.trim();
    const LOCATION = (document.querySelectorAll(".d-inline-block")[3] as HTMLElement).innerText;
    const RATE = (document.querySelectorAll(".d-inline")[1] as HTMLElement).innerText.trim();
    const LINK = url;
    const SubSkills = (document.querySelectorAll(".skills")[0] as HTMLElement).innerText.split("\n");
    const Sifted: string[] = [];
    for (let i=0; i<SubSkills.length; i++) if (!SubSkills[i].includes("Skills")) Sifted.push(' '+SubSkills[i]);
    const SKILLS = Sifted.toString().substring(1);

    const POSITION = pos; 
    /** Keeping the old code below, so later it can be activated via settings/options.
    if (document.querySelectorAll(".up-card")[3].querySelector("em.break"))
        POSITION = (document.querySelectorAll(".up-card")[3].querySelector("em.break") as HTMLElement).innerText;
    else POSITION = (document.querySelectorAll("h2.mb-0")[1] as HTMLElement).innerText.trim();
     */
    const lists = document.querySelectorAll(".list-unstyled");
    const ENGLISH = (lists[1].querySelector("span.d-inline-block") as HTMLElement).innerText

    const PARAM_STRING = 'name='+NAME+'&pos='+encodeURIComponent(POSITION)+'&status=0.New&skills='+encodeURIComponent(SKILLS)
    +'&eng='+ENGLISH+'&rate='+RATE+'&loc='+LOCATION+'&url='+LINK+'&more=';
    return {Failed: false, String: PARAM_STRING};
}
