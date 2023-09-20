const express = require("express")
const {Statistics, StatisticsAccounts, StatisticsTransaction} = require("../Models/Statistics.Model")

const my_password = "hammad1122"
const router = express.Router()

function removeItem (_array, item){
    var tempArray = []

    for(var i = 0;i<_array.length;i++){
        if(_array[i] != item){
            tempArray.push(_array[i])
        }
    }
   

    return tempArray
}



router.get("/", async (req, res, next) =>{

    var th_s = ""

    var roll_no_s = []

    

    const statistics = await Statistics.find();
    statistics.forEach(document=>{  

        th_s+= `\n<th>

        <select>
        <option>${document.reason}</option>
        <option>${document.date}</option>
        

        </select>
        </th>`


        document.students.forEach(record =>{
            if(!roll_no_s.includes(record.roll_no)){
                roll_no_s.push(record.roll_no)
            }
        })


    })

    roll_no_s = roll_no_s.sort((a, b) =>a -b);
    var tr_dic = []
    var unpaid_dic = []
    var paid_dic = []
    var total_paid_fine = 0, total_unpaid_fine = 0



    // pre
    roll_no_s.forEach(roll_no=>{
        tr_dic[roll_no] = ""
        unpaid_dic[roll_no] = 0
        paid_dic[roll_no] = 0
    })





    statistics.forEach(document=>{

        var temp_roll_no_s = roll_no_s

        document.students.forEach(record =>{
            if(!record.paid){
                unpaid_dic[record.roll_no] = record.fine+ unpaid_dic[record.roll_no]
                total_unpaid_fine += record.fine

            }else{
                paid_dic[record.roll_no] = record.fine+paid_dic[record.roll_no]
                total_paid_fine += record.fine
            }
            tr_dic[record.roll_no] = tr_dic[record.roll_no]+`\n<td class="${record.paid?"":record.result}">${record.fine}</td>\n`
            // delete temp_roll_no_s[temp_roll_no_s.indexOf(record.roll_no)]
            temp_roll_no_s = removeItem(temp_roll_no_s, record.roll_no)


        })



        // remaining temp roll no add emty so that next document data can be stored in next colum
        temp_roll_no_s.forEach(roll_no=>{
            tr_dic[roll_no] = tr_dic[roll_no]+`\n<td></td>\n`
        })
    })



    // set tables rows
    roll_no_s.forEach(roll_no=>{
        console.log(tr_dic[roll_no]);
        tr_dic[roll_no] = `
        <tr>
        <td class="${unpaid_dic[roll_no]?"unpaid":""}">${roll_no}</td>
        <td class="${unpaid_dic[roll_no]?"unpaid":""}">${unpaid_dic[roll_no]}</td>
        <td class="${paid_dic[roll_no]?"paid":""}">${paid_dic[roll_no]}</td>
        ${tr_dic[roll_no]}
        </tr>

        `
        // tr_dic[roll_no] = tr_dic[roll_no]+`\n</tr>\n\n`
    })


    var tr_s = ""


    // unpaid fine col
    


    roll_no_s.forEach(roll_no=>{
        tr_s+= tr_dic[roll_no]
    })



    // console.log(tr_s)
    res.send(`

    <style>

    table {
        border-collapse: collapse;
        margin: 25px 10;
        border-radius: 20;
        font-size: 0.9em;
        font-family: sans-serif;
        min-width: 400px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
    }
    
    table thead tr {
        background-color: #009879;
        color: #ffffff;
        text-align: left;
        border: 2px solid white;

    }

    .unpaid{
        background: rgb(211, 211, 211);
    }

    .fail{
        rgb(238, 226, 158);
    }
    .absent{
        background: rgb(238, 187, 158);
    }
    
    
    table th,
    table td {
        padding: 12px 15px;
    }
    
    table tbody tr {
        border-bottom: 1px solid #dddddd;
        border: 2px solid white;
    }
    
    table tbody tr:nth-of-type(even) {
        background-color: #f3f3f3;
    }
    
    table tbody tr:last-of-type {
        border-bottom: 2px solid #009879;
    }
    
    table tbody tr.active-row {
        font-weight: bold;
        color: #009879;
    }
    
    tr:hover{
        border: 2px solid #009879;
    
    }
    
    
    </style>












    <table>
    <caption>2nd year ICS Statistics</caption>

    <thead>

    <tr>

    <th>Roll No</th>
    <th>Unpaid</th>
    <th>Paid</th>
    ${th_s}

    

    </tr>

    </thead>


    <tbody>

    
    ${tr_s}
    


    </tbody>
    
    
    
    
    </table>





    Total Paid Fine: ${total_paid_fine}
    Total Unpaid Fine: ${total_unpaid_fine}
    Total Fine: ${total_paid_fine+total_unpaid_fine}
    
    
    
    
    
    
    `)

})
router.get("/insert", (req, res, next) =>{
    res.sendFile(__dirname+"/Files/Statistics_insert.html")
})


