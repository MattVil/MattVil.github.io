document.addEventListener("DOMContentLoaded", () => {
  const textElement = document.getElementById("animated-text");
  const cursor = document.createElement("span");
  cursor.classList.add("cursor");
  cursor.textContent = "|";
  textElement.appendChild(cursor);

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

  typeText("Welcome.");
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
  consoleInput.placeholder = "> Any question? Type here and press Enter ...";

  consoleContainer.appendChild(consoleInput);
  contentWrapper.appendChild(consoleContainer);
  mainContainer.appendChild(contentWrapper);

  consoleInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && consoleInput.value.trim() !== "") {
          const randomText = textList[Math.floor(Math.random() * textList.length)];
          typeText(randomText);
          consoleInput.value = ""; // Clear the input field
      }
  });

  // Add panel 1 content
  const panel1 = document.querySelector(".carousel-item:nth-child(1)");
  panel1.innerHTML = `
    <div class="panel-content-me">
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
        <h3>Education :</h3>
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
  // Add panel 2 content
  const panel3 = document.querySelector(".carousel-item:nth-child(3)");
  panel3.innerHTML = `
    <div class="panel-content-experience">
        <h3>Experience :</h3>
        <div class="experience-entry">
            <img src="images/thales.svg" alt="LogoE 1" class="experience-logo">
            <div class="experience-description">
                <p><strong>[2021-2024] PhD in machine learning at Université de Bordeaux, FRANCE </strong>: <i>Attention mechanism in deep learning for image matching</i>.</p>
            </div>
        </div>
        <div class="experience-entry">
            <img src="images/gamemaister.png" alt="LogoE 2" class="experience-logo">
            <div class="experience-description">
                <p><strong>[2015-2020] Master in Machine learning and data science at Université Cergy-Paris, FRANCE </strong>: Licence en Informatique. J'ai acquis une solide base en programmation, structures de données et algorithmes.</p>
            </div>
        </div>
        <div class="experience-entry">
            <img src="images/xxii.jpg" alt="LogoE 3" class="experience-logo">
            <div class="experience-description">
                <p><strong>[2019] Study abroad at  San Francisco State University, USA </strong>: Formation spécialisée en vision par ordinateur, avec des projets sur la détection d'objets et la reconstruction 3D.</p>
            </div>
        </div>
        <div class="experience-entry">
            <img src="images/gamemaister.png" alt="LogoE 2" class="experience-logo">
            <div class="experience-description">
                <p><strong>[2015-2020] Master in Machine learning and data science at Université Cergy-Paris, FRANCE </strong>: Licence en Informatique. J'ai acquis une solide base en programmation, structures de données et algorithmes.</p>
            </div>
        </div>
        <div class="experience-entry">
            <img src="images/etis.png" alt="LogoE 2" class="experience-logo">
            <div class="experience-description">
                <p><strong>[2015-2020] Master in Machine learning and data science at Université Cergy-Paris, FRANCE </strong>: Licence en Informatique. J'ai acquis une solide base en programmation, structures de données et algorithmes.</p>
            </div>
        </div>
        <div class="experience-entry">
            <img src="images/etis.png" alt="LogoE 2" class="experience-logo">
            <div class="experience-description">
                <p><strong>[2015-2020] Master in Machine learning and data science at Université Cergy-Paris, FRANCE </strong>: Licence en Informatique. J'ai acquis une solide base en programmation, structures de données et algorithmes.</p>
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