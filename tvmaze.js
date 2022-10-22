"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(terms) {
  const res = await axios.get(`http://api.tvmaze.com/search/shows?q=${terms}`);
  const showArr = res.data;

  // for each object in the array make a subarray for the specific keys using map
  const newShowArr = showArr.map((obj) => ({
    id: obj.show.id,
    name: obj.show.name,
    summary: obj.show.summary,
    image: obj.show.image.original,
  }));
  return newShowArr;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="${show.name}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-episodes" type="submit">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
    );
    $showsList.append($show);
    $(".btn-episodes").css({
      "background-color": "lightblue",
      color: "white",
    });
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);
  $episodesArea.hide();
  populateShows(shows);
  // reset value of input
  $("#search-query").val("");
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

// click event for the button under the show. it looks for the parent element and grabs the show id which it sends to getEpisodes
$("#shows-list").on("click", ".btn-episodes", async function (evt) {
  $episodesArea.show();
  $(".show-eps").remove();
  const target = $(evt.target);
  const epParent = target.closest(".Show");
  const id = epParent.attr("id");

  await getEpisodesOfShow(id);
});

// takes the show ID and looks up the info for the eposides from the API and returns an array of objects with a few key items for each ep.
async function getEpisodesOfShow(id) {
  const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  const epArr = res.data;

  // for each object in the array make a subarray for the specific keys using map
  const episodes = epArr.map((obj) => ({
    id: obj.id,
    name: obj.name,
    season: obj.season,
    number: obj.number,
  }));
  console.log(episodes);
  return populateEpisodes(episodes);
}

// takes the episodes and adds them to the HTML code as a list
function populateEpisodes(episodes) {
  for (let eps of episodes) {
    const $eps = $(
      `<li class = "show-eps"> Name: ${eps.name}, Season: ${eps.season}, Episode Number: ${eps.number}</li>`
    );
    $("#episodes-list").append($eps);
  }
}
