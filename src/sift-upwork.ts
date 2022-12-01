// The longest of the three, because it can do two different kinds of pages.

function SiftUpwork(pos: string, url : string) {
    const LINK = url;
    let Sifted: Array<string> = [];
    let SubSkills: Array<string> = [];
    if (url.includes("proposal")) {
        const Container = document.querySelector(".up-slider");

        const NAME = (Container?.querySelectorAll(".d-inline")[0] as HTMLElement).innerText.trim();
        const LOCATION = (Container?.querySelectorAll(".d-inline-block")[3] as HTMLElement).innerText;
        const RATE = (Container?.querySelectorAll(".d-inline")[0] as HTMLElement).innerText.trim();

        const Skills = (Container?.querySelectorAll(".skills") as NodeList)

        if (Skills[0]) { // It's inconsistent: sometimes it's 0, sometimes 1. Length is key.
            SubSkills = (Skills[0] as HTMLElement).innerText.split("\n");
            if (SubSkills.length > 20 && Container?.querySelectorAll(".skills")[1]) 
                SubSkills = (Skills[1] as HTMLElement).innerText.split("\n");
            for (var i=0; i<SubSkills.length; i++) if (!SubSkills[i].includes("Skills")) Sifted.push(' '+SubSkills[i]);
        }
        else if (Container?.querySelectorAll("div[data-test='ontology-attribute-group-tree-viewer-wrapper'")[1]) {
            SubSkills = 
            (Container.querySelectorAll("div[data-test='ontology-attribute-group-tree-viewer-wrapper'")[1] as HTMLElement)
                .innerText.split("\n")
            for (i=0; i<SubSkills.length; i++) 
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
        return PARAM_STRING;
    }
    else {
        const NAME = (document.querySelectorAll(".d-inline")[0] as HTMLElement).innerText.trim();
        const LOCATION = (document.querySelectorAll(".d-inline-block")[3] as HTMLElement).innerText;
        const RATE = (document.querySelectorAll(".d-inline")[1] as HTMLElement).innerText.trim();

        const SubSkills = (document.querySelectorAll(".skills")[0] as HTMLElement).innerText.split("\n");
        for (i=0; i<SubSkills.length; i++) if (!SubSkills[i].includes("Skills")) Sifted.push(' '+SubSkills[i]);
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
        return PARAM_STRING;
    }
} 