/*
    James Carlson
    Coding Temple - SE FT-144
    Frontend - Mini Project: PokeAPI Integration Project
*/

// search for pokemon
async function choosePokemon(event) {
    event.preventDefault();
    const searchTerm = event.target.elements.pokemon.value.toLowerCase();
    const result = await getPokeData(searchTerm);
    console.log(result);
    displayPokemon(result);
}

async function getPokeData(query) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
    if(response.status == 404) {
        alert(`Pokemon not found with search term "${query}"`)
    }
    console.log(response);
    return await response.json();
}

async function displayPokemon(p) {

    // function for title cases!
    // name, types, abilities, etc

    // set and format values
    const pokemonName = capitalizeFirstLetter(p.name);
    const pokemonTypes = setTypes(p.types);
    const pokemonAbilities = await setAbilitiesOrMoves(p.name, "ability", p.abilities);
    const pokemonMoves = await setAbilitiesOrMoves(p.name, "move", p.moves);

    const html = `
    <div class="preview-card card p-3">
        <img class="card-img-top" src="${p.sprites.other["official-artwork"].front_default}" alt="${p.name}">
        <div class="card-body">
            <h4 class="card-title">${pokemonName} <span style="color:rgb(125,125,125);">#${p.id}</span></h4>
            <h6 class="card-title">${pokemonTypes}</h6>
        
            <table class="table table-bordered table-sm">
                <thead>
                    <th colspan="4">Stats</th>
                </thead>
                <tbody>
                <tr>
                    <td>HP</td>
                    <td>${p.stats[0].base_stat}</td>
                    <td>Speed</td>
                    <td>${p.stats[5].base_stat}</td>
                </tr>
                <tr>
                    <td>Attack</td>
                    <td>${p.stats[1].base_stat}</td>
                    <td>Special Atk</td>
                    <td>${p.stats[3].base_stat}</td>
                </tr>
                <tr>
                    <td>Defense</td>
                    <td>${p.stats[2].base_stat}</td>
                    <td>Special Def</td>
                    <td>${p.stats[4].base_stat}</td>
                </tr>
                </tbody>
            </table>
            <h6>Abilities</h6>
            <div class="accordion mb-3">
                ${pokemonAbilities}
            </div>
            <h6>Moves</h6>
            <div class="accordion">
                ${pokemonMoves}
            </div>
            <div class="card-body">
                <button href="#" class="btn btn-primary">Add to Team</button>
                <button onclick="removePreviewPokemon()" class="btn btn-warning">Send Back</button>
            </div>
        </div>
    </div>`

    removePreviewPokemon();  

    const div = document.getElementsByClassName("pokemon-display")[0];
    div.insertAdjacentHTML('beforeend', html);

    playCry(p.cries.latest);
}

// change names to Title Case to make them look nice! :)
function capitalizeFirstLetter(str) {
    let newStr = str.charAt(0).toUpperCase() + str.substring(1);
    let spaceIndex = newStr.indexOf("-");
    newStr = newStr.replace("-", " ");
    newStr = newStr.substring(0, spaceIndex) + " " + newStr.charAt(spaceIndex+1).toUpperCase() + newStr.substring(spaceIndex+2);
    return newStr; 
}

// make types into single line, coloring text according to type
function setTypes(types) {
    let pokemonTypes = ""
    for(let t of types) {

        // add spaces for multiple types
        if (pokemonTypes != "") {
            pokemonTypes += " "
        }
        
        // get color of type
        let typeKind = t.type.name;
        let color;
        switch(typeKind) {
            case "normal":
                color = "rgb(50, 50, 50)";
                break;
            case "fighting":
                color = "rgb(206,64,105)";
                break;
            case "flying":
                color = "rgb(143,168,221)";
                break;
            case "poison":
                color = "rgb(171,106,200)";
                break;
            case "ground":
                color = "rgb(217,119,70)";
                break;
            case "rock":
                color = "rgb(146, 135, 104)";
                break;
            case "bug":
                color = "rgb(117, 158, 35)";
                break;
            case "ghost":
                color = "rgb(82,105,172)";
                break;
            case "steel":
                color = "rgb(90,142,161)";
                break;
            case "fire":
                color = "rgb(216, 130, 69)";
                break;
            case "water":
                color = "rgb(77,144,213)";
                break;
            case "grass":
                color = "rgb(99,187,91)";
                break;
            case "electric":
                color = "rgb(196, 162, 11)";
                break;
            case "psychic":
                color = "rgb(249,113,118)";
                break;
            case "ice":
                color = "rgb(116,206,192)";
                break;
            case "dragon":
                color = "rgb(10,109,196)";
                break;
            case "dark":
                color = "rgb(24, 4, 51)";
                break;
            case "fairy":
                color = "rgb(197, 119, 192)";
                break;
            default:
                color = "rgb(0, 0, 0)";
        } 

        // append type to html element
        pokemonTypes += `<span style="color: ${color};">` + capitalizeFirstLetter(t.type.name) + "</span>";
    }

    // return full html element for pokemon types
    return pokemonTypes;
}

// get additional data when needed
async function getMoreData(query) {
    const response = await fetch(query);
    return await response.json();
}
    
// get html for pokemon's abilities/moves
async function setAbilitiesOrMoves(pName, abilityOrMove, lst) {
    let accordianSet = ""
    let numMoves = 0;

    // grab abilities/moves, up to 3
    for(let item of lst) {
        if (numMoves == 3) {
            break;
        }

        // this function performs the same for abilities and moves, but we need to access different data sets
        let itemCategory;
        if (abilityOrMove == "ability") {
            itemCategory = item.ability;
        }
        else {
            itemCategory = item.move;
        }

        // ensure we get descriptions in English
        const dataObj = await getMoreData(itemCategory.url)
        let description;

        for(let e in dataObj.effect_entries) {
            if (dataObj.effect_entries[e].language.name == "en") {
                if (dataObj.effect_entries[e].short_effect != undefined) {
                    description = dataObj.effect_entries[e].short_effect;
                }
                else if (dataObj.effect_entries[e].effect != undefined) {
                    description = dataObj.effect_entries[e].effect;
                }
                else {
                    description = "[Description not found]"
                }
                break;
            }
        }

        // create html element to append to abilities/moves
        moveName = capitalizeFirstLetter(itemCategory.name);
        accordianSet += `
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${pName}-panel-${abilityOrMove}-${itemCategory.name}">
                        <b class="ms-1">${moveName}</b>
                    </button>
                </h2>
                <div id="${pName}-panel-${abilityOrMove}-${itemCategory.name}" class="accordion-collapse collapse">
                    <div class="accordion-body">
                        ${description}
                    </div>
                </div>
            </div>`;
        numMoves++;
    }

    // return full html element for abilities/moves
    return accordianSet;
}

// play sound from Pokemon
function playCry(url) {
    let cry = new Audio(url);
    cry.play();
}

function removePreviewPokemon() {
    const divToRemove = document.getElementsByClassName("preview-card")[0];
    if(divToRemove != undefined) {
        divToRemove.remove();  
    }
}