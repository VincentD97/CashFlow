const SERVER_URL = "http://localhost:5000";

let user = "";


/*Dropdown Menu*/
$('.dropdown').click(function () {
    $(this).attr('tabindex', 1).focus();
    $(this).toggleClass('active');
    $(this).find('.dropdown-menu').slideToggle(300);
});
$('.dropdown').focusout(function () {
    $(this).removeClass('active');
    $(this).find('.dropdown-menu').slideUp(300);
});
$('.dropdown .dropdown-menu li').click(function () {
    $(this).parents('.dropdown').find('span').text($(this).text());
    $(this).parents('.dropdown').find('input').attr('value', $(this).attr('id'));
});
/*End Dropdown Menu*/

$('.dropdown-menu li').click(function() {
    user = $(this).parents('.dropdown').find('input').val();
}); 

const today = new Date();
const year = today.getFullYear().toString();
const month = (today.getMonth() < 9 ? "0" : "") + (today.getMonth() + 1).toString();
const day = (today.getDate() < 10 ? "0" : "") + today.getDate().toString();
document.querySelector('input[name = "input-date"]').placeholder = `${year}/${month}/${day}`;

document.getElementById("cb").checked

document.getElementById("add").onclick = () => {
    const date = document.querySelector('input[name = "input-date"]').value;
    const amount = document.querySelector('input[name = "input-amount"]').value;
    const purpose = document.querySelector('input[name = "input-purpose"]').value;
    const msg = document.getElementById('input-validation-msg');

    if (!(user && date && amount && purpose)) {
        msg.innerHTML = "All fields must be non-empty !";
    } else if (!/^([0-9]{4})\/([0-9]{2})\/([0-9]{2})$/.test(date)) {
        msg.innerHTML = "Date must be in the format YYYY/MM/DD !";
    } else {
        msg.innerHTML = "";
        console.log("Sending add request ...");

        $.ajax({
            url: `${SERVER_URL}/add`,
            type: "GET",
            data: {
                addtime: Date.now(),
                user: user,
                date: date,
                amount: amount,
                purpose: purpose
            },
            success: loadData
        });

        if (document.getElementById("cb").checked) {
            console.log("herererer")
            $.ajax({
                url: `${SERVER_URL}/add`,
                type: "GET",
                data: {
                    addtime: Date.now(),
                    user: user == "Vincent" ? "Cecilia" : "Vincent",
                    date: date,
                    amount: -amount,
                    purpose: purpose
                },
                success: loadData
            });
        }

        document.getElementById("cb").checked = false;        
    }
}






const loadData = data => {
    console.log("response: ", data);

    // UPDATE SUMMARY
    const sender = document.getElementById("sender");
    const pay_prompt = document.getElementById("pay-prompt");
    const receiver = document.getElementById("receiver");
    const amount = document.getElementById("amount");
    
    const v_pay_c = data.v_pay_c;

    sender.innerHTML = v_pay_c >= 0 ? "Vincent" : "Cecilia";
    pay_prompt.innerHTML = v_pay_c == 0 ? "&" : "PAY";
    receiver.innerHTML = v_pay_c >= 0 ? "Cecilia" : "Vincent";
    amount.innerHTML = v_pay_c == 0 ? "\\(◦'⌣'◦)/" : Math.abs(v_pay_c);



    // UPDATE TABLE

    const fieldnames = data.fieldnames;
    fieldnames.splice(fieldnames.indexOf("addtime"), 1);

    const table = document.getElementById("cashflow");
    table.innerHTML = "";

    // Add field names
    const tr = document.createElement("tr");
    for (const field of fieldnames) {
        const th = document.createElement("th");
        th.appendChild(document.createTextNode(field));
        tr.appendChild(th);
    }
    // One more th for the delete button
    tr.appendChild(document.createElement("th"));
    table.appendChild(tr);

    // Add data
    for (const row of data.cashflow) {
        const tr = document.createElement("tr");
        for (const field of fieldnames) {
            const td = document.createElement("td");
            td.appendChild(document.createTextNode(row[field]));
            tr.appendChild(td);
        }

        const delete_icon = document.createElement("span");
        delete_icon.className ="fa fa-trash delete-icon";
        delete_icon.onclick = () => {
            const confirm = window.confirm("Are you sure to delete a row? You cannot undo this action!");
            if (!confirm) {
                return;
            }

            console.log(`Sending delete request for addtime=${row["addtime"]}...`);
            $.ajax({
                url: `${SERVER_URL}/delete`,
                type: "GET",
                data: {
                    addtime: row["addtime"]
                },
                success: loadData
            });
        };

        const delete_td = document.createElement("td").appendChild(delete_icon);
        tr.appendChild(delete_td);
        table.appendChild(tr);
    }

}

const refresh = () => {
    console.log("Sending refresh request ...");

    $.ajax({
        url: `${SERVER_URL}/load`,
        type: "GET",
        success: loadData
    });
}

document.getElementById("refresh").onclick = refresh;
refresh();