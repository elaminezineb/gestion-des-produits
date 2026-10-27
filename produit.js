
const formProduit = document.getElementById("formProduit");
const nomInput = document.getElementById("nom");
const categorieInput = document.getElementById("categorie");
const prixInput = document.getElementById("prix");
const quantiteInput = document.getElementById("quantite");

const listeProduits = document.getElementById("listeProduits");
const rechercheInput = document.getElementById("recherche");
const filtreCategorie = document.getElementById("filtreCategorie");

const totalProduits = document.getElementById("totalProduits");
const valeurStock = document.getElementById("valeurStock");
const quantiteTotale = document.getElementById("quantiteTotale");
const badgeProduits = document.getElementById("badgeProduits");

const etatVide = document.getElementById("etatVide");
const resultats = document.getElementById("resultats");
const message = document.getElementById("message");
const viderListe = document.getElementById("viderListe");

// Exemples de produits pour découvrir l'application.
const exemples = [
    {
        id: 1,
        nom: "Sac élégant",
        categorie: "Accessoires",
        prix: 180,
        quantite: 5
    },
    {
        id: 2,
        nom: "Baskets classiques",
        categorie: "Chaussures",
        prix: 250,
        quantite: 3
    },
    {
        id: 3,
        nom: "Chemise blanche",
        categorie: "Vêtements",
        prix: 120,
        quantite: 8
    }
];

// Récupérer les produits enregistrés dans le navigateur.
let produits = chargerProduits();

function chargerProduits() {
    try {
        const donnees = localStorage.getItem("stocklyProduits");

        if (donnees !== null) {
            const produitsEnregistres = JSON.parse(donnees);

            if (Array.isArray(produitsEnregistres)) {
                return produitsEnregistres;
            }
        }
    } catch (erreur) {
        console.error("Impossible de charger les produits :", erreur);
    }

    return exemples;
}

// Sauvegarder les produits dans le navigateur.
function sauvegarderProduits() {
    try {
        localStorage.setItem("stocklyProduits", JSON.stringify(produits));
    } catch (erreur) {
        console.error("Impossible de sauvegarder les produits :", erreur);
        message.textContent = "La sauvegarde a échoué.";
    }
}

// Choisir une illustration selon la catégorie.
function obtenirEmoji(categorie) {
    if (categorie === "Vêtements") {
        return "👕";
    }

    if (categorie === "Chaussures") {
        return "👟";
    }

    return "👜";
}

// Afficher un prix en dirhams.
function formaterPrix(montant) {
    return montant.toLocaleString("fr-MA", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " DH";
}

// Éviter d'interpréter le nom du produit comme du HTML.
function securiserTexte(texte) {
    return String(texte).replace(/[&<>"']/g, function (caractere) {
        const caracteres = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return caracteres[caractere];
    });
}

// Afficher les produits et mettre à jour les statistiques.
function afficherProduits() {
    const terme = rechercheInput.value.trim().toLowerCase();
    const categorieChoisie = filtreCategorie.value;

    const produitsFiltres = produits.filter(function (produit) {
        const correspondNom = produit.nom.toLowerCase().includes(terme);
        const correspondCategorie =
            categorieChoisie === "" ||
            produit.categorie === categorieChoisie;

        return correspondNom && correspondCategorie;
    });

    listeProduits.innerHTML = "";

    produitsFiltres.forEach(function (produit) {
        const ligne = document.createElement("tr");

        ligne.innerHTML = `
            <td>
                <div class="product-name">
                    <span class="product-emoji">
                        ${obtenirEmoji(produit.categorie)}
                    </span>
                    <span>${securiserTexte(produit.nom)}</span>
                </div>
            </td>
            <td>
                <span class="category-badge">
                    ${securiserTexte(produit.categorie)}
                </span>
            </td>
            <td>${formaterPrix(produit.prix)}</td>
            <td>${produit.quantite}</td>
            <td class="total-price">
                ${formaterPrix(produit.prix * produit.quantite)}
            </td>
            <td>
                <button
                    type="button"
                    class="delete-button"
                    data-id="${produit.id}"
                    aria-label="Supprimer ${securiserTexte(produit.nom)}"
                >
                    Supprimer
                </button>
            </td>
        `;

        listeProduits.appendChild(ligne);
    });

    // Calculer les statistiques sur tous les produits.
    const nombreProduits = produits.length;

    const quantite = produits.reduce(function (total, produit) {
        return total + produit.quantite;
    }, 0);

    const valeur = produits.reduce(function (total, produit) {
        return total + produit.prix * produit.quantite;
    }, 0);

    totalProduits.textContent = nombreProduits;
    quantiteTotale.textContent = quantite;
    valeurStock.textContent = formaterPrix(valeur);

    badgeProduits.textContent =
        nombreProduits + (nombreProduits > 1 ? " produits" : " produit");

    resultats.textContent =
        produitsFiltres.length +
        (produitsFiltres.length > 1 ? " résultats" : " résultat");

    etatVide.hidden = produitsFiltres.length > 0;

    // Masquer le tableau quand aucun produit ne correspond.
    document.querySelector(".table-wrapper").hidden =
        produitsFiltres.length === 0;
}

// Ajouter un produit.
formProduit.addEventListener("submit", function (event) {
    event.preventDefault();

    const nom = nomInput.value.trim();
    const categorie = categorieInput.value;
    const prix = Number(prixInput.value);
    const quantite = Number(quantiteInput.value);

    if (
        nom === "" ||
        !["Vêtements", "Chaussures", "Accessoires"].includes(categorie) ||
        !Number.isFinite(prix) ||
        !Number.isFinite(quantite) ||
        prix <= 0 ||
        quantite < 1 ||
        !Number.isInteger(quantite)
    ) {
        message.textContent = "Veuillez vérifier les informations saisies.";
        return;
    }

    const nouveauProduit = {
        id: Date.now(),
        nom: nom,
        categorie: categorie,
        prix: prix,
        quantite: quantite
    };

    produits.push(nouveauProduit);
    sauvegarderProduits();
    afficherProduits();

    formProduit.reset();
    message.textContent = "Produit ajouté avec succès !";
    nomInput.focus();
});

// Supprimer un produit.
listeProduits.addEventListener("click", function (event) {
    const bouton = event.target.closest(".delete-button");

    if (!bouton) {
        return;
    }

    const id = Number(bouton.dataset.id);

    produits = produits.filter(function (produit) {
        return produit.id !== id;
    });

    sauvegarderProduits();
    afficherProduits();
    message.textContent = "Produit supprimé.";
});

// Rechercher un produit.
rechercheInput.addEventListener("input", afficherProduits);

// Filtrer par catégorie.
filtreCategorie.addEventListener("change", afficherProduits);

// Vider toute la liste.
viderListe.addEventListener("click", function () {
    if (produits.length === 0) {
        message.textContent = "La liste est déjà vide.";
        return;
    }

    const confirmation = confirm(
        "Voulez-vous vraiment supprimer tous les produits ?"
    );

    if (confirmation) {
        produits = [];
        sauvegarderProduits();
        afficherProduits();
        message.textContent = "La liste a été vidée.";
    }
});

// Afficher les produits au démarrage.
afficherProduits();
