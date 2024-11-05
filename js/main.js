const tags = {
    "augmented reality": "rgb(238, 129, 182)", // couleur rose
    "machine learning": "rgb(138, 182, 178)"   // couleur bleu-vert
};

const projectData = {
    project1: {
        title: "PerceptU",
        description: "Description détaillée du projet PerceptU. Ce projet se concentre sur ...",
        image: "images/project1.png",
        tags: ["augmented reality", "machine learning"]
    },
    project2: {
        title: "FaceKey",
        description: "Description détaillée du projet FaceKey, centré sur la reconnaissance faciale ...",
        image: "images/project2.png",
        tags: ["augmented reality"]
    },
    project3: {
        title: "HCI2K50",
        description: "Description détaillée du projet HCI2K50, abordant les interfaces homme-machine ...",
        image: "images/project3.png",
        tags: ["machine learning"]
    }
};

const textList = [
    "It depends on the specific context.",
    "That’s an interesting question.",
    "Further research is needed.",
    "Opinions vary on this topic.",
    "There are pros and cons to consider.",
    "It’s not as straightforward as it seems.",
    "There are multiple perspectives on this.",
    "It could be true, but it’s not certain.",
    "That’s a possibility worth exploring.",
    "It’s difficult to say definitively.",
    "It depends on various factors.",
    "Some would argue yes, others no.",
    "More information is needed to answer that.",
    "This is subject to interpretation.",
    "It can vary from case to case.",
    "There’s evidence pointing in different directions.",
    "The answer is not black and white.",
    "This is open to debate.",
    "It might be true under certain conditions.",
    "That’s one way to look at it.",
    "There’s no clear answer to that.",
    "It’s complex and nuanced.",
    "That’s a matter of perspective.",
    "It could be, but not always.",
    "This has been a topic of discussion for a while.",
    "It could go either way.",
    "That’s hard to answer without more specifics.",
    "It depends on how you define it.",
    "There are arguments to support both sides.",
    "It's a subjective matter.",
    "It’s a complex issue with no easy solution.",
    "It’s not universally agreed upon.",
    "That’s an ongoing debate.",
    "Different people might have different takes on that.",
    "There isn’t a one-size-fits-all answer.",
    "That depends on what you mean by that.",
    "In some cases, yes; in others, no.",
    "It’s a multifaceted question.",
    "There’s a lot to consider here.",
    "It might be true in certain contexts.",
    "There are many variables at play.",
    "It’s not as simple as it appears.",
    "It’s possible, but unlikely.",
    "The answer changes over time.",
    "It’s both yes and no, depending on how you look at it.",
    "There’s some truth to that.",
    "It could be argued that way.",
    "It’s an evolving situation.",
    "That depends on who you ask.",
    "Only time will tell.",
];

let typingInProgress = false;

document.addEventListener("DOMContentLoaded", () => {
    initAnimatedText();
    initConsoleInput();
    initModal();
    populatePanels();
});

function typeText(newText) {
    if (typingInProgress) return; // Avoid re-typing if already in progress

    const textElement = document.getElementById("animated-text");
    const cursor = document.querySelector(".cursor") || createCursor(); // Get or create cursor
    textElement.textContent = ""; 
    textElement.appendChild(cursor); // Ensure cursor is appended
    let index = 0;
    typingInProgress = true;

    function type() {
        if (index < newText.length) {
            textElement.textContent = newText.slice(0, index + 1);
            textElement.appendChild(cursor); // Re-append cursor after updating text
            index++;
            setTimeout(type, 100);
        } else {
            typingInProgress = false;
        }
    }
    type();
}

// Helper to create a cursor if needed
function createCursor() {
    const cursor = document.createElement("span");
    cursor.classList.add("cursor");
    cursor.textContent = "|";
    return cursor;
}

function initAnimatedText() {
    const textElement = document.getElementById("animated-text");
    textElement.appendChild(createCursor());

    typeText("Welcome.");

    setInterval(() => {
        const cursor = document.querySelector(".cursor");
        if (cursor) {
            cursor.style.visibility = cursor.style.visibility === "hidden" ? "visible" : "hidden";
        }
    }, 500);
}

