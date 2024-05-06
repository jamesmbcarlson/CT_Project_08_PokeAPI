/*
    James Carlson
    Coding Temple - SE FT-144
    Frontend - Mini Project: PokeAPI Integration Project
*/

// global variables for handling Pokemon team
let pokemonTeam = [];
let previewPokemonObj;
let pokemonToMove;

const htmlTeamContainer = `
    <div id="team-container" class="my-5 p-1">
        <h1 class="my-4">Your Team</h1>
        <div id="team-cards-container" class="m-3">
            <div class="row">
                <div id="container-card-1" class="col-xl-4 col-lg-6 d-flex justify-content-center mb-4">
                    
                </div>
                <div id="container-card-2" class="col-xl-4 col-lg-6 d-flex justify-content-center mb-4">
                    
                </div>
                <div id="container-card-3" class="col-xl-4 col-lg-6 d-flex justify-content-center mb-4">
                    
                </div>
                <div id="container-card-4" class="col-xl-4 col-lg-6 d-flex justify-content-center mb-4">
                    
                </div>
                <div id="container-card-5" class="col-xl-4 col-lg-6 d-flex justify-content-center mb-4">
                    
                </div>
                <div id="container-card-6" class="col-xl-4 col-lg-6 d-flex justify-content-center mb-4">
                    
                </div>
            </div>
        </div>
    </div>`

// button is pressed -> search for pokemon
async function choosePokemon(event) {
    event.preventDefault();
    const searchTerm = event.target.elements.pokemon.value.toLowerCase();
    event.target.elements.pokemon.value = "";
    const result = await getPokeData(searchTerm);
    previewPokemon(result);
}

// return result from pokemon request
async function getPokeData(query) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
    // alert user if no search result is found
    if(response.status == 404) {
        alert(`Pokemon not found with search term "${query}"`)
    }
    return await response.json();
}

// display Pokemon search results
async function previewPokemon(p) {
    // store result in local object; 
    const pokemonObj = p;
    pokemonObj.types = setTypes(p.types);
    pokemonObj.abilities = await setAbilitiesOrMoves(p.name, "ability", p.abilities);
    pokemonObj.moves = await setAbilitiesOrMoves(p.name, "move", p.moves);
    pokemonObj.name = toTitleCase(p.name); // TO-DO: for some reason this is changing the value of the result's name; I really don't think it should be, so I need to check what's happening here
    previewPokemonObj = pokemonObj;
    
    // generate HTML element and write to page
    const htmlID = "preview-card"
    const html = createHTMLElement(pokemonObj, htmlID, true)
    removePokemon("preview-card");  
    const div = document.getElementsByClassName("pokemon-display")[0];
    div.insertAdjacentHTML('beforeend', html);

    // play Pokemon sound
    playCry(p.cries.latest);
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
        pokemonTypes += `<span style="color: ${color};">` + toTitleCase(t.type.name) + "</span>";
    }

    // return full html element for pokemon types
    return pokemonTypes;
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

        // look for and fetch English descriptions
        const dataObj = await getMoreData(itemCategory.url)
        let description = "[Description not found]"; // default description

        // search effect_entries for description
        for(let e in dataObj.effect_entries) {
            if (dataObj.effect_entries[e].language.name == "en") {
                if (dataObj.effect_entries[e].short_effect != undefined) {
                    description = dataObj.effect_entries[e].short_effect;
                }
                else if (dataObj.effect_entries[e].effect != undefined) {
                    description = dataObj.effect_entries[e].effect;
                }
                break;
            }
        }
        // if effect_entries are empty, search flavor_text_entries
        if (description == "[Description not found]") {
            for(let e in dataObj.flavor_text_entries) {
                if(dataObj.flavor_text_entries[e].language.name == "en") {
                    if(dataObj.flavor_text_entries[e].flavor_text != undefined) {
                        description = dataObj.flavor_text_entries[e].flavor_text;
                        break;
                    }
                }
            }
        }

        // create html element to append to abilities/moves
        moveName = toTitleCase(itemCategory.name);
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

// get additional data when needed
async function getMoreData(query) {
    const response = await fetch(query);
    return await response.json();
}

