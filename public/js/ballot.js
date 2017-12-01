'use strict';

// columnWithHeadAndWorkspace(document.body, "username", "", "My Elections")

var workspace = document.querySelector(".workspace")
var mainheader = document.querySelector(".mainheader")
mainheader.innerHTML = "Cast Ballot"

anchorListDiv(workspace, "stepNavigator", {
    "Rank Candidates": "/ballot/" + election,
    "Review ballot": "/ballotReview/" + election
  }
)

removeHrefsForCurrentLoc()  //remove hrefs that link to the current page

var rankeditems = html(workspace, "ol", "", "id=rankeditems", "class=itemlist incrementsCounter grabbable hasLabelFrame");
var unrankeditems = html(workspace, "ol", "", "id=unrankeditems", "class=itemlist clickable hasLabelFrame");
var drake = dragula([rankeditems, unrankeditems]);
drake.on('drop', function (el) { onCandidateDrop(el); })

// displayCandidate(rankeditems, "", "description", "cost", "", "")
// displayCandidate(rankeditems, "", "description", "cost", "", "")
// displayCandidate(unrankeditems, "", "description", "cost", "", "yes")
// displayCandidate(unrankeditems, "", "description", "cost", "", "yes")

loadCandidates(election, displayCandidates)

function loadCandidates(electionId, onSuccessFunction) {
  if (!electionId) {return}
  axios.get('/api/election/' + electionId + "/candidate")
    .then(response => {
      // console.log(response.data);
      onSuccessFunction(response.data)
    });
}
function displayCandidates(candidates) {
  // console.log(candidates);
  var candidate
  for (var key in candidates) {
    candidate = candidates[key]
    // displayCandidate(rankeditems, candidate.id, candidate.name, "", "")
    displayCandidate(unrankeditems, candidate.id, candidate.name, "", "")
  }
}
function displayCandidate(parent, uniq, description, cost, tie, isNew) {
  var tie = tie ? "data-tie=" + tie : ""
  var box = html(parent, "li", "", "class=candidate", "onclick=candidateClick(this)", "data-id=" + uniq, tie);

  if ("new" == isNew) { div(box, "", "newitem", "new");}
  var rankingTools = div(box, "", "rankingTools");
  html(rankingTools, "input", "", "type=checkbox", "name=ballotcheck", "id=ballotcheck-" + uniq);
  div(rankingTools, "", "banish", "", "onclick=processSelected(event,banish)");
  div(rankingTools, "", "tie", "", "onclick=processSelected(event,tieSelected)");
  html(rankingTools, "label", "", "class=check", "for=ballotcheck-" + uniq);
  div(rankingTools, "", "rankdisplay");

  var details = div(box, "", "candidateDetails");
  div(details, "", "grippy");
  div(details, "", "candidateDescription", description);
  div(details, "", "candidateCost", cost);
}