function initConsoleInput() {
    let consoleInput = document.querySelector(".console-input");

    // Check if the console input is found; if not, create it dynamically
    if (!consoleInput) {
        const mainContainer = document.querySelector(".hero-overlay");

        const contentWrapper = document.createElement("div");
        contentWrapper.classList.add("content-wrapper");

        const textContainer = document.querySelector(".text-container");
        contentWrapper.appendChild(textContainer);

        const consoleContainer = document.createElement("div");
        consoleContainer.classList.add("console-container");

        consoleInput = document.createElement("input");
        consoleInput.type = "text";
        consoleInput.classList.add("console-input");
        consoleInput.placeholder = "> Any question? Type here and press Enter ...";

        consoleContainer.appendChild(consoleInput);
        contentWrapper.appendChild(consoleContainer);
        mainContainer.appendChild(contentWrapper);
    }

    // Now add the event listener
    consoleInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && consoleInput.value.trim() !== "") {
            const randomText = textList[Math.floor(Math.random() * textList.length)];
            typeText(randomText); // Use `typeText` to display the random text
            consoleInput.value = ""; // Clear the input field
        }
    });
}

// --- Initialisation du modal ---
function initModal() {
    window.onclick = function(event) {
        const modal = document.getElementById('project-modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
}

// --- Remplissage dynamique des panels ---
function populatePanels() {
    const panel1 = document.querySelector(".carousel-item:nth-child(1)");
    panel1.innerHTML = `
        <div class="panel-content-me">
            <h3>Matthieu Vilain</h3>
            <p>PhD student in machine learning at <a href="https://www.ims-bordeaux.fr/" target="_blank">IMS Laboratory</a>, Bordeaux, France</p>
            <p>My research focuses on 3D computer vision, image matching, 3D scene understanding, and camera pose estimation. I am particularly interested in leveraging machine learning to deepen our understanding of the physical world and to enhance human interaction with the digital world.</p>
            <p>Images and videos capture vast amounts of information about the complexity of our physical world and the dynamics that shape it. Future digital systems will need to perceive, extract information, understand, plan actions or perform simulation, evaluate critically, and interact with our physical environment.</p>
            <div class="links">
                <a href="https://www.linkedin.com/in/matthieu-vilain-a81a4b139" target="_blank">LinkedIn</a>
                <a href="https://github.com/MattVil" target="_blank">GitHub</a>
                <a href="mailto:matthieu.vilain@u-bordeaux.fr">matthieu.vilain@u-bordeaux.fr</a>
                <a href="assets/CV-Matthieu-Vilain.pdf" target="_blank">Resume</a>
            </div>    
        </div>
    `;

    const panel2 = document.querySelector(".carousel-item:nth-child(2)");
    panel2.innerHTML = `
        <div class="panel-content-education">
            <h3>Education :</h3>
            ${createEducationEntry("ub.png", "2021-2024", "PhD in machine learning at Université de Bordeaux, FRANCE", "My thesis, titled <i>\"Attention Mechanism in Deep Learning for Image Matching,\"</i> was supervised by Guillaume Bourmaud and Rémi Giraud. Our primary research areas included 3D computer vision, image matching, and camera pose estimation, with a consistent focus on leveraging the advantages of the attention mechanism.")}
            ${createEducationEntry("cy.png", "2015-2020", "Master in Machine learning and data science at Université Cergy-Paris, FRANCE", "My curriculum primarily consisted of three initial years focused on mathematics and software engineering, followed by two years specializing in machine learning. Thanks to my robotics teacher who took the time to introduce me to machine learning during my first year, I developed a passion for the subject. This early interest led me to engage in various academic, personal, and professional projects, allowing me to build a solid foundation in the field.")}
            ${createEducationEntry("sf.png", "2019", "Study abroad at San Francisco State University, USA", "I had the opportunity the study in the US through the selective MICEFA program. At SF-State, my studies primarily focused on artificial intelligence, software engineering, neuroscience and search engines.")}
        </div>
    `;

    const panel3 = document.querySelector(".carousel-item:nth-child(3)");
    panel3.innerHTML = `
        <div class="panel-content-experience">
            <h3>Experience :</h3>
            ${createExperienceEntry("thales.svg", "Jul 2020 - Dec 2020", "Machine learning R&D Intern at Thales, Palaiseau, FRANCE", "Research and development of machine learning algorithms focused on analyzing the user's body, hands, gestures, and actions to enable interaction with an augmented reality headset interface. These algorithms were designed for real-time use on an embedded board.")}
            ${createExperienceEntry("gamemaister.png", "Jul 2019 - Aug 2019", "Machine learning Developer freelance at GAMEMAISTER, Paris, FRANCE", "Development of machine learning algorithms for augmented reality board games, including computer vision algorithms for perceiving physical game elements and user interactions, as well as algorithms to enhance game engine intelligence.")}
            ${createExperienceEntry("xxii.jpg", "May 2018 - Sep 2018", "Machine learning R&D Intern at XXII, Paris, FRANCE", "Research and development of novel machine learning algorithms for neural architecture search tailored to specific application contexts. This work involves supervised learning, reinforcement learning, and genetic algorithms.")}
            ${createExperienceEntry("dexia.svg", "Aug 2017 - Aug 2017", "Performance service assistant at Dexia, Paris, FRANCE", "Working on automating various back-office banking processes.")}
            ${createExperienceEntry("gamemaister.png", "Jul 2017 - Jul 2017", "Machine learning Developer freelance at GAMEMAISTER, Paris, FRANCE", "Participated in the creation of a mixed reality board game startup, primarily contributing to the development of perception algorithms and process automation, including data augmentation.")}
            ${createExperienceEntry("etis.png", "May 2017 - Jun 2017", "Research Assistant Intern at ETIS laboratory, Pontoise, FRANCE", "Development of reinforcement learning algorithms (Q-learning) and deep learning algorithms (Deep Q-Network) for controlling a robotic arm.")}
            ${createExperienceEntry("etis.png", "May 2016 - Jun 2016", "Research Assistant Intern at ETIS laboratory, Pontoise, FRANCE", "Research on algorithms for the <i>\"maximum submatrix problem,\"</i> focusing on mathematical formulation, algorithm design, and parallelization of the solution.")}
        </div>
    `;
}

// --- Fonctions d'assistance pour créer les entrées d'éducation et d'expérience ---
function createEducationEntry(imgSrc, dates, title, description) {
    return `
        <div class="education-entry">
            <img src="images/${imgSrc}" alt="Logo" class="education-logo">
            <div class="education-description">
                <p>${dates}<br><strong>${title}:</strong><br>${description}</p>
            </div>
        </div>
    `;
}

function createExperienceEntry(imgSrc, dates, title, description) {
    return `
        <div class="experience-entry">
            <img src="images/${imgSrc}" alt="Logo" class="experience-logo">
            <div class="experience-description">
                <p>${dates}<br><strong>${title}:</strong><br>${description}</p>
            </div>
        </div>
    `;
}


document.querySelector('.scroll-arrow a').addEventListener('click', function(e) {
  e.preventDefault();
  const targetId = this.getAttribute('href');
  document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
});

document.addEventListener("DOMContentLoaded", () => {
  const nextPageArrow = document.querySelector(".next-page-arrow");
  
  if (nextPageArrow) {
      nextPageArrow.addEventListener("click", (event) => {
          event.preventDefault();
          const targetId = nextPageArrow.getAttribute("href").substring(1);
          const targetElement = document.getElementById(targetId);
          
          if (targetElement) {
              targetElement.scrollIntoView({ behavior: "smooth" });
          }
      });
  }
});

function showCarouselItem(index) {
  const items = document.querySelectorAll('.carousel-item');
  items.forEach((item, i) => {
      item.classList.remove('active');
      if (i === index) {
          item.classList.add('active');
      }
  });
}

document.addEventListener("DOMContentLoaded", function() {
    const modal = document.getElementById('project-modal');
    modal.style.display = 'none'; // Masque le modal au chargement
});

// Ferme le modal si on clique en dehors de son contenu
document.getElementById('project-modal').addEventListener('click', function(event) {
    const modalContent = document.querySelector('.modal-content');
    if (!modalContent.contains(event.target)) {
        closeModal();
    }
});

function openModal(projectId) {
    const modal = document.getElementById('project-modal');
    const modalBody = document.getElementById('modal-body');
    const pageContent = document.getElementById('page-content');
    const projectTile = document.querySelector(`.project-tile[onclick="openModal('${projectId}')"]`);

    // Vérifier si le projet existe dans les données
    const project = projectData[projectId];
    if (project && projectTile) {
        console.log("Affichage du projet :", project);

        // Obtenir la couleur de la tuile pour le titre
        const tileColor = window.getComputedStyle(projectTile).getPropertyValue("--project-color");

        // Générer les tags avec couleur
        const tagsHTML = project.tags.map(tag => {
            const color = tags[tag] || "rgb(200, 200, 200)"; // couleur par défaut si tag non trouvé
            return `<span class="project-tag" style="background-color: ${color};">${tag}</span>`;
        }).join(" ");

        // Afficher le modal
        modal.style.display = 'block';
        pageContent.classList.add('page-blur');

        // Remplir le contenu du modal
        modalBody.innerHTML = `
            <h2 style="color: ${tileColor};">${project.title}</h2>
            <div class="project-tags">${tagsHTML}</div>
            <p>${project.description}</p>
            <img src="${project.image}" alt="${project.title}" style="width: 100%; border-radius: 10px;">
        `;
    } else {
        console.error("Projet introuvable :", projectId);
    }
}

function closeModal() {
    const modal = document.getElementById('project-modal');
    const pageContent = document.getElementById('page-content');

    modal.style.display = 'none';
    pageContent.classList.remove('page-blur');
}

