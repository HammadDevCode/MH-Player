const express = require("express")
const {Statistics} = require("../Models/Statistics.Model")


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

        th_s+= `\n<th>${document.reason}</th>`


        document.students.forEach(record =>{
            if(!roll_no_s.includes(record.roll_no)){
                roll_no_s.push(record.roll_no)
            }
        })


    })

    roll_no_s = roll_no_s.sort((a, b) =>a -b);
    var tr_dic = []
    var unpaid_dic = []



    // pre
    roll_no_s.forEach(roll_no=>{
        tr_dic[roll_no] = ""
        unpaid_dic[roll_no] = 0
    })





    statistics.forEach(document=>{

        var temp_roll_no_s = roll_no_s

        document.students.forEach(record =>{
            if(!record.paid){
                unpaid_dic[record.roll_no] = record.fine+ unpaid_dic[record.roll_no]

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
    ${th_s}

    

    </tr>

    </thead>


    <tbody>

    
    ${tr_s}
    


    </tbody>
    
    
    
    
    </table>`)

})
router.get("/insert", (req, res, next) =>{
    res.sendFile(__dirname+"/Files/Statistics_insert.html")
})


router.post("/insert", async (req, res, next) =>{


    console.log(req.body);
    const {date, reason, total_marks, min_marks, fail_fine, absent_fine, students} = req.body

    


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

router.get("/home", async(req, res, next) =>{

    var data = ""

    const statistics = await Statistics.find()
    statistics.forEach(element =>{
        console.log(element.date);
        data += element+"<br><hr>"
    })
    res.send(data)
})



router.get("/add-amount", (req, res, next) =>{
    res.sendFile(__dirname+"/Files/Statistics_add_amount.html")
})


router.post("/add-amount", (req, res, next) =>{
    const {students, password} = req.body

    if(password == "hammad1122"){
        
    }else{
        res.send("password incorrect")
    }
})


module.exports = router