router.post("/insert", async (req, res, next) =>{


    console.log(req.body);
    const {password} = req.body

    
    if(password != my_password){
        return res.send("password is not correct")
    }


    try {
    const statistics = new Statistics(req.body)
    const savedStatistics = statistics.save()
    console.log(statistics);
    console.log(savedStatistics);

    if (savedStatistics){
        res.send("success")
    }
    } catch (e) {
        console.log("Error");
        console.log(e);
    }
    
})

// router.get("/home", async(req, res, next) =>{

//     var data = ""

//     const statistics = await Statistics.find()
//     statistics.forEach(element =>{
//         console.log(element.date);
//         data += element+"<br><hr>"
//     })
//     res.send(data)
// })



router.get("/add-amount", (req, res, next) =>{
    res.sendFile(__dirname+"/Files/Statistics_add_amount.html")
})


router.post("/add-amount", async (req, res, next) =>{
    const {students, password} = req.body
    console.log( students)

    if(password != my_password){
        return res.send("password is not correct")
        
    }


    await StatisticsTransaction.insertMany(students)
    students.forEach(async element=>{
        const exist = await StatisticsAccounts.findOne({roll_no:element.roll_no})
        if(exist){

            await StatisticsAccounts.updateOne({roll_no:element.roll_no}, {$inc:{amount: element.amount}})
        }else {
            await new StatisticsAccounts(element).save()
        }
    })






    res.send("success")
})
router.get("/amounts", async(req, res, next) =>{


    const Balances = await StatisticsAccounts.find()

    let tr_s = ""

    Balances.forEach(element=>{
       tr_s+=  `
        <tr>
        <td>${element.roll_no}</td>
        <td>${element.amount}</td>


        </tr>
        `
     })







    res.send(`

    <style>

    table {
        border-collapse: collapse;
        margin: 25px 10;
        border-radius: 20;
        font-size: 0.9em;
        font-family: sans-serif;
        min-width: 400px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
    }
    
    table thead tr {
        background-color: #009879;
        color: #ffffff;
        text-align: left;
        border: 2px solid white;

    }

    .unpaid{
        background: rgb(211, 211, 211);
    }

    .fail{
        rgb(238, 226, 158);
    }
    .absent{
        background: rgb(238, 187, 158);
    }
    
    
    table th,
    table td {
        padding: 12px 15px;
    }
    
    table tbody tr {
        border-bottom: 1px solid #dddddd;
        border: 2px solid white;
    }
    
    table tbody tr:nth-of-type(even) {
        background-color: #f3f3f3;
    }
    
    table tbody tr:last-of-type {
        border-bottom: 2px solid #009879;
    }
    
    table tbody tr.active-row {
        font-weight: bold;
        color: #009879;
    }
    
    tr:hover{
        border: 2px solid #009879;
    
    }
    
    
    </style>












    <table>
    <caption>2nd year ICS Statistics Balances</caption>

    <thead>

    <tr>

    <th>Roll No</th>
    <th>Amount</th>

    

    </tr>

    </thead>


    <tbody>

    
    ${tr_s}
    


    </tbody>
    
    
    
    
    </table>



    <button onclick="deploy()">Deploy</button>



    <script>



    function deploy(){
        var xhr = new XMLHttpRequest();
                        xhr.open("POST", "./deploy-amounts");
                        xhr.setRequestHeader("Accept", "application/json");
                        xhr.setRequestHeader("Content-Type", "application/json");
                        xhr.onreadystatechange = function(){
                            if(xhr.readyState === 4){
                                console.log(xhr.status);
                                console.log(xhr.responseText);
                                window.alert(xhr.responseText)
                            }
                        }

                        xhr.send()
    }





    </script>


    
    
    
    
    
    
    `)

})

router.post("/deploy-amounts", async (req, res, next) =>{

    const deploy= async() =>{

    const statisticsAccounts = await StatisticsAccounts.find()
    const statistics = await Statistics.find()
    statisticsAccounts.forEach(element=>{
        if(element.amount >0){
            statistics.forEach(document=>{
                document.students.forEach(async student=>{
                    // console.log(student.roll_no == element.roll_no && !student.paid && element.amount >= student.amount) 
                        // console.log(student.roll_no, element.roll_no,  !student.paid ,  element.amount,  student.fine);
                    if(student.roll_no == element.roll_no && !student.paid && element.amount >= student.fine){
                        console.log(true);
                        // convert
                        await StatisticsAccounts.updateOne({roll_no: element.roll_no}, {$inc:{amount:-student.fine}})
                        // await Statistics.updateOne({'students.roll_no':student.roll_no}, {
                        //     $set:{
                        //         'students.$.paid': true
                        //     }
                        // },false, true)
                        await Statistics.updateOne(
                            {
                            students: {$elemMatch: student}
                        },
                        {
                            $set:{"students.$.paid": true}
                        }
                        
                        
                        )

                        return deploy()
                    }
                })
            })
            
        }
    })

}


deploy()

res.send("successfully deployed")
})

router.get("/transaction", async (req, res, next) =>{
    const statisticsTransaction = await StatisticsTransaction.find()
    let list = ""
    statisticsTransaction.forEach(element=>{
        list += `
        ${element.time_stamp}     ${element.roll_no}      ${element.amount}
        <hr>
        `
    })

    res.send(list)
})

module.exports = router