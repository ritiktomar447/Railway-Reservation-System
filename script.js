let mainfare;
function fare(ele){
    const data=ele;
    mainfare=data;
}

function processPayment() {
    const fare = document.getElementById("fare").value;
    const paymentType = document.getElementById("paymentType").value;
    fare.innerHTML(`$mainfare`);

    if (fare && paymentType) {
        alert("Payment Successful!");

        // Generate ticket after payment
        generateTicket();
    } else {
        alert("Please fill in all payment details.");
    }
}

function generateTicket() {
    // Mock ticket data
    const passengerName = "Ram";
    const passengerId = "123456";
    const gender = "Male";
    const age = "30";
    const pnrNo = "PNR123456";
    const seatNo = "A1-21";
    const reservationStatus = "Confirmed";
    const aadharNo = "987654321012";

    const ticketDetails = `
        <p><strong>Passenger Name:</strong> ${passengerName}</p>
        <p><strong>Passenger ID:</strong> ${passengerId}</p>
        <p><strong>Gender:</strong> ${gender}</p>
        <p><strong>Age:</strong> ${age}</p>
        <p><strong>PNR Number:</strong> ${pnrNo}</p>
        <p><strong>Seat Number:</strong> ${seatNo}</p>
        <p><strong>Reservation Status:</strong> ${reservationStatus}</p>
        <p><strong>Aadhaar Number:</strong> ${aadharNo}</p>
    `;

    document.getElementById("ticketDetails").innerHTML = ticketDetails;

    // Navigate to ticket tab
    var ticketTab = new bootstrap.Tab(document.querySelector('#ticket-tab'));
    ticketTab.show();
}