function markTieAtt(item, position) {
  if (position == "none") {
    item.removeAttribute("data-tie");
    // item.style["background-color"] = "";
  }
  else {
    item.setAttribute("data-tie", position);
    // item.style["background-color"] = "yellow";
  }
}
function onCandidateDrop(item) {
  var previousItem, previousItemTieAtt;

  //handle ties
  previousItem = item.previousElementSibling;
  if (previousItem) { previousItemTieAtt = previousItem.getAttribute("data-tie"); }
  if (previousItemTieAtt == "start" || previousItemTieAtt == "middle") {
    markTieAtt(item, "middle");
  }
  else { markTieAtt(item, "none"); }

  //do standard candidate move stuff
  onCandidateMove();
}
function onReorder(el) {
  //placeholder
}
function processSelected(event, processFunction) {
  event.preventDefault();
  event.stopPropagation();
  var functionVars = {}, el, els = document.querySelectorAll(".rankingTools > input:checked");
  for (var i = 0; i < els.length; i++) {
    processFunction(els[i], functionVars);
  }
  onCandidateMove();
}
function tieSelected(el, vars) {
  var item = el.parentElement.parentElement, tieAtt = item.getAttribute("data-tie");
  if (!vars.rankeditems) {
    vars.rankeditems = document.getElementById("rankeditems");
    if (!tieAtt) { markTieAtt(item, "start"); }
    else if (tieAtt == "end") { markTieAtt(item, "middle"); }
  }
  else {
    insertAfter(item, vars.afterEl);
    markTieAtt(item, "middle");
  }
  vars.afterEl = item;  //save off the item, so we can append after it on the next iteration
  el.checked = false;
}
function removeCandidate(item) {
  item.parentElement.removeChild(item)
}
function banish(el, vars) {
  var item = el.parentElement.parentElement
  if (!vars.unrankeditems) { vars.unrankeditems = document.getElementById("unrankeditems"); }
  //unckeck, remove tie attributes, and send to the end of the unranked list
  el.checked = false;
  markTieAtt(item, "none");
  vars.unrankeditems.appendChild(item);
}
function candidateClick(el) {
  var rankeditems = document.getElementById("rankeditems");
  if (el.parentElement == rankeditems) { return; }  //no action when clicking a ranked item

  rankeditems.appendChild(el);
  onCandidateMove(rankeditems);
}
function markTieEnds() {
  //noe - this doesn't account for cases where the last item is part of a tie. The behavior isn't too bad, though (it allows you to drag items onto the end of the tie), so I'm leaving it for now
  var selector = "#rankeditems > .candidate[data-tie='middle'] + .candidate:not([data-tie='middle']):not([data-tie='end'])";
  var itemsAfterTies = document.querySelectorAll(selector);
  for (var i = 0; i < itemsAfterTies.length; i++) {
    markTieAtt(itemsAfterTies[i].previousElementSibling, "end");
  }
}
function markTieStarts() {
  var selector = "#rankeditems > .candidate:not([data-tie='start']):not([data-tie='middle']) + [data-tie='middle']";
  var itemsStartingTies = document.querySelectorAll(selector);
  for (var i = 0; i < itemsStartingTies.length; i++) {
    markTieAtt(itemsStartingTies[i], "start");
  }
  selector = "#rankeditems > [data-tie='middle']:first-child";
  itemsStartingTies = document.querySelectorAll(selector);
  for (var i = 0; i < itemsStartingTies.length; i++) {
    markTieAtt(itemsStartingTies[i], "start");
  }
}
function removeLoneTieItems() {
  var nextSibling;
  var selector = "#rankeditems > .candidate:not([data-tie]) + .candidate[data-tie]";
  var itemsAlone = document.querySelectorAll(selector);
  for (var i = 0; i < itemsAlone.length; i++) {
    nextSibling = itemsAlone[i].nextElementSibling;
    if (!nextSibling || !nextSibling.getAttribute("data-tie")) { markTieAtt(itemsAlone[i], "none"); }
  }
  selector = "#rankeditems > [data-tie]:first-child";
  itemsAlone = document.querySelectorAll(selector);
  for (var i = 0; i < itemsAlone.length; i++) {
    nextSibling = itemsAlone[i].nextElementSibling;
    if (!nextSibling || !nextSibling.getAttribute("data-tie")) { markTieAtt(itemsAlone[i], "none"); }
  }
}
function cleanUpTies() {
  // mergeIntoTies();
  markTieStarts();
  markTieEnds();
  removeLoneTieItems();
}
function onCandidateMove(rankeditems) {
  cleanUpTies();
  rankeditems = rankeditems || document.getElementById("rankeditems");
  updateInstructions(rankeditems.childElementCount);
  saveRankings();
}
function updateInstructions(rankeditemsCount) {
  // var header = document.getElementById("instructions");
  // if (document.getElementById("unrankeditems").childElementCount == 0) {
  //   header.innerHTML = "You may continue sorting items. When satisfied, you can move on to the Review step.";
  //   return;
  // }
  // header.innerHTML = "Select your " + ordinalSuffix(rankeditems.childElementCount + 1) + " choice";
}
// var saveStatuses = {}, saveStatuses.status = "", saveStatuses.
var saveStatus = ""
function saveRankings() {
  // console.log(saveStatus)
  //if a save is already in progress, just record that we need to save again and quit
  if (("saving" == saveStatus) || ("queued" == saveStatus)) {
    saveStatus = "queued"
    return "queued"
  }
  // console.log(saveStatus)
  saveStatus = "saving"
  updateStatusDisplay("Saving")
  var candidateRanks = {}
  candidateRanks.votes = makeRankingsArray()
  batchVote(election, candidateRanks, finishSaveRankings)
  // var request = {}
  // request.data = makeRankingsArray()
  // request.api = "ballot"
  // request.record = election
  // saveRankingsToServer(request);
  return "saving"
}
function finishSaveRankings(response) {
  // console.log("finishSaveRankings");
  // console.log(saveStatus)
  console.log(response);
  if ("queued" == saveStatus) {
    saveStatus = "saved"  //reset saveStatus so that saveRankings doesn't just quit
    saveRankings()
    return
  }
  saveStatus = "saved"
  updateStatusDisplay("Saved!")
  // console.log(saveStatus)
}
function updateStatusDisplay(newStatus) {
  var saveStatusDomEl = document.getElementById("saveStatusDomEl")
  if (!saveStatusDomEl) { saveStatusDomEl = div(workspace, "saveStatusDomEl")}
  saveStatusDomEl.innerHTML = newStatus
}
function makeRankingsArray () {
  var rankings = [];
  candidatesToArray(document.querySelectorAll("#rankeditems .candidate"), rankings, "getRanking");
  candidatesToArray(document.querySelectorAll("#unrankeditems .candidate"), rankings);

  return rankings
}

function candidatesToArray (candidates, targetArray, isRanked) {
  var tieStat, isTiedWthPrevious, rank = 0
  for (var i = 0; i < candidates.length; i++) {
    var item = {};
    item.candidate_id = candidates[i].getAttribute("data-id");

    if (isRanked != "getRanking") {
      item.rank = 0
      targetArray.push(item)
      continue
    }

    // tieStat = candidates[i].getAttribute("data-tie")
    // isTiedWthPrevious = ((tieStat == "middle") || (tieStat == "end"))
    // if (isTiedWthPrevious) {item.rank = rank}
    else {item.rank = ++rank}

    targetArray.push(item);
  }
};
// var candidateRanks = {}
// candidateRanks.votes = []
// candidateRanks.votes.push({"candidate_id": 10, "rank":1})
// candidateRanks.votes.push({"candidate_id": 1, "rank":1})
// batchVote(election, candidateRanks)
function batchVote(electionId, candidateRanks, onSuccessFunction) {
  // console.log(candidateRanks)
  if (!electionId) {return}
  axios.post('/api/election/' + electionId + '/batchvote', candidateRanks)
    .then(response => {
      // console.log(response.data);
      onSuccessFunction(response.data)
    });
}
getRankedCandidates(1,1)
getRankedCandidates(1,10)
function getRankedCandidates(electionId, candidateId, onSuccessFunction) {
  if (!electionId) {return}
  // axios.get('/api/election/' + electionId + '/candidate')
  axios.get('/api/election/' + electionId + '/candidate/' + candidateId)
  // axios.get('/api/election/' + electionId + '/batchvote/' + candidateId)
  // axios.get('/api/election/' + electionId + '/batchvote')
    .then(response => {
      console.log(response.data);
      // onSuccessFunction(response.data)
    });
}
