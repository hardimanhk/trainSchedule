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
console.log("anything");

$("#submit").click(function(event) {
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
        frequency: intervalTime,
        nextTrain: nextTrain.format("hh:mm"),
        minutesAway: minutesAway.toString(),
    });

    $("#train-name").val("");
    $("#destination").val("");
    $("#first-time").val("");
    $("#frequency").val("");
});

database.ref().on("child_added", function(snapshot){
    var thisTrainName = snapshot.val().trainName;
    var thisDestination = snapshot.val().destination;
    var thisFrequency = snapshot.val().frequency;
    var thisUpcomingTime = snapshot.val().nextTrain;
    var thisMinutesAway = snapshot.val().minutesAway;

    var newRow = $("<tr>").append(
        $("<td>").text(thisTrainName),
        $("<td>").text(thisDestination),
        $("<td>").text(thisFrequency),
        $("<td>").text(thisUpcomingTime),
        $("<td>").text(thisMinutesAway)
    )
    
    $("#train-table-body").prepend(newRow);

});