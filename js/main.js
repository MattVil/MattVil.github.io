const tags = {
    "augmented reality": "rgb(238, 129, 182)", // couleur rose
    "machine learning": "rgb(138, 182, 178)",   // couleur bleu-vert
    "software engineering" : "rgb(28, 172, 112)",
    "NLP-LLM" : "rgb(74, 34, 182)",
    "cryptography" : "rgb(182,34,123)",
    "hackathon" : "rgb(212, 182, 23)",
    "science" : "rgb(27, 213, 42)",
};

const projectData = {
    project1: {
        title: "PerceptU",
        year: "2018",
        description: "<p>PerceptU is a smart TV interface that combines gesture control and emotional analysis to deliver a seamless and intuitive user experience. Designed for applications such as virtual clothing catalogs, the system allows users to navigate content naturally using gestures, while providing businesses with real-time feedback on user emotions regarding their products.</p>\
        <p>The project integrates three machine learning algorithms:</p>\
        <ul><li>A 3D convolutional neural network processes live camera feeds to recognize user gestures for interaction.</li>\
        <li>A combination of Haar Cascade and gradient histograms identifies faces and classifies facial emotions using a multilayer perceptron.</li>\
        <li>MFCCs (Mel Frequency Cepstral Coefficients) extracted from microphone input enable voice emotion classification via a multilayer perceptron.</li></ul>\
        <p>The architecture leverages Kafka for parallel processing of the algorithms and React for a smooth front-end interface. Connected to a MongoDB database, the system associates the detected emotions with the content the user is viewing.</p>",
        video: "https://drive.google.com/file/d/1UTZtLRj4p4R5kn_K7fNHoVbHIe0IIn1o/preview",
        mediaTitle: "Gesture recognition demo :</br>(unfortunately, I didn’t record a video of the final project...)",
        links: {
            "GitHub": "https://github.com/MattVil/PerceptU"
        },
        technologies: ["Python", "PyTorch", "Keras", "Kafka", "MQTT", "JavaScript", "React", "MongoDB", "Docker", "Git"],
        tags: ["machine learning", "augmented reality", "software engineering"]
    },
    project2: {
        title: "FaceKey",
        year: "2017",
        description: "<p>FaceKey is an innovative password manager that leverages facial recognition to simplify and secure web authentication. The process is seamless: users navigate to a login page, activate the FaceKey browser plugin, which launches the webcam for facial recognition, and encrypted credentials are exchanged to unlock the site.</p>\
        <p>For this project, we built a custom user database and trained a convolutional neural network. The architecture was designed to be highly discriminative for accurate identification, robust to various usage conditions, and easily extensible for adding new users.</p>\
        <p>The neural network is deployed using TensorFlowJS, RSA encryption is utilized for secure data handling, and the plugin was developed in JavaScript.</p>",
        image: "images/projects/facekey/facekeyposter3.jpg",
        mediaTitle: "Poster of the project",
        links: {
            "GitHub": "https://github.com/MattVil/Face_Key"
        },
        technologies: ["Python", "Tensorflow", "TensorflowJS", "C/C++", "RSA", "JavaScript", "MongoDB", "Docker", "Git"],
        tags: ["machine learning", 'cryptography', 'software engineering']
    },
    project3: {
        title: "HCI2K50",
        description: "Description détaillée du projet HCI2K50, abordant les interfaces homme-machine ...",
        video: "https://drive.google.com/file/d/1jylqXtHi3t8eSn7ir5JlxamII0l59122/preview",
        tags: ["machine learning"]
    },
    project4: {
        title: "Multi-camera tracking",
        description: "Description détaillée du projet PerceptU. Ce projet se concentre sur ...",
        image: "images/projects/multiCamTracking.png",
        tags: ["augmented reality", "machine learning"]
    },
    project5: {
        title: "ARIEL",
        year: "2022",
        description: "<p>ARIEL is a telescope from the European Space Agency (ESA) set to launch in 2029, with the mission of observing over 1,000 exoplanets to analyze their atmospheres. In 2022, University College London launched a data challenge aimed at leveraging machine learning to determine the chemical composition of exoplanet atmospheres based on simulated observations from ARIEL.</p>\
        <p>In collaboration with astrophysics researchers from the French Agency of Space Study (CNES), we tackled this challenge by identifying key areas where machine learning could enhance astrophysics research. Our work focused on unsupervised learning and the development of methods using neural networks to predict Gaussian mixture densities, incorporating uncertainty estimation into the analyses.</p>\
        <p>This project aimed to establish an initial collaboration between CNES astrophysicists and machine learning researchers. As a result, the CNES is now a major contributor to the ARIEL data challenge.</p>",
        image: "images/projects/ariel2.png",
        links: {
            "ARIEL Challenge": "https://www.ariel-datachallenge.space/",
            "GitHub2022": "https://github.com/MattVil/ARIEL2022",
            "GitHub2023": "https://github.com/MattVil/ARIEL2023",
        },
        technologies: ["Python", "Pytorch", "Math", "Physics"],
        tags: ["machine learning", "science"]
    },
    project6: {
        title: "Social media stock",
        description: "<p>Developed a full machine learning pipeline to predict short-term stock price movements based on live social media sentiment signals.</p>\
        <ul><li>Built custom web scrapers and REST API interfaces to collect historical and live data from Twitter, Reddit, and news articale headlines.</li>\
        <li>Preprocessed noisy text using NLP techniques: tokenization, lemmatization, named entity recognition (NER), and filtering of spam/bots.</li>\
        <li>Use Word2Vec and fine-tuned transformer-based language model (e.g. BERT) to assess the polarity of posts related to a specific company.</li>\
        <li>Designed and trained a regression head to estimate stock movement based on aggregated sentiment features over time windows.</li>\
        <li>Integrated the trained model into a real-time streaming pipeline using tools like FastAPI / Flask, with live data ingestion and prediction</li>\
        <li>Evaluated the system using real market data with metrics like F1-score, accuracy, and precision</li></ul>\
        <p>This project strengthened my skills in applied NLP, real-time data engineering, and taught me how to handle noisy, unstructured data to build actionable ML insights in a high-variability domain. \
        Social media data looks to be a strong signal to predict stocks movements eventhough it not sufficient and stock prediction still very multimodal.</p>",
        image: "images/projects/socialmediastock.png",
        tags: ["machine learning", "software engineering", "NLP-LLM"],
        links: {
            "GitHub": "https://github.com/MattVil/Social_media_stock"
        },
        technologies: ["Python", "Scikit-learn", "Pandas", "Tweepy", "PRAW", "newsapi", "Yahoo! finance", "BeautifulSoup", "Flask/FastAPI", "MongoDB", "Git"],
    },
    project7: {
        title: "ENSEHACK 2020",
        year: "2020",
        description: "<p>At the ENSEA school hackathon, focused on urban ecology, we developed an innovative solution combining a smart pin and a collaborative platform to monitor city pollution.</p>\
        <p>The smart pin is equipped with sensors to measure CO₂ levels, particulates, and noise pollution using a microphone. The collected data is sent to the user’s phone and anonymously shared on an online collaborative map. This map provides a real-time view of urban pollution levels and allows users to report other types of pollution by uploading photos.</p>\
        <p>To ensure the reliability of the data, we designed a statistical algorithm to filter out potential false reports. While our functional prototype did not yet take the form of a pin, it earned us the second place in the competition!</p>",
        image: "images/projects/ensehack_team.jpg",
        mediaTitle: "Our team !",
        technologies: ["C", "Java", "JavaScript", "Arduino", "Android", "Communication", "Electronics"],
        tags: ["hackathon"]
    },
    project8: {
        title: "RushHourMobility 2019",
        year: "2019",
        description: "<p>During the Rush Hour Mobility hackathon, organized by Renault and focused on creating digital tools for the future of urban transportation, we developed a pair of custom-built smart glasses that provide real-time navigation assistance. These glasses alert users to disruptions on their route, recalculate the optimal path, and display information directly, eliminating the need to check a phone.</p>\
        <p>Our solution offers personalized routing options based on user preferences: fastest, most eco-friendly, comfortable, or economical. To achieve this, we designed a multi-heuristic variation of the A* algorithm tailored to individual preferences and real-time traffic disruptions, sourced from REST APIs provided by a simulated connected city.</p>\
        <p>The hardware includes a heads-up display built with an Arduino, a screen, and a setup of mirrors and transparent plastic for projection. The glasses are connected to a mobile application that receives city data and computes routes accordingly.</p>\
        <p>We successfully tested our functional prototype on the city model created by the organizers, and our demonstration earned us the second place in the competition!</p>",
        image: "images/projects/glasses2.jpg",
        mediaTitle: "Our team !",
        links: {
            "Blog organizer" : "https://medium.com/renault-digital/rush-mobility-hackathon-insider-bff36d1f866c",
            "Story from another team" : "https://medium.com/xorum-io/sleepless-weekend-rush-hour-mobility-hackathon-85aacefdec14",
            "Story from another team " : "https://www.epita.fr/2020/02/13/rush-hour-mobility-hackathon-renault-digital-2020/",
        },
        technologies: ["C/C++", "Java", "Arduino", "Android", "AI", "REST"],
        tags: ["hackathon"]
    },
    project9: {
        title: "SFHacks 2019",
        year: "2019",
        description: "<p>At the SFHacks hackathon in San Francisco, we developed an innovative mobile application that allows users to analyze their eye health independently using machine learning.</p>\
        <p>The app is paired with an affordable magnifying lens that attaches to the phone's camera. Once the user takes a picture of their eye, the image is processed by a pre-trained convolutional neural network designed to detect eye diseases such as glaucoma and age-related macular degeneration (AMD).</p>\
        <p>Unfortunately, due to insufficient reliability in the results for images taken with our lens, our project was not awarded. However, it served as a valuable exploration into integrating machine learning with low-cost diagnostic solutions.</p>",
        image: "images/projects/sfhacks2.png",
        technologies: ["python", "Java", "TensorflowLite", "Android", "ONNX"],
        tags: ["hackathon", "machine learning"]
    },
    project10: {
        title: "Spiking Neural Network",
        description: "Description détaillée du projet PerceptU. Ce projet se concentre sur ...",
        image: "images/projects/snn/spikingNN.png",
        tags: ["augmented reality", "machine learning"]
    },
    project11: {
        title: "Gated Networks",
        description: "Description détaillée du projet FaceKey, centré sur la reconnaissance faciale ...",
        image: "images/projects/ae.png",
        tags: ["augmented reality"]
    },
    project12: {
        title: "UrbanLifeSimulator",
        description: "Description détaillée du projet HCI2K50, abordant les interfaces homme-machine ...",
        image: "images/projects/ULS2.png",
        tags: ["machine learning"]
    },
    project13: {
        title: "FootBot",
        description: "Description détaillée du projet FaceKey, centré sur la reconnaissance faciale ...",
        image: "images/projects/footbot2.jpg",
        tags: ["augmented reality"]
    },
    project14: {
        title: "Machine Learning Zoo",
        year: "∞",
        description: "<p>A deep understanding of the fundamentals is crucial to grasp the rapid advancements in the field of machine learning and to foster creativity in designing new solutions. With this in mind, I implemented various foundational machine learning algorithms from scratch to delve into the subtle details of their inner workings.</p>\
        <p>This iterative approach allows me to deepen my understanding of core concepts, analyze their performance, and explore the critical nuances necessary for adapting these algorithms to specific contexts or creating new variations. It is a continuous process to refine and expand my skills in machine learning.</p>\
        <p>Unorganized list : </p>\
        <ul><li>Feed Forward Network and CNN + Backpropagation and optimization</li>\
        <li>TD-learning and Q-Learning</li>\
        <li>Deep-Q-Learning</li>\
        <li>A* and variants</li>\
        <li>Attention and Transfromer architecture</li>\
        <li>Contrastive learning</li>\
        <li>Naive Bayes</li>\
        <li>Gated Networks (GRU, LSTM and BiLSTM)</li>\
        <li>SVM</li>\
        <li>Kohonen Maps</li>\
        <li>Statitics for fairness training and evaluation of neural networks</li>\
        <li>Spiking Neural Network</li>\
        <li>Clusturing algorithms (K-mean, Mean-shift, ...)</li></ul>",
        // image: "images/projects/project3.png",
        links:{
            "Most of the implementations can be found on my GitHub": "https://github.com/MattVil"
        },
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
            <p>PhD student in machine learning at <a href="https://www.ims-bordeaux.fr/" target="_blank">IMS Laboratory</a>, Bordeaux, France. <b>★ Thesis successfully defended on 16 dec 2024 !</b></p>
            <p>My research focuses on 3D computer vision, image matching, 3D scene understanding, and camera pose estimation. I am particularly interested in leveraging machine learning to deepen our understanding of the physical world and to enhance human interaction with the digital world.</p>
            <p>Images and videos capture vast amounts of information about the complexity of our physical world and the dynamics that shape it. Future digital systems will need to perceive, extract information, understand, plan actions or perform simulation, evaluate critically, and interact with our physical environment.</p>
            <p><b>★ NEW blog post!</b> <a><i>Machine Learning: A Keystone for Enhancing Interactions Between the Physical and Digital Worlds – The case study of augmented reality</a></i><br>Thanks to insightful feedback, updates are underway — coming back soon!</p>
            <div class="links">
                <a href="https://www.linkedin.com/in/matthieu-vilain-a81a4b139" target="_blank">LinkedIn</a>
                <a href="https://github.com/MattVil" target="_blank">GitHub</a>
                <a href="mailto:matthieu.vilain@u-bordeaux.fr">matthieu.vilain@u-bordeaux.fr</a>
                <a href="assets/Matthieu_Vilain_CV.pdf" target="_blank">Resume</a>
            </div>    
        </div>
    `;

    const panel2 = document.querySelector(".carousel-item:nth-child(2)");
    panel2.innerHTML = `
        <div class="panel-content-education">
            <h3>Education :</h3>
            ${createEducationEntry("logos/ub.png", "2021-2024", "PhD in machine learning at Université de Bordeaux, FRANCE", "My thesis, titled <i>\"Attention Mechanism in Deep Learning for Image Matching,\"</i> was supervised by Guillaume Bourmaud and Rémi Giraud. Our primary research areas included 3D computer vision, image matching, and camera pose estimation, with a consistent focus on leveraging the advantages of the attention mechanism.")}
            ${createEducationEntry("logos/cy.png", "2015-2020", "Master in Machine learning and data science at Université Cergy-Paris, FRANCE", "My curriculum primarily consisted of three initial years focused on mathematics and software engineering, followed by two years specializing in machine learning. Thanks to my robotics teacher who took the time to introduce me to machine learning during my first year, I developed a passion for the subject. This early interest led me to engage in various academic, personal, and professional projects, allowing me to build a solid foundation in the field.")}
            ${createEducationEntry("logos/sf.png", "2019", "Study abroad at San Francisco State University, USA", "I had the opportunity the study in the US through the selective MICEFA program. At SF-State, my studies primarily focused on artificial intelligence, software engineering, neuroscience and search engines.")}
        </div>
    `;

    const panel3 = document.querySelector(".carousel-item:nth-child(3)");
    panel3.innerHTML = `
        <div class="panel-content-experience">
            <h3>Experience :</h3>
            ${createExperienceEntry("logos/thales.svg", "Jul 2020 - Dec 2020", "Machine learning R&D Intern at Thales, Palaiseau, FRANCE", "Research and development of machine learning algorithms focused on analyzing the user's body, hands, gestures, and actions to enable interaction with an augmented reality headset interface. These algorithms were designed for real-time use on an embedded board.")}
            ${createExperienceEntry("logos/gamemaister.png", "Jul 2019 - Aug 2019", "Machine learning Developer freelance at GAMEMAISTER, Paris, FRANCE", "Development of machine learning algorithms for augmented reality board games, including computer vision algorithms for perceiving physical game elements and user interactions, as well as algorithms to enhance game engine intelligence.")}
            ${createExperienceEntry("logos/xxii.jpg", "May 2018 - Sep 2018", "Machine learning R&D Intern at XXII, Paris, FRANCE", "Research and development of novel machine learning algorithms for neural architecture search tailored to specific application contexts. This work involves supervised learning, reinforcement learning, and genetic algorithms.")}
            ${createExperienceEntry("logos/dexia.svg", "Aug 2017 - Aug 2017", "Performance service assistant at Dexia, Paris, FRANCE", "Working on automating various back-office banking processes.")}
            ${createExperienceEntry("logos/gamemaister.png", "Jul 2017 - Jul 2017", "Machine learning Developer freelance at GAMEMAISTER, Paris, FRANCE", "Participated in the creation of a mixed reality board game startup, primarily contributing to the development of perception algorithms and process automation, including data augmentation.")}
            ${createExperienceEntry("logos/etis.png", "May 2017 - Jun 2017", "Research Assistant Intern at ETIS laboratory, Pontoise, FRANCE", "Development of reinforcement learning algorithms (Q-learning) and deep learning algorithms (Deep Q-Network) for controlling a robotic arm.")}
            ${createExperienceEntry("logos/etis.png", "May 2016 - Jun 2016", "Research Assistant Intern at ETIS laboratory, Pontoise, FRANCE", "Research on algorithms for the <i>\"maximum submatrix problem,\"</i> focusing on mathematical formulation, algorithm design, and parallelization of the solution.")}
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

        // Créer le contenu multimédia
        let mediaContent = "";
        if (project.video) {
            mediaContent = `
                <h3 class="media-title" style="color: ${tileColor};">${project.mediaTitle || "Project Demonstration"}</h3>
                <iframe src="${project.video}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="width: 100%; height: 400px; border-radius: 10px;"></iframe>
            `;
        } else if (project.image) {
            mediaContent = `
                <h3 class="media-title" style="color: ${tileColor};">${project.mediaTitle || "Project Snapshot"}</h3>
                <img src="${project.image}" alt="${project.title}" style="width: 100%; border-radius: 10px;">
            `;
        }

        // Créer la liste des technologies utilisées
        const technologiesHTML = project.technologies ? `
            <h3 style="color: ${tileColor};">Technologies Used:</h3>
            <ul class="technologies-list">
                ${project.technologies.map(tech => `<li>${tech}</li>`).join("")}
            </ul>
        ` : "";

        // Créer les liens dynamiques
        const linksHTML = project.links ? `
            <h3 style="color: ${tileColor};">Links:</h3>
            <ul class="project-links">
                ${Object.entries(project.links).map(([key, value]) =>
                    `<li><a href="${value}" target="_blank">${key}</a></li>`).join("")}
            </ul>
        ` : "";

        const yearHTML = project.year ? `<p class="project-year">${project.year}</p>` : "";


        // Remplir le contenu du modal
        modalBody.innerHTML = `
            ${yearHTML}
            <h2 style="color: ${tileColor};">${project.title}</h2>
            <div class="project-tags">${tagsHTML}</div>
            ${project.description}
            ${mediaContent}
            ${technologiesHTML}
            ${linksHTML}
        `;

        // Afficher le modal
        modal.style.display = 'block';
        pageContent.classList.add('page-blur');
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

