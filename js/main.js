document.addEventListener("DOMContentLoaded", () => {
  const textElement = document.getElementById("animated-text");
  const cursor = document.createElement("span");
  cursor.classList.add("cursor");
  cursor.textContent = "|";
  textElement.appendChild(cursor);

  const textList = [
      "Les avis divergent sur ce point, mais il y a des arguments solides des deux côtés.",
      "Il y a plusieurs façons de voir la situation.",
      "Cela peut varier en fonction des critères pris en compte.",
      "C’est une question complexe qui mérite une analyse approfondie.",
      "Il existe plusieurs perspectives sur le sujet.",
      "La réponse dépend de nombreux facteurs.",
      "Il n'y a pas de consensus clair sur ce point.",
      "Je pense que cela pourrait être vrai, mais il faut considérer les nuances.",
      "C’est quelque chose que l’on observe souvent, mais il y a des exceptions.",
      "Il est difficile de répondre catégoriquement sans plus d’informations.",
      "Cela repose sur des hypothèses qui doivent être vérifiées.",
      "Oui, mais il faut nuancer cette affirmation.",
      "Je dirais que c’est plausible, mais cela reste sujet à débat.",
      "C'est une situation qui mérite réflexion.",
      "Je comprends pourquoi cette question est posée, mais la réponse n'est pas simple.",
      "Il y a des éléments pour et contre cette affirmation.",
      "Dans certains cas, cela pourrait être juste, mais il faut des preuves supplémentaires.",
      "Je dirais que la réponse dépend de la perspective adoptée."
  ];

  let index = 0;

  function typeText(newText) {
      textElement.textContent = ""; // Reset text before typing
      index = 0;
      function type() {
          if (index < newText.length) {
              textElement.textContent = newText.slice(0, index + 1);
              textElement.appendChild(cursor);
              index++;
              setTimeout(type, 100);
          }
      }
      type();
  }

  function blinkCursor() {
      setInterval(() => {
          cursor.style.visibility = cursor.style.visibility === "hidden" ? "visible" : "hidden";
      }, 500);
  }

  typeText("Bienvenue.");
  blinkCursor();

  // Add a text input field styled like a console and place it under the main text container
  const mainContainer = document.querySelector(".hero-overlay");

  const contentWrapper = document.createElement("div");
  contentWrapper.classList.add("content-wrapper");

  const textContainer = document.querySelector(".text-container");
  contentWrapper.appendChild(textContainer);

  const consoleContainer = document.createElement("div");
  consoleContainer.classList.add("console-container");

  const consoleInput = document.createElement("input");
  consoleInput.type = "text";
  consoleInput.classList.add("console-input");
  consoleInput.placeholder = "> Une question ? Tapez ici et appuyez sur \"Enter\"...";

  consoleContainer.appendChild(consoleInput);
  contentWrapper.appendChild(consoleContainer);
  mainContainer.appendChild(contentWrapper);

  consoleInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && consoleInput.value.trim() !== "") {
          // const randomText = textList[Math.floor(Math.random() * textList.length)];
          const randomText = textList[Math.floor(Math.random() * (textList.length - 1)) + 1]
          typeText(randomText);
          consoleInput.value = ""; // Clear the input field
      }
  });

  // Add panel 1 content
  const panel1 = document.querySelector(".carousel-item:nth-child(1)");
  panel1.innerHTML = `
    <div class="panel-content">
        <h3>Matthieu Vilain</h3>
        <p>PhD student in machine learning at <a href="https://www.ims-bordeaux.fr/">IMS Laboratory</a>, Bordeaux, France</p>
        <p>My research subjects are 3D computer vision, image matching, 3D scene understanding and camera pose estimation. I am particularly interested in using machine learning to better understand the physical world and facilitate human interaction with the digital world.</p>
        <div class="links">
            <a href="https://www.linkedin.com/in/matthieu-vilain-a81a4b139" target="_blank">LinkedIn</a>
            <a href="https://github.com/MattVil" target="_blank">GitHub</a>
            <a href="mailto:matthieu.vilain@u-bordeaux.fr">matthieu.vilain@u-bordeaux.fr</a>
            <a href="assets/CV-Matthieu-Vilain.pdf" target="_blank">Download CV</a>
        </div>    
    </div>
  `;
  // Add panel 2 content
  const panel2 = document.querySelector(".carousel-item:nth-child(2)");
  panel2.innerHTML = `
    <div class="panel-content-education">
        <div class="education-entry">
            <img src="images/ub.png" alt="Logo 1" class="education-logo">
            <div class="education-description">
                <p><strong>[2021-2024] PhD in machine learning at Université de Bordeaux, FRANCE </strong>: <i>Attention mechanism in deep learning for image matching</i>.</p>
            </div>
        </div>
        <div class="education-entry">
            <img src="images/cy.png" alt="Logo 2" class="education-logo">
            <div class="education-description">
                <p><strong>[2015-2020] Master in Machine learning and data science at Université Cergy-Paris, FRANCE </strong>: Licence en Informatique. J'ai acquis une solide base en programmation, structures de données et algorithmes.</p>
            </div>
        </div>
        <div class="education-entry">
            <img src="images/sf.png" alt="Logo 3" class="education-logo">
            <div class="education-description">
                <p><strong>[2019] Study abroad at  San Francisco State University, USA </strong>: Formation spécialisée en vision par ordinateur, avec des projets sur la détection d'objets et la reconstruction 3D.</p>
            </div>
        </div>
    </div>
`;
});

document.querySelector('.scroll-arrow a').addEventListener('click', function(e) {
  e.preventDefault();
  const targetId = this.getAttribute('href');
  document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
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