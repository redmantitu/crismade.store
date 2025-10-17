// Acest script foloseste Node.js pentru a automatiza adaugarea de produse
// in fisierul index.html si pentru a trimite modificarile pe GitHub.

const fs = require('fs');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

// Functie pentru a genera codul HTML al unui produs
function generateProductHTML(data) {
    const { name, image, description, price, isPromo, promoPrice } = data;
    const imageName = image.split('/').pop(); // Extragem numele fisierului din cale
    
    const priceHTML = isPromo
        ? `<div class="mt-4 text-3xl font-bold flex justify-center items-baseline gap-3">
            <span class="text-gray-400 line-through text-2xl">${price} RON</span>
            <span class="text-red-600">${promoPrice} RON</span>
        </div>`
        : `<p class="mt-4 text-3xl font-bold text-brand-accent">${price} RON</p>`;

    const promoBanner = isPromo 
        ? `<div class="bg-brand-accent text-white text-center py-2 font-semibold tracking-wider">PROMOȚIE</div>`
        : '';
    
    const cardBorder = isPromo ? 'border-2 border-brand-accent' : '';

    return `
            <!-- Produs ${name} -->
            <div class="bg-white rounded-lg overflow-hidden product-card ${cardBorder}">
                ${promoBanner}
                <img src="imagini/${imageName}" alt="Lumânare de botez ${name}" class="w-full h-auto object-cover">
                <div class="p-8 text-center">
                    <h3 class="text-3xl text-brand-text">${name}</h3>
                    <p class="mt-3 text-brand-text/70 h-16">${description}</p>
                    ${priceHTML}
                    <a href="mailto:comenzi.crismade.store@gmail.com?subject=Comanda Lumanare Botez - ${name}" class="mt-6 inline-block bg-brand-primary text-white font-semibold py-3 px-10 rounded-full shadow-lg hover:bg-opacity-90 transition-all">
                        Comandă Acum
                    </a>
                </div>
            </div>`;
}

async function run() {
    console.log('--- Asistent adăugare produs nou Crismade ---');

    const name = await question('Numele produsului (ex: Model "Primăvara"): ');
    const image = await question('Numele fișierului imagine (ex: model-primavara.jpg): ');
    const description = await question('Descriere scurtă: ');
    const price = await question('Preț normal (RON): ');
    
    const isPromoAnswer = await question('Este în promoție? (da/nu): ');
    const isPromo = isPromoAnswer.toLowerCase() === 'da';
    
    let promoPrice = '';
    if (isPromo) {
        promoPrice = await question('Preț promoțional (RON): ');
    }
    
    rl.close();

    const newProductData = { name, image, description, price, isPromo, promoPrice };
    const newProductHTML = generateProductHTML(newProductData);

    try {
        console.log('\n1. Actualizez fisierul index.html...');
        const indexPath = 'index.html';
        let htmlContent = fs.readFileSync(indexPath, 'utf8');

        // Gasim sectiunea existenta de produse
        const regex = /<!-- SCRIPT_GENERATED_PRODUCTS_SECTION -->(.*)<!-- \/SCRIPT_GENERATED_PRODUCTS_SECTION -->/s;
        const match = htmlContent.match(regex);
        
        if (!match) {
            throw new Error('Nu am putut găsi placeholder-ul de produse în index.html. Asigură-te că există <!-- SCRIPT_GENERATED_PRODUCTS_SECTION --> și <!-- /SCRIPT_GENERATED_PRODUCTS_SECTION -->.');
        }

        const existingProductsHTML = match[1].trim();
        const updatedProductsHTML = `<!-- SCRIPT_GENERATED_PRODUCTS_SECTION -->\n${existingProductsHTML}\n${newProductHTML.trim()}\n            <!-- /SCRIPT_GENERATED_PRODUCTS_SECTION -->`;

        htmlContent = htmlContent.replace(regex, updatedProductsHTML);
        fs.writeFileSync(indexPath, htmlContent, 'utf8');
        console.log('   ✓ Fisierul index.html a fost actualizat cu succes.');

        console.log('\n2. Trimit modificarile catre GitHub...');
        
        console.log('   - git add .');
        execSync('git add .');
        
        const commitMessage = `Adauga produs: ${name}`;
        console.log(`   - git commit -m "${commitMessage}"`);
        execSync(`git commit -m "${commitMessage}"`);

        console.log('   - git push');
        execSync('git push');
        
        console.log('\n✓ Procesul a fost finalizat cu succes! Modificarile sunt acum online.');

    } catch (error) {
        console.error('\n--- A apărut o eroare! ---');
        console.error(error.message);
        console.error('\nProcesul a fost oprit. Te rog verifică eroarea de mai sus.');
    }
}

run();
