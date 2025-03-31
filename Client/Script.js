document.addEventListener("DOMContentLoaded", () => {
    fetchSubscribers();
});

//html for list attributes
const innerhtml = (sub) => `${sub.Name} ${sub.EmailAddress} <button  class="btn btn-danger btn-sm float-end" onclick="removeSubscriber('${sub.EmailAddress}', this)">Remove</button>`;
let subscribers_count = 0;
let pageLoadTime = Date.now();
let tpressed = 0;

function isGeneric(email) {
    const genericEmailDomains = ["gmail.com", "outlock.com", "yahoo.com", "msn.com"];
    let domain = email.split("@")[1];
    return genericEmailDomains.includes(domain);
}

async function fetchSubscribers() {
    let response = await fetch(`http://localhost:3000/subscribers`);

    if (!response.ok) {
        console.error("API Error:", response.status, response.statusText);
        APIerror('');
        return;
    }

    let data = await response.json(); // Get raw response
    if (!Array.isArray(data)) {
        console.error("Error: Expected an array but got", data);
        return; // Stop execution if it's not an array
    }

    let list = document.getElementById('list');
    list.innerHTML = ''; // Clear list before re-rendering

    data.forEach(sub => {
        let li = document.createElement('li');
        li.classList.add("list-group-item", "list-group-item-action");
        li.innerHTML = innerhtml(sub);
        list.appendChild(li);
        subscribers_count++;
    });

    //req: 4.d
    gtag("event", "on_load", {
        subscribers_count: subscribers_count
    });
}

let emailInput = document.getElementById('email');
let typeTime = null;
emailInput.addEventListener("input", function () {
    if (!typeTime) typeTime = Date.now();
});
//add subscriber to front-end
async function addSubscriber() {
    tpressed++;
    let hasErrors = true;
    let name = document.getElementById('name').value;
    let email = emailInput.value;

    let emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    //form validations
    if (name === '' || email === '') alert('Please provide a Name and an Email.')

    if (!emailPattern.test(email) && email !== '') {
        alert("Please enter a valid email address like: example@email.com");
        return;
    }

    let response = await fetch('http://localhost:3000/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
    });

    if (response.ok) {
        let li = document.createElement('li');
        li.classList.add("list-group-item", "list-group-item-action");
        li.innerHTML = innerhtml({ Name: name, EmailAddress: email });
        document.getElementById('list').appendChild(li);
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        hasErrors = false;
        subscribers_count++;
    }
    else {
        APIerror('Add');
        return;
    }

    //Google analytics
    //reqL 4.a 
    gtag("event", "click_add_subscriber", {
        // time_needed: Math.round(Date.now() - typeTime) / 10000,
        time_needed: (Date.now() - typeTime) / 1000,
        email_type: isGeneric(email) ? "generic" : "personal",
        submission_errors: hasErrors
    });

    let timeToClick = (Date.now() - pageLoadTime) / 1000;  // Convert milliseconds to seconds

    // Send the data to Google Analytics
    // req: 5. Adding a new event
    gtag("event", "time_to_add", {
        add_time_need: timeToClick,  // Time it took for the user to click the "Add" button
        btn_times_pressed: tpressed //how many times btn add clicked
    });
}

//delete subscriber to front-end
async function removeSubscriber(email, button) {

    let response = await fetch('http://localhost:3000/subscribers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });

    if (response.ok) {
        let li = button.parentElement;
        let index = Array.from(li.parentElement.children).indexOf(li);
        li.remove();

        //google analytics
        //req: 4.b
        gtag("event", "click_remove_subscriber", {
            removed_position: `${++index}/${subscribers_count}`,
            email_type: isGeneric(email) ? "generic" : "personal"
        });
        subscribers_count--;
    }
    else APIerror("Remove");
}

//req: 4.c
const APIerror = (api_call) => {
    let location = 'default';

    if (api_call)
        location = api_call;

    gtag("event", "error_message", {
        error_message: `error occurred `,
        location: location
    });
}