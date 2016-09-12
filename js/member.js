module.exports = function(){
    var fs = require('fs');
    var filePath = "./data/member.json";
    var canCreate = true;
    var memberList = read();
    
    this.create = function(account, password){
        if (canCreate == false || memberList[account] != undefined) return false;
        
        memberList[account] = {
            password: password
        };
        
        if ( this.updateList() == true ){
            return true;
        }else{
            delete memberList[account];
            return false;
        }
    }
    
    this.login = function(account, password){
        return (memberList[account] != undefined && memberList[account]["password"] == password);
    }
    
    this.updateList = function(){
        try{
            fs.writeFileSync(filePath, JSON.stringify(memberList), {flag: "w"});
            return true;
        }catch(err){
            console.log(err);
            return false;
        }
    }
    
    function read(){
        try{
            var data = fs.readFileSync(filePath);
            return (data.length > 0)? JSON.parse(fs.readFileSync(filePath)): {};
        }catch(err){
            console.log(err);
            canCreate = false;
        }
    }
}