// create card in HTML to be inserted into page
function createHTMLElement(p, htmlID, isPreviewing) {

    let html = `
     <div id="${htmlID}" class="card p-3">
         <img class="card-img-top" src="${p.sprites.other["official-artwork"].front_default}" alt="${p.name}">
         <div class="card-body">
             <h4 class="card-title">${p.name} <span style="color:rgb(125,125,125);">#${p.id}</span></h4>
             <h6 class="card-title">${p.types}</h6>
         
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
                 ${p.abilities}
             </div>
             <h6>Moves</h6>
             <div class="accordion">
                 ${p.moves}
             </div>
             <div class="card-body">`;

    if(isPreviewing && pokemonTeam.length < 6) {
        html += `<button onclick="addToTeam()" class="btn btn-primary">Add to Team</button>`
    }
    else if(isPreviewing) {
        html += `<button class="btn btn-primary-outline style="cursor:pointer;" title="Team cannot exceed 6 members">Add to Team</button>`
    }

    html += `
                 <button onclick="removePokemon('${htmlID}')" class="btn btn-warning">Send Back</button>
             </div>
         </div>
     </div>`

    return html;
}

// add Pokemon to team roster
function addToTeam() {
    // goto page top
    globalThis.scrollTo({ top: 0, left:0, behavior: "instant"});

    // add teams container
    if(pokemonTeam.length == 0) {
        const teamDiv = document.getElementById("team-space");
        teamDiv.innerHTML = htmlTeamContainer;
    }

    // add Pokemon to js list
    pokemonTeam.push(previewPokemonObj);

    // create HTML element for team card and insert in proper container
    const htmlID = `card-${pokemonTeam.length}`
    const html = createHTMLElement(previewPokemonObj, htmlID, false)
    const div = document.getElementById(`container-card-${pokemonTeam.length}`);
    div.insertAdjacentHTML('beforeend', html);
    playCry(previewPokemonObj.cries.latest);
    
    removePokemon("preview-card");  
}

// remove html element at given id
function removePokemon(id) {

    // remove html element if found
    const divToRemove = document.getElementById(id);
    if(divToRemove != undefined) {
        divToRemove.remove();  

        // for team cards, remove Pokemon from team
        if(id != "preview-card") {
            let cardNum = id.slice(-1);
            pokemonTeam.splice(cardNum-1, 1);

            // shift each postion as appropriate
            if(cardNum <= pokemonTeam.length) {
                pokemonToMove = pokemonTeam[cardNum-1];
                moveCardDown(id);
            }
            else if(pokemonTeam.length == 0) {
                const teamDiv = document.getElementById("team-space");
                teamDiv.innerHTML = "";
            }
        }
    }

    // update disabled add-to-team button
    if(pokemonTeam.length == 5) {
        try{
            const buttonDiv = document.getElementById("preview-card")
            .getElementsByClassName("card-body")[0].getElementsByClassName("card-body")[0];
                buttonDiv.innerHTML = `
                <button onclick="addToTeam()" class="btn btn-primary">Add to Team</button>
                <button onclick="removePokemon("preview-card")" class="btn btn-warning">Send Back</button>`
        }
        catch {}
    }
}

function moveCardDown(id) {
        
    // create HTML element for team card and insert in proper container
    const newCardNum = id.slice(-1);
    const html = createHTMLElement(pokemonToMove, id, false)
    const div = document.getElementById(`container-card-${newCardNum}`);
    div.innerHTML=html;

    const nextCardNum = Number(newCardNum) + 1;
    
    // move down next card
    if(newCardNum != pokemonTeam.length)
    {
        pokemonToMove = pokemonTeam[newCardNum];
        moveCardDown(`card-${nextCardNum}`);
    }
    else {
        removePokemon(`card-${nextCardNum}`);
    }

    console.log(pokemonTeam);
}

// play sound from Pokemon
function playCry(url) {
    let cry = new Audio(url);
    cry.volume = 0.25;
    cry.play();
}

// change names to Title Case to make them look nice! :)
function toTitleCase(str) {
    let newStr = str.charAt(0).toUpperCase() + str.substring(1);

    // remove hyphens and replace with spaces
    while (newStr.includes("-")) {
        let spaceIndex = newStr.indexOf("-");
        newStr[spaceIndex] = " ";
        newStr = newStr.substring(0, spaceIndex) + " " + newStr.charAt(spaceIndex+1).toUpperCase() + newStr.substring(spaceIndex+2);
    }

    return newStr; 
}