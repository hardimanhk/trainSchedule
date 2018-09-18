// Initialize Firebase
var config = {
    apiKey: "AIzaSyCVAujYSgrD5yRQlbejhYvcMpGcg7Mm5fg",
    authDomain: "train-time-homework-85778.firebaseapp.com",
    databaseURL: "https://train-time-homework-85778.firebaseio.com",
    projectId: "train-time-homework-85778",
    storageBucket: "train-time-homework-85778.appspot.com",
    messagingSenderId: "1003529128605"
};
firebase.initializeApp(config);

var database = firebase.database();

// create vars
var trainName = "";
var destination = "";
var firstTime = "";
var intervalTime = "";
var nextTrain = "";
var minutesAway = "";
var rowCount = 0;
console.log("anything");

$("#submit").click(function (event) {
    event.preventDefault();

    trainName = $("#train-name").val().trim();
    destination = $("#destination").val().trim();
    firstTime = $("#first-time").val().trim();
    intervalTime = $("#frequency").val().trim();

    var firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");

    var diffTime = moment().diff(moment(firstTimeConverted), "minutes");

    var remainder = diffTime % intervalTime;

    minutesAway = intervalTime - remainder;

    nextTrain = moment().add(minutesAway, "minutes");
    console.log(trainName, destination, intervalTime, nextTrain, minutesAway);

    database.ref().push({
        trainName: trainName,
        destination: destination,
        firstTime: firstTime,
        frequency: intervalTime,
        nextTrain: nextTrain.format("hh:mm"),
        minutesAway: minutesAway.toString(),
        row: rowCount
    });

    $("#train-name").val("");
    $("#destination").val("");
    $("#first-time").val("");
    $("#frequency").val("");
});

database.ref().on("child_added", function (snapshot) {
    var thisTrainName = snapshot.val().trainName;
    var thisDestination = snapshot.val().destination;
    var thisFrequency = snapshot.val().frequency;
    var thisUpcomingTime = snapshot.val().nextTrain;
    var thisMinutesAway = snapshot.val().minutesAway;

    var newRow = $("<tr>").append(
        $("<td>").text(thisTrainName),
        $("<td>").text(thisDestination),
        $("<td>").text(thisFrequency),
        $(`<td id='next-train${rowCount}'>`).text(thisUpcomingTime),
        $(`<td id='minutes-away${rowCount}'>`).text(thisMinutesAway)
    )
    newRow.addClass("table-row");
    newRow.attr("row-number", rowCount);

    $("#train-table-body").prepend(newRow);
    rowCount++;

});

// to update each minute: loop through each existing row and update to current time
// need data from the database
// need to access each row's 4th and 5th elements
// use a value change, change the data in the database and use that to trigger the update to the page
// this was a fucking challenge :)
var updateInterval = setInterval(updateTime, 60000);

function updateTime() {
    var query = firebase.database().ref().orderByKey();
    query.once("value")
        .then(function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                var thisFirstTime = childSnapshot.val().firstTime;
                var thisFrequency = childSnapshot.val().frequency;
                // var thisFirstConverted = moment(thisFirstTime, "HH:mm").subtract(1, "years");
                var thisDiffTime = moment().diff(moment(thisFirstTime, "HH:mm").subtract(1, "years"), "minutes");
                // console.log(thisFirstTime, thisFrequency, thisDiffTime);
                var thisRemainder = thisDiffTime % thisFrequency;
                var newMinutes = thisFrequency - thisRemainder;
                var newTime = moment().add(newMinutes, "minutes").format("hh:mm");
                var key = childSnapshot.key;
                database.ref(key).update({
                    nextTrain: newTime,
                    minutesAway: newMinutes,
                });
                var thisRow = childSnapshot.val().row;
                var idNameNext = "next-train" + thisRow;
                var idNameMinutes = "minutes-away" + thisRow;
                $("#"+idNameNext).text(newTime);
                $("#"+idNameMinutes).text(newMinutes);
            });
        });
}